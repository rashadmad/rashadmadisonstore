import { Bundle, Catalog, Product, digest, sortedCategories, validateCatalog } from "./schema"
import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"

export const sourceKey = "catalog_migration_source"
export const idKey = "catalog_migration_id"
export const digestKey = "catalog_migration_digest"
export const entities = ["categories", "collections", "tags", "types", "channels", "profiles", "locations", "inventory", "products"] as const
export type Entity = typeof entities[number]
type Row = { id: string; metadata: Record<string, unknown> | null }
export type Maps = Record<Entity | "regions", Map<string, string>>
export type Plan = {
  maps: Maps
  create: Record<Entity, Set<string>>
  reused: Record<Entity, Set<string>>
}

export function provenance(bundle: Bundle, row: Row) {
  return {
    ...row.metadata,
    [sourceKey]: bundle.catalog.store.id,
    [idKey]: row.id,
    [digestKey]: digest(row),
  }
}
export function withoutProvenance(metadata: Record<string, unknown> | null) {
  if (!metadata) return null
  const result = { ...metadata }
  delete result[sourceKey]
  delete result[idKey]
  delete result[digestKey]
  return Object.keys(result).length ? result : null
}
export function mapped(maps: Maps, entity: Entity | "regions", id: string) {
  const target = maps[entity].get(id)
  if (!target) throw new Error(`Missing ${entity} mapping for ${id}`)
  return target
}

function naturalKey(entity: Entity, row: Catalog[Entity][number]) {
  if ("handle" in row) return row.handle
  if ("value" in row) return row.value
  if ("name" in row) return row.name
  if ("sku" in row) return row.sku
  return null
}

export function buildPlan(bundle: Bundle, destination: Catalog): Plan {
  const source = bundle.catalog
  validateCatalog(source)
  if (source.store.id === destination.store.id) {
    throw new Error("Source and destination are the same store. Refusing to import into the source.")
  }
  const maps: Maps = {
    categories: new Map(), collections: new Map(), tags: new Map(), types: new Map(),
    channels: new Map(), profiles: new Map(), locations: new Map(), inventory: new Map(),
    products: new Map(), regions: new Map(),
  }
  const create: Plan["create"] = {
    categories: new Set(), collections: new Set(), tags: new Set(), types: new Set(),
    channels: new Set(), profiles: new Set(), locations: new Set(), inventory: new Set(), products: new Set(),
  }
  const reused: Plan["reused"] = {
    categories: new Set(), collections: new Set(), tags: new Set(), types: new Set(),
    channels: new Set(), profiles: new Set(), locations: new Set(), inventory: new Set(), products: new Set(),
  }
  const defaultChannel = destination.channels.find((row) => row.id === destination.store.default_sales_channel_id)
  if (defaultChannel && source.store.default_sales_channel_id && defaultChannel.metadata?.[sourceKey] !== source.store.id) {
    if (defaultChannel.is_disabled) throw new Error("Destination's default sales channel is disabled")
    maps.channels.set(source.store.default_sales_channel_id, defaultChannel.id)
    reused.channels.add(source.store.default_sales_channel_id)
  }
  for (const row of source.profiles.filter((row) => row.type === "default")) {
    const defaultProfiles = destination.profiles.filter((profile) => profile.type === "default" && profile.name === row.name)
    if (defaultProfiles.length > 1) throw new Error("Destination has ambiguous default shipping profiles")
    if (defaultProfiles.length === 1 && defaultProfiles[0].metadata?.[sourceKey] !== source.store.id) {
      maps.profiles.set(row.id, defaultProfiles[0].id)
      reused.profiles.add(row.id)
    }
  }
  for (const entity of entities) {
    for (const row of destination[entity]) {
      if (row.metadata?.[sourceKey] === source.store.id &&
          !source[entity].some((entry) => entry.id === row.metadata?.[idKey])) {
        throw new Error(`Destination ${entity} contains a record from another snapshot of this source. Resume with the original snapshot.`)
      }
    }
    const sourceNaturalKeys = new Set<string>()
    for (const row of source[entity]) {
      if (maps[entity].has(row.id)) continue
      const natural = naturalKey(entity, row)
      if (natural && sourceNaturalKeys.has(natural)) {
        throw new Error(`Ambiguous source ${entity}: ${natural}`)
      }
      if (natural) sourceNaturalKeys.add(natural)
      const owned = destination[entity].filter((target) =>
        target.metadata?.[sourceKey] === source.store.id && target.metadata?.[idKey] === row.id)
      if (owned.length > 1) throw new Error(`Duplicate migration records for ${entity} ${row.id}`)
      if (owned.length) {
        if (owned[0].metadata?.[digestKey] !== digest(row)) {
          throw new Error(`Snapshot changed for ${entity} ${row.id}. Resume with the original immutable snapshot.`)
        }
        maps[entity].set(row.id, owned[0].id)
        continue
      }
      if (natural && destination[entity].some((target) => naturalKey(entity, target) === natural)) {
        throw new Error(`Destination ${entity} conflict: ${natural}. No existing record will be overwritten.`)
      }
      maps[entity].set(row.id, `planned:${entity}:${row.id}`)
      create[entity].add(row.id)
    }
  }
  if (destination.products.some((row) => row.metadata?.[sourceKey] !== source.store.id)) {
    throw new Error("Destination contains unrelated products. This initial migration requires an empty or previously migrated catalog.")
  }
  const skus = new Set<string>()
  for (const product of source.products) {
    for (const variant of product.variants) {
      if (variant.sku && skus.has(variant.sku)) throw new Error(`Duplicate source variant SKU: ${variant.sku}`)
      if (variant.sku) skus.add(variant.sku)
      for (const price of variant.price_set?.prices ?? []) {
        if (!destination.store.supported_currencies.some((currency) => currency.currency_code === price.currency_code)) {
          throw new Error(`Enable ${price.currency_code} in the production store's supported currencies before importing`)
        }
        for (const rule of price.price_rules) {
          const region = source.regions.find((entry) => entry.id === rule.value)!
          const countries = region.countries.map((country) => country.iso_2).sort().join(",")
          const matches = destination.regions.filter((entry) =>
            entry.currency_code === region.currency_code &&
            entry.countries.map((country) => country.iso_2).sort().join(",") === countries)
          if (matches.length !== 1) {
            throw new Error(`Configure one matching production region for "${region.name}" (${region.currency_code}, ${countries}) before importing`)
          }
          maps.regions.set(region.id, matches[0].id)
        }
      }
    }
  }
  sortedCategories(source.categories)
  return { maps, create, reused }
}

