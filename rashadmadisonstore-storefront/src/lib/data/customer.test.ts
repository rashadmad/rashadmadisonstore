jest.mock("@lib/config", () => ({
  sdk: {
    auth: {
      register: jest.fn(),
      login: jest.fn(),
    },
    store: {
      customer: {
        create: jest.fn(),
        createAddress: jest.fn(),
      },
      cart: {
        transferCart: jest.fn(),
      },
    },
  },
}))

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))

jest.mock("./cookies", () => ({
  getAuthHeaders: jest.fn(),
  getCacheOptions: jest.fn(),
  getCacheTag: jest.fn(),
  getCartId: jest.fn(),
  removeAuthToken: jest.fn(),
  removeCartId: jest.fn(),
  setAuthToken: jest.fn(),
  setHasLoggedInBefore: jest.fn(),
}))

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheTag,
  getCartId,
  setAuthToken,
  setHasLoggedInBefore,
} from "./cookies"
import { login, signup } from "./customer"

const mockRegister = sdk.auth.register as jest.Mock
const mockLogin = sdk.auth.login as jest.Mock
const mockCreateCustomer = sdk.store.customer.create as jest.Mock
const mockCreateAddress = sdk.store.customer.createAddress as jest.Mock
const mockTransferCart = sdk.store.cart.transferCart as jest.Mock
const mockRevalidateTag = revalidateTag as jest.Mock
const mockRedirect = redirect as jest.Mock
const mockGetAuthHeaders = getAuthHeaders as jest.Mock
const mockGetCacheTag = getCacheTag as jest.Mock
const mockGetCartId = getCartId as jest.Mock
const mockSetAuthToken = setAuthToken as jest.Mock
const mockSetHasLoggedInBefore = setHasLoggedInBefore as jest.Mock

const createSignupForm = () => {
  const formData = new FormData()
  formData.set("email", "rashad@example.com")
  formData.set("first_name", "Rashad")
  formData.set("last_name", "Madison")
  formData.set("phone", "773320579")
  formData.set("password", "secure-password")
  formData.set("confirm_password", "secure-password")
  return formData
}

const createLoginForm = () => {
  const formData = new FormData()
  formData.set("email", "rashad@example.com")
  formData.set("password", "secure-password")
  return formData
}

