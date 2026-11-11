import { z } from "@medusajs/framework/zod"
import { createHash } from "node:crypto"

const metadata = z.record(z.unknown()).nullable().default(null)
const text = z.string().nullable().default(null)
const number = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
  .transform(Number).pipe(z.number().finite())
const dimensions = {
  weight: number.nullable().default(null),
  length: number.nullable().default(null),
  height: number.nullable().default(null),
  width: number.nullable().default(null),
  hs_code: text, origin_country: text, mid_code: text, material: text,
}
const identity = { id: z.string().min(1), metadata }
const reference = z.object({ id: z.string().min(1) })
const image = z.object({ id: z.string(), url: z.string().url(), rank: z.number().default(0) })
const price = z.object({
  currency_code: z.string().min(1),
  amount: number,
  min_quantity: number.nullable().default(null),
  max_quantity: number.nullable().default(null),
  price_list_id: text,
  price_rules: z.array(z.object({ attribute: z.string(), value: z.string() })),
})

export const productSchema = z.object({
  ...identity, ...dimensions,
  title: z.string().min(1), handle: z.string().min(1),
  subtitle: text, description: text, thumbnail: text, external_id: text,
  status: z.enum(["draft", "proposed", "published", "rejected"]),
  is_giftcard: z.boolean(), discountable: z.boolean(),
  collection_id: text, type_id: text,
  categories: z.array(reference), tags: z.array(reference),
  sales_channels: z.array(reference),
  shipping_profile: reference.nullable().default(null),
  images: z.array(image),
  options: z.array(z.object({
    id: z.string(), title: z.string(),
    values: z.array(z.object({ value: z.string() })),
  })),
  variants: z.array(z.object({
    ...identity, ...dimensions,
    title: z.string(), sku: text, barcode: text, ean: text, upc: text,
    thumbnail: text, variant_rank: z.number().nullable().default(null),
    allow_backorder: z.boolean(), manage_inventory: z.boolean(),
    options: z.array(z.object({
      value: z.string(), option: z.object({ title: z.string() }),
    })),
    images: z.array(image),
    price_set: z.object({ prices: z.array(price) }).nullable().default(null),
    inventory_items: z.array(z.object({
      inventory_item_id: z.string(), required_quantity: number,
    })),
  })),
})

export const categorySchema = z.object({
  ...identity, name: z.string(), handle: z.string(),
  description: z.string(), is_active: z.boolean(), is_internal: z.boolean(),
  rank: z.number(), parent_category_id: text,
})
export const collectionSchema = z.object({ ...identity, title: z.string(), handle: z.string() })
export const valueSchema = z.object({ ...identity, value: z.string() })
export const channelSchema = z.object({
  ...identity, name: z.string(), description: text, is_disabled: z.boolean(),
})
export const profileSchema = z.object({
  ...identity, name: z.string(), type: z.string(),
})
export const locationSchema = z.object({
  ...identity, name: z.string(),
  address: z.object({
    address_1: z.string(), address_2: text, company: text,
    city: text, country_code: z.string(), province: text,
    postal_code: text, phone: text,
  }).nullable(),
  sales_channels: z.array(reference),
})
export const inventorySchema = z.object({
  ...identity, ...dimensions,
  sku: text, title: text, description: text, thumbnail: text,
  requires_shipping: z.boolean(),
  location_levels: z.array(z.object({
    location_id: z.string(), stocked_quantity: number,
    incoming_quantity: number, reserved_quantity: number,
  })),
})
export const regionSchema = z.object({
  id: z.string(), name: z.string(), currency_code: z.string(),
  countries: z.array(z.object({ iso_2: z.string() })),
})
export const storeSchema = z.object({
  id: z.string(), default_sales_channel_id: text, default_location_id: text,
  supported_currencies: z.array(z.object({
    currency_code: z.string(), is_default: z.boolean(),
  })),
})
export const catalogSchema = z.object({
  store: storeSchema,
  products: z.array(productSchema),
  categories: z.array(categorySchema),
  collections: z.array(collectionSchema),
  tags: z.array(valueSchema), types: z.array(valueSchema),
  channels: z.array(channelSchema), profiles: z.array(profileSchema),
  locations: z.array(locationSchema), inventory: z.array(inventorySchema),
  regions: z.array(regionSchema),
})
export const mediaSchema = z.object({
  key: z.string().regex(/^catalog\/[a-f0-9]{64}\.(jpg|png|webp|gif|avif)$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  size: z.number().int().positive().max(30 * 1024 * 1024),
  content_type: z.string(),
})
export const bundleSchema = z.object({
  version: z.literal(1),
  cloudfront_origin: z.string().url(),
  catalog: catalogSchema,
  media: z.array(mediaSchema),
})
export type Catalog = z.infer<typeof catalogSchema>
export type Product = z.infer<typeof productSchema>
export type Bundle = z.infer<typeof bundleSchema>
export type Media = z.infer<typeof mediaSchema>

export function prepareCatalogForMigration(catalog: Catalog): Catalog {
  return {
    ...catalog,
    types: [],
    products: catalog.products.map((product) => {
      const withoutType = { ...product, type_id: null }
      if (product.options.length) return withoutType
      if (product.variants.length !== 1 || product.variants[0].options.length) {
        throw new Error(`Cannot add a default option to product "${product.handle}" unless it has exactly one optionless variant`)
      }
      return {
        ...withoutType,
        options: [{ id: `migration-default-option-${product.id}`, title: "Title", values: [{ value: "Default" }] }],
        variants: [{
          ...product.variants[0],
          options: [{ value: "Default", option: { title: "Title" } }],
        }],
      }
    }),
  }
}

export function digest(value: unknown) {
  const json = JSON.stringify(value, (_, entry: unknown) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left.localeCompare(right)))
      : entry)
  return createHash("sha256").update(json).digest("hex")
}

