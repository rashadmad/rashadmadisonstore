import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { getProfileShippingQuote, PROFILE_SHIPPING_PROVIDER } from "../../lib/profile-shipping"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  if (cart.completed_at || !cart.items.some((item) => item.requires_shipping)) {
    return new StepResponse()
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { charges } = await getProfileShippingQuote(query, cart.id)
  if (!Object.keys(charges).length) return new StepResponse()
  const { data: options } = await query.graph({
    entity: "shipping_options",
    filters: { id: cart.shipping_methods.map((method) => method.shipping_option_id) },
    fields: ["id", "provider_id", "shipping_profile_id"],
  })
  const seen = new Set<string>()
  for (const method of cart.shipping_methods) {
    const option = options.find((entry) => entry.id === method.shipping_option_id)
    const profileId = option?.shipping_profile_id
    if (
      !option || option.provider_id !== PROFILE_SHIPPING_PROVIDER ||
      !profileId || seen.has(profileId) || charges[profileId] === undefined ||
      Math.round(Number(method.amount) * 100) !== charges[profileId]
    ) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shipping has changed. Return to Delivery to recalculate it.")
    }
    seen.add(profileId)
  }
  if (seen.size !== Object.keys(charges).length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Return to Delivery to calculate shipping for all products.")
  }
  return new StepResponse()
})
