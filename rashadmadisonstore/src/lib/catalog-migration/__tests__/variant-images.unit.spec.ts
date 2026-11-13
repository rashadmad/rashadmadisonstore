import { fixture, importedDestination } from "../fixtures/catalog"
import { planVariantImageLinks } from "../variant-images"

function products() {
  const bundle = fixture()
  const product = bundle.catalog.products[0]
  const shared = { id: "shared", url: "https://example.com/shared.png", rank: 1 }
  product.images.push(shared)
  product.variants[0].images.push(shared)
  product.variants.push({
    ...structuredClone(product.variants[0]),
    id: "variant-large", title: "Large", sku: "LARGE",
    images: [shared],
  })
  return { source: product, target: importedDestination(bundle).catalog.products[0] }
}

describe("variant image migration", () => {
  it("adds explicit links for variant-specific images while leaving general images shared", () => {
    const { source, target } = products()
    const images = target.images.map((image) => ({ id: image.id, url: image.url, variants: [] }))
    const additions = planVariantImageLinks(source, target, images)
    expect([...additions]).toEqual([[target.variants[0].id, [target.images[0].id]]])
  })

  it("resumes without duplicating existing links", () => {
    const { source, target } = products()
    const images = target.images.map((image, index) => ({
      id: image.id, url: image.url,
      variants: index === 0 ? [{ id: target.variants[0].id }] : [],
    }))
    expect(planVariantImageLinks(source, target, images).size).toBe(0)
  })

  it("rejects unexpected existing links instead of removing them", () => {
    const { source, target } = products()
    const images = target.images.map((image, index) => ({
      id: image.id, url: image.url,
      variants: index === 0 ? [{ id: target.variants[1].id }] : [],
    }))
    expect(() => planVariantImageLinks(source, target, images)).toThrow("Unexpected variant image link")
  })
})