export function origin(value: string) {
  const url = new URL(value)
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("CloudFront URL must be an HTTPS origin without credentials or a path")
  }
  return url.origin
}

export function validateCatalog(catalog: Catalog) {
  const missing: string[] = []
  const assertIds = (rows: { id: string }[], name: string) => {
    if (new Set(rows.map((row) => row.id)).size !== rows.length) {
      throw new Error(`Duplicate ${name} IDs`)
    }
  }
  for (const [name, rows] of Object.entries(catalog)) {
    if (Array.isArray(rows)) assertIds(rows, name)
  }
  const requireRef = (id: string | null, rows: { id: string }[], name: string) => {
    if (id && !rows.some((row) => row.id === id)) {
      missing.push(`Missing ${name} reference: ${id}`)
    }
  }
  for (const category of catalog.categories) {
    requireRef(category.parent_category_id, catalog.categories, "category parent")
  }
  sortedCategories(catalog.categories)
  for (const item of catalog.inventory) {
    for (const level of item.location_levels) {
      requireRef(level.location_id, catalog.locations, "stock location")
      if (level.reserved_quantity !== 0) {
        throw new Error(`Inventory ${item.id} has reservations. Resolve local reservations before exporting.`)
      }
    }
  }
  for (const location of catalog.locations) {
    location.sales_channels.forEach((ref) => requireRef(ref.id, catalog.channels, "sales channel"))
  }
  requireRef(catalog.store.default_sales_channel_id, catalog.channels, "default sales channel")
  requireRef(catalog.store.default_location_id, catalog.locations, "default stock location")
  const handles = new Set<string>()
  for (const product of catalog.products) {
    if (handles.has(product.handle)) throw new Error(`Duplicate product handle: ${product.handle}`)
    handles.add(product.handle)
    requireRef(product.collection_id, catalog.collections, `collection for product "${product.handle}"`)
    requireRef(product.type_id, catalog.types, `type for product "${product.handle}"`)
    requireRef(product.shipping_profile?.id ?? null, catalog.profiles, "shipping profile")
    product.categories.forEach((ref) => requireRef(ref.id, catalog.categories, "category"))
    product.tags.forEach((ref) => requireRef(ref.id, catalog.tags, "tag"))
    product.sales_channels.forEach((ref) => requireRef(ref.id, catalog.channels, "sales channel"))
    const options = new Map(product.options.map((option) => [
      option.title, new Set(option.values.map((value) => value.value)),
    ]))
    if (!options.size) throw new Error(`Product ${product.handle} has no options`)
    if (options.size !== product.options.length) throw new Error(`Duplicate option titles: ${product.handle}`)
    for (const variant of product.variants) {
      if (variant.manage_inventory && !variant.inventory_items.length) {
        throw new Error(`Managed variant ${variant.id} has no inventory items`)
      }
      if (!variant.manage_inventory && variant.inventory_items.length) {
        throw new Error(`Unmanaged variant ${variant.id} has inventory links that cannot be recreated`)
      }
      variant.inventory_items.forEach((item) => requireRef(item.inventory_item_id, catalog.inventory, "inventory"))
      for (const option of variant.options) {
        if (!options.get(option.option.title)?.has(option.value)) {
          throw new Error(`Invalid variant option in ${product.handle}: ${option.option.title}`)
        }
        if (missing.length) throw new Error(`Catalog has missing references:\n${[...new Set(missing)].join("\n")}`)
      }
      for (const image of variant.images) {
        if (!product.images.some((entry) => entry.id === image.id)) {
          throw new Error(`Variant image ${image.id} is missing from product ${product.handle}`)
        }
      }
      for (const price of variant.price_set?.prices ?? []) {
        if (price.price_list_id) {
          throw new Error(`Variant ${variant.id} uses a price list. Catalog migration excludes promotions/price lists.`)
        }
        for (const rule of price.price_rules) {
          if (rule.attribute !== "region_id") {
            throw new Error(`Unsupported price rule on ${variant.id}: ${rule.attribute}`)
          }
          requireRef(rule.value, catalog.regions, "price region")
        }
      }
    }
  }
}

export function sortedCategories<T extends { id: string; parent_category_id: string | null }>(categories: T[]) {
  const result: T[] = []
  const remaining = [...categories]
  while (remaining.length) {
    const index = remaining.findIndex((category) =>
      !category.parent_category_id || result.some((parent) => parent.id === category.parent_category_id)
    )
    if (index === -1) throw new Error("Category hierarchy contains a cycle or missing parent")
    result.push(...remaining.splice(index, 1))
  }
  return result
}
