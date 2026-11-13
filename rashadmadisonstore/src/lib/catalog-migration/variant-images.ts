import { Product } from "./schema"
import { idKey } from "./plan"

type ImageLink = { id: string; url: string; variants: { id: string }[] }

export function planVariantImageLinks(source: Product, target: Product, images: ImageLink[]) {
  const additions = new Map<string, string[]>()
  const targetVariants = new Map(source.variants.map((variant) => {
    const matches = target.variants.filter((entry) => entry.metadata?.[idKey] === variant.id)
    if (matches.length !== 1) throw new Error(`Expected one migrated variant for ${variant.id}`)
    return [variant.id, matches[0].id]
  }))

  for (const image of source.images) {
    const matches = images.filter((entry) => entry.url === image.url)
    if (matches.length !== 1) throw new Error(`Expected one migrated image for ${image.url}`)
    const targetImage = matches[0]
    const expected = new Set(source.variants
      .filter((variant) => variant.images.some((entry) => entry.id === image.id))
      .map((variant) => targetVariants.get(variant.id)!))
    if (source.variants.length && !expected.size) {
      throw new Error(`Image is not visible on any variant of ${source.handle}: ${image.url}`)
    }
    const existing = new Set(targetImage.variants.map((variant) => variant.id))
    for (const id of existing) {
      if (!expected.has(id)) throw new Error(`Unexpected variant image link for ${source.handle}: ${image.url}`)
    }
    if (!existing.size && expected.size === source.variants.length) continue
    for (const id of expected) {
      if (existing.has(id)) continue
      const add = additions.get(id) ?? []
      add.push(targetImage.id)
      additions.set(id, add)
    }
  }
  return additions
}