describe("customer authentication actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAuthHeaders.mockResolvedValue({ authorization: "Bearer registration-token" })
    mockGetCacheTag.mockResolvedValue("customers-cache-id")
    mockGetCartId.mockResolvedValue(undefined)
    mockCreateAddress.mockResolvedValue({ customer: { id: "customer_1" } })
  })

  it("rejects signup when passwords do not match before calling Medusa", async () => {
    const formData = createSignupForm()
    formData.set("confirm_password", "different-password")

    await expect(signup(null, formData)).resolves.toBe("Passwords do not match")
    expect(mockRegister).not.toHaveBeenCalled()
    expect(mockCreateCustomer).not.toHaveBeenCalled()
  })

  it("registers, authenticates, and returns the new customer", async () => {
    const customer = { id: "customer_1", email: "rashad@example.com" }
    mockRegister.mockResolvedValue("registration-token")
    mockCreateCustomer.mockResolvedValue({ customer })
    mockLogin.mockResolvedValue("login-token")

    await expect(signup(null, createSignupForm())).resolves.toEqual(customer)

    expect(mockRegister).toHaveBeenCalledWith("customer", "emailpass", {
      email: "rashad@example.com",
      password: "secure-password",
    })
    expect(mockCreateCustomer).toHaveBeenCalledWith(
      {
        email: "rashad@example.com",
        first_name: "Rashad",
        last_name: "Madison",
        phone: "773320579",
      },
      {},
      { authorization: "Bearer registration-token" }
    )
    expect(mockLogin).toHaveBeenCalledWith("customer", "emailpass", {
      email: "rashad@example.com",
      password: "secure-password",
    })
    expect(mockSetAuthToken).toHaveBeenNthCalledWith(1, "registration-token")
    expect(mockSetAuthToken).toHaveBeenNthCalledWith(2, "login-token")
    expect(mockSetHasLoggedInBefore).toHaveBeenCalledTimes(1)
    expect(mockCreateAddress).not.toHaveBeenCalled()
    expect(mockRevalidateTag).toHaveBeenCalledWith("customers-cache-id")
  })

  it("creates a default shipping address when optional signup address is provided", async () => {
    const customer = { id: "customer_1", email: "rashad@example.com" }
    const formData = createSignupForm()
    formData.set("shipping_address.company", "Studio")
    formData.set("shipping_address.address_1", "123 Main Street")
    formData.set("shipping_address.address_2", "Unit 4")
    formData.set("shipping_address.city", "Chicago")
    formData.set("shipping_address.province", "IL")
    formData.set("shipping_address.postal_code", "60601")
    formData.set("shipping_address.country_code", "US")
    formData.set("billing_same_as_shipping", "yes")
    mockRegister.mockResolvedValue("registration-token")
    mockCreateCustomer.mockResolvedValue({ customer })
    mockLogin.mockResolvedValue("login-token")

    await expect(signup(null, formData)).resolves.toEqual(customer)

    expect(mockCreateAddress).toHaveBeenCalledWith(
      {
        first_name: "Rashad",
        last_name: "Madison",
        company: "Studio",
        address_1: "123 Main Street",
        address_2: "Unit 4",
        city: "Chicago",
        postal_code: "60601",
        province: "IL",
        country_code: "us",
        phone: "773320579",
        is_default_billing: true,
        is_default_shipping: true,
      },
      {},
      { authorization: "Bearer login-token" }
    )
  })

  it("does not make the shipping address default billing when the checkbox is unchecked", async () => {
    const customer = { id: "customer_1", email: "rashad@example.com" }
    const formData = createSignupForm()
    formData.set("shipping_address.address_1", "123 Main Street")
    formData.set("shipping_address.city", "Chicago")
    formData.set("shipping_address.postal_code", "60601")
    formData.set("shipping_address.country_code", "US")
    mockRegister.mockResolvedValue("registration-token")
    mockCreateCustomer.mockResolvedValue({ customer })
    mockLogin.mockResolvedValue("login-token")

    await expect(signup(null, formData)).resolves.toEqual(customer)

    expect(mockCreateAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        is_default_billing: false,
        is_default_shipping: true,
      }),
      {},
      { authorization: "Bearer login-token" }
    )
  })

  it("asks users to complete partially entered optional address fields", async () => {
    const formData = createSignupForm()
    formData.set("shipping_address.address_1", "123 Main Street")
    mockRegister.mockResolvedValue("registration-token")
    mockCreateCustomer.mockResolvedValue({ customer: { id: "customer_1" } })
    mockLogin.mockResolvedValue("login-token")

    await expect(signup(null, formData)).resolves.toBe(
      "Error: Please complete the optional address fields or leave them blank."
    )
  })

  it("returns an API error when signup fails", async () => {
    mockRegister.mockRejectedValue(new Error("Email is already registered"))

    await expect(signup(null, createSignupForm())).resolves.toBe(
      "Error: Email is already registered"
    )
    expect(mockCreateCustomer).not.toHaveBeenCalled()
  })

  it("logs in, updates customer state, and redirects to the account page", async () => {
    mockLogin.mockResolvedValue("login-token")

    await expect(login(null, createLoginForm())).resolves.toBeUndefined()

    expect(mockLogin).toHaveBeenCalledWith("customer", "emailpass", {
      email: "rashad@example.com",
      password: "secure-password",
    })
    expect(mockSetAuthToken).toHaveBeenCalledWith("login-token")
    expect(mockSetHasLoggedInBefore).toHaveBeenCalledTimes(1)
    expect(mockRevalidateTag).toHaveBeenCalledWith("customers-cache-id")
    expect(mockRedirect).toHaveBeenCalledWith("/account")
  })

  it("returns the Medusa error message and does not redirect when login fails", async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } })

    await expect(login(null, createLoginForm())).resolves.toBe("Invalid credentials")

    expect(mockSetAuthToken).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it("continues to the account page when cart transfer fails after login", async () => {
    mockLogin.mockResolvedValue("login-token")
    mockGetCartId.mockResolvedValue("cart_1")
    mockTransferCart.mockRejectedValue(new Error("Cart is unavailable"))
    const warn = jest.spyOn(console, "warn").mockImplementation()

    await expect(login(null, createLoginForm())).resolves.toBeUndefined()

    expect(mockTransferCart).toHaveBeenCalledWith(
      "cart_1",
      {},
      { authorization: "Bearer registration-token" }
    )
    expect(mockRedirect).toHaveBeenCalledWith("/account")
    warn.mockRestore()
  })
})