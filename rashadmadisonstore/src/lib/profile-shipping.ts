import { MedusaError } from "@medusajs/framework/utils"
import { Query } from "@medusajs/framework/types"
import { isChicagoAreaAddress } from "./chicago-shipping"

export const PROFILE_SHIPPING_PROVIDER = "profile-shipping_profile-shipping"
export const PROFILE_SHIPPING_CODE = "automatic-usps"

// USD cents. These are packaging rates, not live USPS postage quotes.
export const PROFILE_RATES: Record<string, number> = {
  "Risograph print": 950,
  "Risograph Print tabloid": 950,
  "ScreenPrint stretched": 2200,
  "ScreenPrint framed": 2650,
  "Risograph Print Framed": 1400,
  "Small Bag": 625,
  bag: 575,
}

export function getProfileRate(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ").toLowerCase()
  const entry = Object.entries(PROFILE_RATES).find(
    ([key]) => key.toLowerCase() === normalized
  )
  return entry?.[1]
}

type ShippingItem = {
  id: string
  profileId: string
  rate: number
  quantity: number
}

export function allocateProfileShipping(items: ShippingItem[]) {
  const charges: Record<string, number> = {}
  let position = 0
  for (const item of [...items].sort(
    (a, b) => b.rate - a.rate || a.profileId.localeCompare(b.profileId) || a.id.localeCompare(b.id)
  )) {
    if (
      !Number.isSafeInteger(item.rate) || item.rate < 0 ||
      !Number.isSafeInteger(item.quantity) || item.quantity < 1
    ) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid shipping rate or item quantity.")
    }
    // Whole groups of three always cost one full plus one half rate.
    const groups = Math.floor(item.quantity / 3)
    let amount = groups * (item.rate + Math.round(item.rate / 2))
    for (let i = 0; i < item.quantity % 3; i++) {
      const multiplier = [1, 0.5, 0][(position + i) % 3]
      amount += Math.round(item.rate * multiplier)
    }
    charges[item.profileId] = (charges[item.profileId] ?? 0) + amount
    position += item.quantity
  }
  return charges
}

export async function getProfileShippingQuote(query: Pick<Query, "graph">, cartId: string) {
  const { data: carts } = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: [
      "id", "currency_code", "completed_at", "shipping_address.*",
      "items.id", "items.quantity", "items.requires_shipping",
      "items.variant.product.shipping_profile.id",
      "items.variant.product.shipping_profile.name",
      "shipping_methods.id", "shipping_methods.shipping_option_id", "shipping_methods.amount",
    ],
  })
  const cart = carts[0]
  if (!cart || cart.completed_at) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "An active cart is required.")
  }
  if (
    cart.currency_code !== "usd" ||
    cart.shipping_address?.country_code?.toLowerCase() !== "us" ||
    !cart.shipping_address.postal_code?.trim()
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Enter a United States shipping address and ZIP code to calculate shipping."
    )
  }
  const items: ShippingItem[] = []
  for (const item of cart.items ?? []) {
    if (!item?.requires_shipping) continue
    const profile = item.variant?.product?.shipping_profile
    const rate = profile ? getProfileRate(profile.name) : undefined
    if (!profile || rate === undefined) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A product has no configured shipping-profile rate. Please contact the store."
      )
    }
    items.push({ id: item.id, profileId: profile.id, rate, quantity: Number(item.quantity) })
  }
  const charges = allocateProfileShipping(items)
  const local = isChicagoAreaAddress(cart.shipping_address)
  if (local) {
    for (const id of Object.keys(charges)) charges[id] = 0
  }
  return { cart, charges, local }
}
