import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import {
  batchVariantImagesWorkflow, createCollectionsWorkflow, createInventoryItemsWorkflow,
  createProductCategoriesWorkflow, createProductsWorkflow, createProductTagsWorkflow,
  createProductTypesWorkflow, createSalesChannelsWorkflow, createShippingProfilesWorkflow,
  createStockLocationsWorkflow, linkSalesChannelsToStockLocationWorkflow, updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolve } from "node:path"
import { readCatalog } from "../lib/catalog-migration/read"
import { loadBundle, verifyMedia } from "../lib/catalog-migration/media"
import { buildPlan, entities, mapped, productInput, provenance } from "../lib/catalog-migration/plan"
import { sortedCategories } from "../lib/catalog-migration/schema"
import { verifyCatalog } from "../lib/catalog-migration/verify"
import { planVariantImageLinks } from "../lib/catalog-migration/variant-images"

export default async function importCatalog({ container, args }: ExecArgs) {
  const [directory, mode = "plan"] = args
  if (!directory || args.length > 2 || !["plan", "apply", "verify"].includes(mode)) {
    throw new Error("Usage: npm run catalog:import -- <bundle-directory> [plan|apply|verify]")
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bundle = await loadBundle(resolve(directory))
  const source = bundle.catalog
  const destination = await readCatalog(container, true)
  const plan = buildPlan(bundle, destination)
  for (const entity of entities) {
    const rows = plan.create[entity]
    logger.info(`${entity}: ${rows.size} to create; ${plan.maps[entity].size - rows.size} mapped existing records`)
  }
  if (mode === "plan") {
    logger.info("Dry run only. No catalog records, files, admin accounts, or API keys were changed.")
    return
  }
  if (mode === "verify") {
    verifyCatalog(bundle, destination, plan)
    await verifyMedia(bundle)
    logger.info("Catalog data and migrated CloudFront image checksums verified.")
    return
  }
  if (process.env.CATALOG_MIGRATION_ALLOW_WRITE !== "true") {
    throw new Error("Import requires CATALOG_MIGRATION_ALLOW_WRITE=true and apply mode")
  }
  // Verify delivery before creating any product URLs that depend on it.
  await verifyMedia(bundle)
  for (const row of source.channels) {
    if (!plan.create.channels.has(row.id)) continue
    const data = {
      name: row.name, description: row.description, is_disabled: row.is_disabled,
      metadata: provenance(bundle, row),
    }
    const { result } = await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [data] } })
    plan.maps.channels.set(row.id, result[0].id)
  }
  for (const row of source.profiles) {
    if (!plan.create.profiles.has(row.id)) continue
    const data = { name: row.name, type: row.type, metadata: provenance(bundle, row) }
    const { result } = await createShippingProfilesWorkflow(container).run({ input: { data: [data] } })
    plan.maps.profiles.set(row.id, result[0].id)
  }
  for (const row of source.collections) {
    if (!plan.create.collections.has(row.id)) continue
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [{ title: row.title, handle: row.handle, metadata: provenance(bundle, row) }] },
    })
    plan.maps.collections.set(row.id, result[0].id)
  }
  for (const row of source.tags) {
    if (!plan.create.tags.has(row.id)) continue
    const data = { value: row.value, metadata: provenance(bundle, row) }
    const { result } = await createProductTagsWorkflow(container).run({
      input: { product_tags: [data] },
    })
    plan.maps.tags.set(row.id, result[0].id)
  }
  for (const row of source.types) {
    if (!plan.create.types.has(row.id)) continue
    const { result } = await createProductTypesWorkflow(container).run({
      input: { product_types: [{ value: row.value, metadata: provenance(bundle, row) }] },
    })
    plan.maps.types.set(row.id, result[0].id)
  }
  for (const row of sortedCategories([...source.categories].sort((a, b) => a.rank - b.rank))) {
    if (!plan.create.categories.has(row.id)) continue
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{
        name: row.name, handle: row.handle, description: row.description,
        is_active: row.is_active, is_internal: row.is_internal, rank: row.rank,
        parent_category_id: row.parent_category_id ? mapped(plan.maps, "categories", row.parent_category_id) : undefined,
        metadata: provenance(bundle, row),
      }] },
    })
    plan.maps.categories.set(row.id, result[0].id)
  }
  for (const row of source.locations) {
    if (!plan.create.locations.has(row.id)) continue
    const address = row.address ? {
      address_1: row.address.address_1, address_2: row.address.address_2 ?? undefined,
      company: row.address.company ?? undefined, city: row.address.city ?? undefined,
      country_code: row.address.country_code, province: row.address.province ?? undefined,
      postal_code: row.address.postal_code ?? undefined, phone: row.address.phone ?? undefined,
    } : undefined
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: row.name, address, metadata: provenance(bundle, row) }] },
    })
    plan.maps.locations.set(row.id, result[0].id)
  }
  for (const row of source.locations) {
    const locationId = mapped(plan.maps, "locations", row.id)
    const existing = destination.locations.find((location) => location.id === locationId)
    const add = row.sales_channels.map((ref) => mapped(plan.maps, "channels", ref.id))
      .filter((id) => !existing?.sales_channels.some((ref) => ref.id === id))
    if (add.length) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: locationId, add } })
    }
  }
  for (const row of source.inventory) {
    if (!plan.create.inventory.has(row.id)) continue
    const { id, location_levels, ...data } = row
    const { result } = await createInventoryItemsWorkflow(container).run({
      input: { items: [{
        ...data, metadata: provenance(bundle, row),
        location_levels: location_levels.map((level) => ({
          location_id: mapped(plan.maps, "locations", level.location_id),
          stocked_quantity: level.stocked_quantity, incoming_quantity: level.incoming_quantity,
        })),
      }] },
    })
    plan.maps.inventory.set(row.id, result[0].id)
  }
  for (const row of source.products) {
    if (!plan.create.products.has(row.id)) continue
    const { result } = await createProductsWorkflow(container).run({
      input: { products: [productInput(bundle, row, plan.maps)] },
    })
    plan.maps.products.set(row.id, result[0].id)
    logger.info(`Created product: ${row.handle}`)
  }
  const created = await readCatalog(container, true)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  for (const sourceProduct of source.products) {
    const target = created.products.find((product) => product.id === mapped(plan.maps, "products", sourceProduct.id))
    if (!target) throw new Error(`Created product not found: ${sourceProduct.handle}`)
    if (!sourceProduct.images.length) continue
    const { data } = await query.graph({
      entity: "product_image",
      fields: ["id", "url", "variants.id"],
      filters: { id: target.images.map((image) => image.id) },
    })
    const images = z.array(z.object({
      id: z.string(), url: z.string(), variants: z.array(z.object({ id: z.string() })),
    })).parse(data)
    for (const [variant_id, add] of planVariantImageLinks(sourceProduct, target, images)) {
      await batchVariantImagesWorkflow(container).run({ input: { variant_id, add } })
    }
  }
  const defaults: { default_sales_channel_id?: string; default_location_id?: string } = {}
  if (!destination.store.default_sales_channel_id && source.store.default_sales_channel_id) {
    defaults.default_sales_channel_id = mapped(plan.maps, "channels", source.store.default_sales_channel_id)
  }
  if (!destination.store.default_location_id && source.store.default_location_id) {
    defaults.default_location_id = mapped(plan.maps, "locations", source.store.default_location_id)
  }
  if (Object.keys(defaults).length) {
    await updateStoresWorkflow(container).run({ input: { selector: { id: destination.store.id }, update: defaults } })
  }
  const final = await readCatalog(container, true)
  verifyCatalog(bundle, final, buildPlan(bundle, final))
  logger.info(`Verified ${source.products.length} products and ${source.inventory.length} inventory items. Admin accounts and publishable keys were not modified.`)
  logger.info("Before opening checkout: link the production publishable key to imported sales channels and configure regions, taxes, stock-location fulfillment, and shipping options. These settings are not migrated.")
}
