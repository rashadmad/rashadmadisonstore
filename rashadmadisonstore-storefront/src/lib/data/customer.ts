"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setHasLoggedInBefore,
  setAuthToken,
} from "./cookies"

const getActionErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const typedError = error as {
      message?: string
      response?: { data?: { message?: string } }
    }

    return (
      typedError.response?.data?.message ||
      typedError.message ||
      "Unable to sign in. Please try again."
    )
  }

  if (typeof error === "string") {
    return error
  }

  return "Unable to sign in. Please try again."
}

const getSafeRedirectPath = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/account"
  }

  return value
}

const getFormString = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

const getOptionalAddress = (
  formData: FormData,
  prefix: "billing_address" | "shipping_address",
  customerForm: { first_name: string; last_name: string; phone: string }
) => {
  const address_1 = getFormString(formData, `${prefix}.address_1`)
  const city = getFormString(formData, `${prefix}.city`)
  const postal_code = getFormString(formData, `${prefix}.postal_code`)
  const country_code = getFormString(formData, `${prefix}.country_code`).toLowerCase()

  if (!address_1 && !city && !postal_code && !country_code) {
    return null
  }

  if (!address_1 || !city || !postal_code || country_code.length !== 2) {
    throw new Error("Please complete the optional address fields or leave them blank.")
  }

  return {
    first_name: customerForm.first_name,
    last_name: customerForm.last_name,
    company: getFormString(formData, `${prefix}.company`),
    address_1,
    address_2: getFormString(formData, `${prefix}.address_2`),
    city,
    postal_code,
    province: getFormString(formData, `${prefix}.province`),
    country_code,
    phone: customerForm.phone,
  }
}

const createSignupAddresses = async (
  formData: FormData,
  customerForm: { first_name: string; last_name: string; phone: string },
  headers: { authorization: string }
) => {
  const billingAddress = getOptionalAddress(formData, "billing_address", customerForm)
  const shippingMatchesBilling = formData.get("shipping_same_as_billing") !== "no"
  const shippingAddress = shippingMatchesBilling
    ? billingAddress
    : getOptionalAddress(formData, "shipping_address", customerForm)

  if (billingAddress) {
    await sdk.store.customer.createAddress(
      {
        ...billingAddress,
        is_default_billing: true,
        is_default_shipping: shippingMatchesBilling,
      },
      {},
      headers
    )
  }

  if (shippingAddress && !shippingMatchesBilling) {
    await sdk.store.customer.createAddress(
      {
        ...shippingAddress,
        is_default_billing: false,
        is_default_shipping: true,
      },
      {},
      headers
    )
  }
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (password !== confirmPassword) {
    return "Passwords do not match"
  }

  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)
    await setHasLoggedInBefore()

    await createSignupAddresses(formData, customerForm, {
      authorization: `Bearer ${loginToken}`,
    })

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = getSafeRedirectPath(formData.get("redirect_to"))

  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(token as string)
    await setHasLoggedInBefore()
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
  } catch (error) {
    return getActionErrorMessage(error)
  }

  try {
    await transferCart()
  } catch (error) {
    // A stale guest cart should not block successful customer authentication.
    console.warn("Unable to transfer cart after login", error)
  }

  redirect(redirectTo)
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
