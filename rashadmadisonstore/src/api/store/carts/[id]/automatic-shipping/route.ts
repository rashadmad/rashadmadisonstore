import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  addShippingMethodToCartWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
} from "@medusajs/medusa/core-flows"
import { getProfileShippingQuote, PROFILE_SHIPPING_PROVIDER } from "../../../../../lib/profile-shipping"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const quote = await getProfileShippingQuote(
    req.scope.resolve(ContainerRegistrationKeys.QUERY), req.params.id
  )
  if (!Object.keys(quote.charges).length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No shippable products in the cart.")
  }
  const { result: available } = await listShippingOptionsForCartWithPricingWorkflow(req.scope).run({
    input: { cart_id: req.params.id },
  })
  const options = Object.keys(quote.charges).map((profileId) => {
    const matches = available.filter(
      (option) => option.provider_id === PROFILE_SHIPPING_PROVIDER &&
        option.shipping_profile_id === profileId
    )
    if (matches.length !== 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "USPS shipping is not configured uniquely for every product. Please contact the store."
      )
    }
    return { id: matches[0].id }
  })
  await addShippingMethodToCartWorkflow(req.scope).run({
    input: { cart_id: req.params.id, options },
  })
  const saved = await getProfileShippingQuote(
    req.scope.resolve(ContainerRegistrationKeys.QUERY), req.params.id
  )
  res.json({
    amount: saved.cart.shipping_methods.reduce(
      (sum, method) => sum + Math.round(Number(method?.amount ?? 0) * 100), 0
    ) / 100,
    local: saved.local,
  })
}
