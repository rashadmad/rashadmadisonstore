"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions, getCacheTag, getCartId } from "./cookies"
import { revalidateTag } from "next/cache"

export async function applyAutomaticShipping() {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart found when calculating shipping.")
  const headers = await getAuthHeaders()
  try {
    const result = await sdk.client.fetch<{ amount: number; local: boolean }>(
      `/store/carts/${cartId}/automatic-shipping`,
      { method: "POST", headers, cache: "no-store" }
    )
    revalidateTag(await getCacheTag("carts"))
    return result
  } catch (error) {
    medusaError(error)
  }
}

export const listCartShippingMethods = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(
      `/store/shipping-options`,
      {
        method: "GET",
        query: {
          cart_id: cartId,
        },
        headers,
        cache: "no-store",
      }
    )
    .then(({ shipping_options }) => shipping_options)
    .catch(medusaError)
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((e) => {
      return null
    })
}
