import { Bundle, Catalog, bundleSchema, catalogSchema } from "../schema"
import { Maps, entities, provenance } from "../plan"

export function fixture(): Bundle {
  return bundleSchema.parse({
    version: 1, cloudfront_origin: "https://example.cloudfront.net", media: [],
    catalog: {
      store: {
        id: "store-source", default_sales_channel_id: "sc-source", default_location_id: "loc-source",
        supported_currencies: [{ currency_code: "usd", is_default: true }],
      },
      channels: [{ id: "sc-source", name: "Default Sales Channel", is_disabled: false }],
      profiles: [{ id: "sp-source", name: "Default Shipping Profile", type: "default" }],
      locations: [{ id: "loc-source", name: "Warehouse", address: null, sales_channels: [{ id: "sc-source" }] }],
      categories: [
        { id: "cat-parent", name: "Art", handle: "art", description: "", is_active: true, is_internal: false, rank: 0, parent_category_id: null },
        { id: "cat-child", name: "Prints", handle: "prints", description: "", is_active: true, is_internal: false, rank: 0, parent_category_id: "cat-parent" },
      ],
      collections: [{ id: "col-source", title: "Prints", handle: "prints" }],
      tags: [{ id: "tag-source", value: "Art" }], types: [{ id: "type-source", value: "Print" }],
      inventory: [{
        id: "inv-source", sku: "PRINT", title: "Print", requires_shipping: true,
        location_levels: [{ location_id: "loc-source", stocked_quantity: "12", incoming_quantity: 2, reserved_quantity: 0 }],
      }],
      regions: [{ id: "reg-source", name: "United States", currency_code: "usd", countries: [{ iso_2: "us" }] }],
      products: [{
        id: "prod-source", title: "Print", handle: "print", status: "published",
        is_giftcard: false, discountable: true,
        collection_id: "col-source", type_id: "type-source",
        categories: [{ id: "cat-child" }], tags: [{ id: "tag-source" }],
        sales_channels: [{ id: "sc-source" }], shipping_profile: { id: "sp-source" },
        thumbnail: "http://localhost:9000/static/image.png",
        images: [{ id: "img-source", url: "http://localhost:9000/static/image.png", rank: 0 }],
        options: [{ id: "opt-source", title: "Size", values: [{ value: "Small" }] }],
        variants: [{
          id: "variant-source", title: "Small", sku: "PRINT", variant_rank: 0,
          allow_backorder: false, manage_inventory: true,
          options: [{ value: "Small", option: { title: "Size" } }],
          images: [{ id: "img-source", url: "http://localhost:9000/static/image.png", rank: 0 }],
          inventory_items: [{ inventory_item_id: "inv-source", required_quantity: 2 }],
          price_set: { prices: [{
            currency_code: "usd", amount: "19.50", min_quantity: 1, max_quantity: 10,
            price_rules: [{ attribute: "region_id", value: "reg-source" }],
          }] },
        }],
      }],
    },
  })
}

export function emptyDestination(): Catalog {
  return catalogSchema.parse({
    store: {
      id: "store-target", default_sales_channel_id: "sc-target", default_location_id: null,
      supported_currencies: [{ currency_code: "usd", is_default: true }],
    },
    products: [], categories: [], collections: [], tags: [], types: [], locations: [], inventory: [],
    channels: [{ id: "sc-target", name: "Default Sales Channel", is_disabled: false }],
    profiles: [{ id: "sp-target", name: "Default Shipping Profile", type: "default" }],
    regions: [{ id: "reg-target", name: "US", currency_code: "usd", countries: [{ iso_2: "us" }] }],
  })
}

export function importedDestination(bundle: Bundle): { catalog: Catalog; maps: Maps } {
  const catalog = structuredClone(bundle.catalog)
  catalog.store = emptyDestination().store
  const maps: Maps = {
    categories: new Map(), collections: new Map(), tags: new Map(), types: new Map(),
    channels: new Map(), profiles: new Map(), locations: new Map(), inventory: new Map(),
    products: new Map(), regions: new Map(),
  }
  for (const entity of entities) {
    for (const row of catalog[entity]) {
      const old = structuredClone(row)
      maps[entity].set(row.id, `${row.id}-target`)
      row.id = `${row.id}-target`
      row.metadata = provenance(bundle, old)
    }
  }
  for (const row of catalog.regions) {
    maps.regions.set(row.id, `${row.id}-target`)
    row.id = `${row.id}-target`
  }
  catalog.store.default_sales_channel_id = maps.channels.get(bundle.catalog.store.default_sales_channel_id!)!
  for (const row of catalog.categories) {
    if (row.parent_category_id) row.parent_category_id = maps.categories.get(row.parent_category_id)!
  }
  for (const row of catalog.locations) {
    row.sales_channels.forEach((ref) => { ref.id = maps.channels.get(ref.id)! })
  }
  for (const row of catalog.inventory) {
    row.location_levels.forEach((level) => { level.location_id = maps.locations.get(level.location_id)! })
  }
  for (const row of catalog.products) {
    row.collection_id = row.collection_id ? maps.collections.get(row.collection_id)! : null
    row.type_id = row.type_id ? maps.types.get(row.type_id)! : null
    row.categories.forEach((ref) => { ref.id = maps.categories.get(ref.id)! })
    row.tags.forEach((ref) => { ref.id = maps.tags.get(ref.id)! })
    row.sales_channels.forEach((ref) => { ref.id = maps.channels.get(ref.id)! })
    row.shipping_profile = { id: maps.profiles.get(row.shipping_profile!.id)! }
    row.options.forEach((option) => { option.id += "-target" })
    row.images.forEach((image) => { image.id += "-target" })
    for (const variant of row.variants) {
      variant.metadata = provenance(bundle, structuredClone(variant))
      variant.id += "-target"
      variant.images.forEach((image) => { image.id += "-target" })
      variant.inventory_items.forEach((item) => { item.inventory_item_id = maps.inventory.get(item.inventory_item_id)! })
      variant.price_set?.prices.forEach((price) =>
        price.price_rules.forEach((rule) => { rule.value = maps.regions.get(rule.value)! }))
    }
  }
  return { catalog, maps }
}
