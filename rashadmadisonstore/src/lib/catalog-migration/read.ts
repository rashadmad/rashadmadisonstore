import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import {
  catalogSchema, categorySchema, channelSchema, collectionSchema, inventorySchema,
  locationSchema, productSchema, profileSchema, regionSchema, storeSchema, valueSchema,
} from "./schema"

export async function readCatalog(container: ExecArgs["container"], includeAllInventory = false) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fields = (schema: z.AnyZodObject, relations: string[] = []) => [
    ...Object.keys(schema.shape).filter((key) => !relations.some((field) => field.split(".")[0] === key)),
    ...relations,
  ]
  async function all<T>(entity: string, fields: string[], schema: z.ZodType<T>) {
    const rows: T[] = []
    let skip = 0
    for (;;) {
      const { data } = await query.graph({
        entity, fields,
        pagination: { skip, take: 100, order: { id: "ASC" } },
      })
      rows.push(...z.array(schema).parse(data))
      if (data.length < 100) return rows
      skip += data.length
    }
  }
  const stores = await all("store", fields(storeSchema, ["supported_currencies.currency_code", "supported_currencies.is_default"]), storeSchema)
  if (stores.length !== 1) throw new Error("Expected exactly one Medusa store")
  const products = await all("product", fields(productSchema, [
    "categories.id", "tags.id", "sales_channels.id", "shipping_profile.id",
    "images.*", "options.*", "options.values.*", "variants.*",
    "variants.options.*", "variants.options.option.title", "variants.images.*",
    "variants.price_set.prices.*", "variants.price_set.prices.price_rules.*",
    "variants.inventory_items.*",
  ]), productSchema)
  const inventoryIds = new Set(products.flatMap((product) => product.variants
    .flatMap((variant) => variant.inventory_items.map((item) => item.inventory_item_id))))
  return catalogSchema.parse({
    store: stores[0],
    products,
    categories: await all("product_category", fields(categorySchema), categorySchema),
    collections: await all("product_collection", fields(collectionSchema), collectionSchema),
    tags: await all("product_tag", fields(valueSchema), valueSchema),
    types: await all("product_type", fields(valueSchema), valueSchema),
    channels: await all("sales_channel", fields(channelSchema), channelSchema),
    profiles: await all("shipping_profile", fields(profileSchema), profileSchema),
    locations: await all("stock_location", fields(locationSchema, ["address.*", "sales_channels.id"]), locationSchema),
    inventory: (await all("inventory_item", fields(inventorySchema, ["location_levels.*"]), inventorySchema))
      .filter((item) => includeAllInventory || inventoryIds.has(item.id)),
    regions: await all("region", fields(regionSchema, ["countries.iso_2"]), regionSchema),
  })
}
