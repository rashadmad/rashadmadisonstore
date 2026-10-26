import {
  CreateShippingOptionRuleDTO,
  ExecArgs,
  ShippingOptionDTO,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  RuleOperator,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  CHICAGO_FREE_SHIPPING_CODE,
  CHICAGO_FREE_SHIPPING_RULE,
} from "../lib/chicago-shipping"

type ShippingSource = {
  option: Pick<
    ShippingOptionDTO,
    "service_zone_id" | "shipping_profile_id" | "provider_id" | "data"
  >
  rules: Omit<CreateShippingOptionRuleDTO, "shipping_option_id">[]
}

async function initializeLocalShipping(
  container: ExecArgs["container"]
): Promise<ShippingSource[]> {
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "fulfillment_providers.id",
      "fulfillment_sets.id",
      "sales_channels.id",
    ],
  })
  if (locations.length !== 1) {
    throw new Error(
      "Automatic Chicago shipping setup requires exactly one stock location. Configure a US manual shipping option for the intended location, then rerun."
    )
  }
  const location = locations[0]
  const channels = container.resolve(Modules.SALES_CHANNEL)
  const store = container.resolve(Modules.STORE)
  const [stores, salesChannels, profiles] = await Promise.all([
    store.listStores(),
    channels.listSalesChannels({}, { take: 2 }),
    fulfillment.listShippingProfiles({}, { take: null }),
  ])
  const channelId =
    stores[0]?.default_sales_channel_id ??
    (salesChannels.length === 1 ? salesChannels[0].id : undefined)
  if (!channelId || !profiles.length) {
    throw new Error(
      "Configure a default sales channel and product shipping profiles before setting up Chicago free shipping."
    )
  }
  if (!location.sales_channels?.some((channel) => channel?.id === channelId)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [channelId] },
    })
  }
  if (
    !location.fulfillment_providers?.some(
      (provider) => provider?.id === "manual_manual"
    )
  ) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })
  }
  const setName = "Chicago local shipping"
  const existingSets = await fulfillment.listFulfillmentSets(
    { name: setName },
    { relations: ["service_zones"] }
  )
  const set =
    existingSets[0] ??
    (await fulfillment.createFulfillmentSets({
      name: setName,
      type: "shipping",
      service_zones: [
        {
          name: "Chicago-area delivery",
          geo_zones: [{ type: "country", country_code: "us" }],
        },
      ],
    }))
  if (!location.fulfillment_sets?.some((entry) => entry?.id === set.id)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
    })
  }
  const zone = set.service_zones[0]
  if (!zone) {
    throw new Error(
      "Chicago local shipping fulfillment set has no service zone."
    )
  }
  return profiles.map((profile) => ({
    option: {
      service_zone_id: zone.id,
      shipping_profile_id: profile.id,
      provider_id: "manual_manual",
      data: null,
    },
    rules: [],
  }))
}

function copyRule(rule: {
  attribute: string
  operator: string
  value: unknown
}): Omit<CreateShippingOptionRuleDTO, "shipping_option_id"> {
  const operator = Object.values(RuleOperator).find(
    (operator) => operator === rule.operator
  )
  const value = rule.value
  if (
    !operator ||
    !(
      typeof value === "string" ||
      (Array.isArray(value) &&
        value.every((entry) => typeof entry === "string"))
    )
  ) {
    throw new Error(`Unsupported shipping rule for ${rule.attribute}.`)
  }
  return { attribute: rule.attribute, operator, value }
}

export default async function setupChicagoShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const options: ShippingOptionDTO[] = []
  let skip = 0
  let count: number

  do {
    const [page, total] = await fulfillment.listAndCountShippingOptions(
      {},
      {
        relations: [
          "type",
          "rules",
          "service_zone.fulfillment_set",
          "service_zone.geo_zones",
        ],
        skip,
        take: 100,
      }
    )
    options.push(...page)
    count = total
    skip += page.length
  } while (skip < count)

  const existing = new Set(
    options
      .filter((option) => option.type?.code === CHICAGO_FREE_SHIPPING_CODE)
      .map(
        (option) => `${option.service_zone_id}:${option.shipping_profile_id}`
      )
  )
  let sourceOptions: ShippingSource[] = options
    .filter(
      (option) =>
        option.provider_id === "manual_manual" &&
        option.type?.code !== CHICAGO_FREE_SHIPPING_CODE &&
        option.service_zone.fulfillment_set.type === "shipping" &&
        option.service_zone.geo_zones.some(
          (zone) => zone.country_code.toLowerCase() === "us"
        )
    )
    .map((option) => ({ option, rules: option.rules.map(copyRule) }))
    .filter(
      ({ rules }) =>
        !rules.some(
          (rule) =>
            (rule.attribute === "is_return" && rule.value === "true") ||
            (rule.attribute === "enabled_in_store" && rule.value === "false")
        )
    )

  if (!options.length) {
    sourceOptions = await initializeLocalShipping(container)
  } else if (!sourceOptions.length && !existing.size) {
    throw new Error(
      "Chicago free shipping requires an existing US shipping option using the manual_manual provider. Configure it in Medusa Admin, then rerun this command."
    )
  }

  for (const { option, rules } of sourceOptions) {
    const key = `${option.service_zone_id}:${option.shipping_profile_id}`
    if (existing.has(key)) {
      continue
    }

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Free Local Shipping - Eligible Chicago-Area ZIP Codes",
          price_type: "flat",
          provider_id: option.provider_id,
          service_zone_id: option.service_zone_id,
          shipping_profile_id: option.shipping_profile_id,
          data: option.data ?? undefined,
          type: {
            label: "Free local shipping",
            description:
              "Free shipping to Chicago and eligible ZIP codes in Cook, DuPage, Kane, Lake, McHenry, and Will counties.",
            code: CHICAGO_FREE_SHIPPING_CODE,
          },
          prices: [{ currency_code: "usd", amount: 0 }],
          rules: [
            ...rules.filter(
              (rule) =>
                ![
                  "enabled_in_store",
                  "is_return",
                  CHICAGO_FREE_SHIPPING_RULE,
                ].includes(rule.attribute)
            ),
            { attribute: "enabled_in_store", operator: "eq", value: "true" },
            { attribute: "is_return", operator: "eq", value: "false" },
            {
              attribute: CHICAGO_FREE_SHIPPING_RULE,
              operator: "eq",
              value: "true",
            },
          ],
        },
      ],
    })
    existing.add(key)
    logger.info(`Created Chicago free shipping for ${key}.`)
  }

  logger.info(
    "Chicago free shipping is configured. Existing paid shipping options are unchanged."
  )
}
