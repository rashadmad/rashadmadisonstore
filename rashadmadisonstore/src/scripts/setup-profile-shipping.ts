import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"
import { getProfileRate, PROFILE_SHIPPING_CODE, PROFILE_SHIPPING_PROVIDER } from "../lib/profile-shipping"

export default async function setupProfileShipping({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const profiles = await fulfillment.listShippingProfiles({}, { take: null })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id", "fulfillment_providers.id", "fulfillment_sets.id",
      "fulfillment_sets.type", "fulfillment_sets.service_zones.id",
      "fulfillment_sets.service_zones.geo_zones.country_code",
    ],
  })
  const candidates = locations.flatMap((location) =>
    (location.fulfillment_sets ?? []).filter((set) => set?.type === "shipping").flatMap((set) =>
      (set?.service_zones ?? []).filter((zone) =>
        zone?.geo_zones?.some((geo) => geo?.country_code === "us")
      ).map((zone) => ({ location, zone }))
    )
  )
  if (candidates.length !== 1) {
    throw new Error("Automatic USPS setup requires exactly one US shipping service zone. Configure the intended location first.")
  }
  const unknown = profiles.filter((profile) => getProfileRate(profile.name) === undefined)
  if (unknown.length) throw new Error(`Missing rates for profiles: ${unknown.map((profile) => profile.name).join(", ")}`)
  const { location, zone } = candidates[0]
  if (!zone) throw new Error("Missing US service zone.")
  if (!location.fulfillment_providers?.some((provider) => provider?.id === PROFILE_SHIPPING_PROVIDER)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: PROFILE_SHIPPING_PROVIDER },
    })
  }
  const existing = await fulfillment.listShippingOptions(
    {},
    { take: null }
  )
  for (const profile of profiles) {
    if (existing.some((option) =>
      option.provider_id === PROFILE_SHIPPING_PROVIDER &&
      option.service_zone_id === zone.id && option.shipping_profile_id === profile.id
    )) continue
    await createShippingOptionsWorkflow(container).run({
      input: [{
        name: "USPS Shipping (delivery times vary)",
        price_type: "calculated",
        provider_id: PROFILE_SHIPPING_PROVIDER,
        service_zone_id: zone.id,
        shipping_profile_id: profile.id,
        data: { id: PROFILE_SHIPPING_CODE, shipping_profile_id: profile.id },
        type: { code: PROFILE_SHIPPING_CODE, label: "USPS Shipping", description: "Automatic shipping based on product packaging profiles." },
        rules: [
          { attribute: "enabled_in_store", operator: "eq", value: "true" },
          { attribute: "is_return", operator: "eq", value: "false" },
        ],
      }],
    })
    logger.info(`Configured automatic USPS shipping for ${profile.name}.`)
  }
}
