import { listProducts } from "@lib/data/products"
import { appCopy } from "@lib/copy"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts?.length) {
    return null
  }

  return (
    <section className="content-container py-10 sm:py-14">
      <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
            Featured collection
          </p>
          <Text className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {collection.title}
          </Text>
        </div>
        <InteractiveLink
          href={`/collections/${collection.handle}`}
          prefetch={false}
          textClassName="text-yellow-300 group-hover:text-white"
          iconClassName="text-yellow-300 group-hover:text-white"
        >
          {appCopy.featuredProducts.collectionCta}
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {pricedProducts.slice(0, 4).map((product) => (
          <li key={product.id} className="[&_p]:text-white/80">
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </section>
  )
}