export function productInput(bundle: Bundle, product: Product, maps: Maps): CreateProductWorkflowInputDTO {
  const dimensions = (row: Product | Product["variants"][number]) => ({
    weight: row.weight ?? undefined, length: row.length ?? undefined,
    height: row.height ?? undefined, width: row.width ?? undefined,
    hs_code: row.hs_code ?? undefined, origin_country: row.origin_country ?? undefined,
    mid_code: row.mid_code ?? undefined, material: row.material ?? undefined,
  })
  const variants = [...product.variants].sort((a, b) => (a.variant_rank ?? 0) - (b.variant_rank ?? 0)).map((variant) => ({
    ...dimensions(variant),
    title: variant.title, sku: variant.sku ?? undefined,
    barcode: variant.barcode ?? undefined, ean: variant.ean ?? undefined, upc: variant.upc ?? undefined,
    thumbnail: variant.thumbnail ?? undefined, variant_rank: variant.variant_rank,
    allow_backorder: variant.allow_backorder, manage_inventory: variant.manage_inventory,
    metadata: provenance(bundle, variant),
    options: Object.fromEntries(variant.options.map((option) => [option.option.title, option.value])),
    inventory_items: variant.inventory_items.map((item) => ({
      inventory_item_id: mapped(maps, "inventory", item.inventory_item_id),
      required_quantity: item.required_quantity,
    })),
    prices: (variant.price_set?.prices ?? []).map((price) => ({
      currency_code: price.currency_code, amount: price.amount,
      min_quantity: price.min_quantity ?? undefined, max_quantity: price.max_quantity ?? undefined,
      rules: Object.fromEntries(price.price_rules.map((rule) => [
        rule.attribute, mapped(maps, "regions", rule.value),
      ])),
    })),
  }))
  const images = [...product.images].sort((a, b) => a.rank - b.rank).map((image) => ({
    url: image.url, rank: image.rank,
  }))
  return {
    ...dimensions(product),
    title: product.title, handle: product.handle,
    subtitle: product.subtitle ?? undefined, description: product.description ?? undefined,
    external_id: product.external_id ?? undefined,
    thumbnail: product.thumbnail ?? undefined, status: product.status,
    is_giftcard: product.is_giftcard, discountable: product.discountable,
    metadata: provenance(bundle, product),
    collection_id: product.collection_id ? mapped(maps, "collections", product.collection_id) : undefined,
    type_id: product.type_id ? mapped(maps, "types", product.type_id) : undefined,
    category_ids: product.categories.map((ref) => mapped(maps, "categories", ref.id)),
    tag_ids: product.tags.map((ref) => mapped(maps, "tags", ref.id)),
    sales_channels: product.sales_channels.map((ref) => ({ id: mapped(maps, "channels", ref.id) })),
    shipping_profile_id: product.shipping_profile ? mapped(maps, "profiles", product.shipping_profile.id) : undefined,
    options: product.options.map((option) => ({
      title: option.title, values: option.values.map((value) => value.value),
    })),
    images, variants,
  }
}
