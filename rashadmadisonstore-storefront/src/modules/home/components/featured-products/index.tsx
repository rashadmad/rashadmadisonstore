import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  const organizedCollections = [...collections].sort((first, second) =>
    first.title.localeCompare(second.title, undefined, { sensitivity: "base" })
  )

  return organizedCollections.map((collection) => (
    <li key={collection.id} className="border-t border-white/15 first:border-t-0">
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
