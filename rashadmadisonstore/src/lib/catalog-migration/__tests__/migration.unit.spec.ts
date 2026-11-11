import { buildPlan, productInput, provenance } from "../plan"
import { digest, sortedCategories, validateCatalog, prepareCatalogForMigration } from "../schema"
import { verifyCatalog } from "../verify"
import { emptyDestination, fixture, importedDestination } from "../fixtures/catalog"

describe("catalog migration planning and verification", () => {
  it("maps production defaults and region IDs without changing production records", () => {
    const bundle = fixture()
    const destination = emptyDestination()
    const before = structuredClone(destination)
    const plan = buildPlan(bundle, destination)
    expect(plan.maps.channels.get("sc-source")).toBe("sc-target")
    expect(plan.maps.profiles.get("sp-source")).toBe("sp-target")
    expect(plan.maps.regions.get("reg-source")).toBe("reg-target")
    expect(plan.create.products.size).toBe(1)
    expect(destination).toEqual(before)
    const input = productInput(bundle, bundle.catalog.products[0], plan.maps)
    expect(input.variants?.[0].prices).toEqual([{
      currency_code: "usd", amount: 19.5, min_quantity: 1, max_quantity: 10,
      rules: { region_id: "reg-target" },
    }])
    expect(input.variants?.[0].inventory_items?.[0].required_quantity).toBe(2)
  })
  it("rejects the source as destination", () => {
    const bundle = fixture()
    expect(() => buildPlan(bundle, bundle.catalog)).toThrow("same store")
  })
  it("omits product types and adds a synthetic option for an optionless product without changing the source", () => {
    const catalog = fixture().catalog
    catalog.products[0].options = []
    catalog.products[0].variants[0].options = []
    const original = structuredClone(catalog)
    const exported = prepareCatalogForMigration(catalog)

    expect(exported.types).toEqual([])
    expect(exported.products.every((product) => product.type_id === null)).toBe(true)
    expect(exported.products[0].options).toEqual([{
      id: "migration-default-option-prod-source", title: "Title", values: [{ value: "Default" }],
    }])
    expect(exported.products[0].variants[0].options).toEqual([{ value: "Default", option: { title: "Title" } }])
    expect(catalog).toEqual(original)
    expect(() => validateCatalog(exported)).not.toThrow()
  })
  it("preserves named shipping profiles rather than mapping custom rates to a generic default", () => {
    const bundle = fixture()
    bundle.catalog.profiles[0].name = "Risograph print"
    expect(buildPlan(bundle, emptyDestination()).create.profiles.size).toBe(1)
  })
  it("hashes JSON metadata consistently when database object keys are reordered", () => {
    expect(digest({ metadata: { z: 1, a: 2 } })).toBe(digest({ metadata: { a: 2, z: 1 } }))
  })
  it("rejects conflicting destination handles without overwriting them", () => {
    const bundle = fixture()
    const destination = emptyDestination()
    destination.products.push({ ...bundle.catalog.products[0], id: "other-product" })
    expect(() => buildPlan(bundle, destination)).toThrow("conflict")
  })
  it("stops for missing currencies or region dependencies", () => {
    const destination = emptyDestination()
    destination.regions = []
    expect(() => buildPlan(fixture(), destination)).toThrow("matching production region")
    destination.store.supported_currencies = []
    expect(() => buildPlan(fixture(), destination)).toThrow("supported currencies")
  })
  it("resumes committed work by source metadata rather than making duplicates", () => {
    const bundle = fixture()
    const destination = emptyDestination()
    const source = bundle.catalog.collections[0]
    destination.collections.push({ ...source, id: "committed", metadata: provenance(bundle, source) })
    const plan = buildPlan(bundle, destination)
    expect(plan.maps.collections.get(source.id)).toBe("committed")
    expect(plan.create.collections.size).toBe(0)
    bundle.catalog.collections[0].title = "Changed"
    expect(() => buildPlan(bundle, destination)).toThrow("Snapshot changed")
  })
  it("rejects reservations and unsupported price-list data rather than dropping it", () => {
    const bundle = fixture()
    bundle.catalog.inventory[0].location_levels[0].reserved_quantity = 1
    expect(() => validateCatalog(bundle.catalog)).toThrow("reservations")
    bundle.catalog.inventory[0].location_levels[0].reserved_quantity = 0
    bundle.catalog.products[0].variants[0].price_set!.prices[0].price_list_id = "price-list"
    expect(() => validateCatalog(bundle.catalog)).toThrow("price list")
  })
  it("sorts parents before children and rejects invalid category hierarchies", () => {
    expect(sortedCategories([...fixture().catalog.categories].reverse()).map((row) => row.id))
      .toEqual(["cat-parent", "cat-child"])
    expect(() => sortedCategories([{ id: "cat", parent_category_id: "cat" }])).toThrow("cycle")
  })
  it("verifies remapped data and catches price, stock, and variant-image changes", () => {
    const bundle = fixture()
    const { catalog } = importedDestination(bundle)
    expect(() => verifyCatalog(bundle, catalog, buildPlan(bundle, catalog))).not.toThrow()
    catalog.products[0].variants[0].price_set!.prices[0].amount = 999
    expect(() => verifyCatalog(bundle, catalog, buildPlan(bundle, catalog))).toThrow("Product data mismatch")
    catalog.products[0].variants[0].price_set!.prices[0].amount = 19.5
    catalog.inventory[0].location_levels[0].stocked_quantity = 99
    expect(() => verifyCatalog(bundle, catalog, buildPlan(bundle, catalog))).toThrow("inventory")
    catalog.inventory[0].location_levels[0].stocked_quantity = 12
    catalog.products[0].variants[0].images = []
    expect(() => verifyCatalog(bundle, catalog, buildPlan(bundle, catalog))).toThrow("Product data mismatch")
  })
})
