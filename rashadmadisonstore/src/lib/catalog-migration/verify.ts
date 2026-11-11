import { Bundle, Catalog, Product, digest } from "./schema"
import { Entity, Plan, entities, idKey, mapped, withoutProvenance } from "./plan"

const unordered = <T>(rows: T[]) => [...rows].sort((a, b) => digest(a).localeCompare(digest(b)))
const metadata = (value: Record<string, unknown> | null) => withoutProvenance(value)

function normalizedProduct(product: Product, remap: (entity: Entity | "regions", id: string) => string) {
  const { id, metadata: meta, variants, images, options, categories, tags, sales_channels,
    shipping_profile, collection_id, type_id, ...scalars } = product
  return {
    ...scalars, metadata: metadata(meta),
    collection_id: collection_id ? remap("collections", collection_id) : null,
    type_id: type_id ? remap("types", type_id) : null,
    shipping_profile_id: shipping_profile ? remap("profiles", shipping_profile.id) : null,
    categories: unordered(categories.map((ref) => remap("categories", ref.id))),
    tags: unordered(tags.map((ref) => remap("tags", ref.id))),
    sales_channels: unordered(sales_channels.map((ref) => remap("channels", ref.id))),
    images: unordered(images.map((image) => ({ url: image.url, rank: image.rank }))),
    options: unordered(options.map((option) => ({
      title: option.title, values: unordered(option.values.map((value) => value.value)),
    }))),
    variants: unordered(variants.map((variant) => {
      const { id: variantId, metadata: variantMetadata, options: variantOptions,
        images: variantImages, price_set, inventory_items, ...values } = variant
      return {
        ...values, metadata: metadata(variantMetadata),
        options: unordered(variantOptions.map((option) => ({ title: option.option.title, value: option.value }))),
        images: unordered(variantImages.map((image) => image.url)),
        inventory_items: unordered(inventory_items.map((item) => ({
          inventory_item_id: remap("inventory", item.inventory_item_id), required_quantity: item.required_quantity,
        }))),
        prices: unordered((price_set?.prices ?? []).map((price) => ({
          ...price,
          price_rules: unordered(price.price_rules.map((rule) => ({
            ...rule, value: remap("regions", rule.value),
          }))),
        }))),
      }
    })),
  }
}

export function verifyCatalog(bundle: Bundle, destination: Catalog, plan: Plan) {
  const errors: string[] = []
  const remap = (entity: Entity | "regions", id: string) => mapped(plan.maps, entity, id)
  for (const entity of entities) {
    if (plan.create[entity].size) errors.push(`Missing ${plan.create[entity].size} ${entity}`)
    for (const source of bundle.catalog[entity]) {
      if (plan.reused[entity].has(source.id) || plan.create[entity].has(source.id)) continue
      const target = destination[entity].find((row) => row.id === remap(entity, source.id))
      if (!target) {
        errors.push(`Missing ${entity}: ${source.id}`)
        continue
      }
      if (entity === "products") continue
      const normalize = (row: Catalog[Entity][number], sourceSide: boolean) => {
        const { id, metadata: meta, ...values } = row
        const normalized: Record<string, unknown> = { ...values, metadata: metadata(meta) }
        if ("parent_category_id" in row) {
          normalized.parent_category_id = row.parent_category_id && sourceSide
            ? remap("categories", row.parent_category_id) : row.parent_category_id
        }
        if ("sales_channels" in row) {
          normalized.sales_channels = unordered(row.sales_channels.map((ref) =>
            sourceSide ? remap("channels", ref.id) : ref.id))
        }
        if ("location_levels" in row) {
          normalized.location_levels = unordered(row.location_levels.map((level) => ({
            ...level, location_id: sourceSide ? remap("locations", level.location_id) : level.location_id,
          })))
        }
        return normalized
      }
      if (digest(normalize(source, true)) !== digest(normalize(target, false))) {
        errors.push(`Data mismatch in ${entity}: ${source.id}`)
      }
    }
  }
  for (const source of bundle.catalog.products) {
    if (plan.create.products.has(source.id)) continue
    const target = destination.products.find((product) => product.id === remap("products", source.id))
    if (!target) {
      errors.push(`Missing product: ${source.handle}`)
      continue
    }
    if (digest(normalizedProduct(source, remap)) !== digest(normalizedProduct(target, (_, id) => id))) {
      errors.push(`Product data mismatch: ${source.handle} (including variants, prices, inventory links, and images)`)
    }
    const sourceVariantIds = source.variants.map((variant) => variant.id).sort()
    const targetVariantIds = target.variants.map((variant) => variant.metadata?.[idKey]).sort()
    if (JSON.stringify(sourceVariantIds) !== JSON.stringify(targetVariantIds)) {
      errors.push(`Variant provenance mismatch: ${source.handle}`)
    }
  }
  if (errors.length) throw new Error(`Catalog verification failed:\n${errors.join("\n")}`)
}
