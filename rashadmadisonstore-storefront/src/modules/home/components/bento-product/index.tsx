import { StripeGalleryProduct } from "@lib/data/stripe-products"

type BentoProductGridProps = {
  products: StripeGalleryProduct[]
}

const PLACEHOLDER_IMAGE = "/placeholder-art.jpg"

const getBentoImages = (images: string[]) => {
  const normalized = images.filter(Boolean)

  if (normalized.length === 0) {
    return Array.from({ length: 5 }).map(() => PLACEHOLDER_IMAGE)
  }

  return Array.from({ length: 5 }).map(
    (_, index) => normalized[index % normalized.length] || PLACEHOLDER_IMAGE
  )
}

const BentoProductGrid = ({ products }: BentoProductGridProps) => {
  return (
    <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {products.map((product) => {
        const bentoImages = getBentoImages(product.images)

        return (
          <li
            key={product.id}
            className="rounded-2xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="grid h-[300px] grid-cols-6 grid-rows-2 gap-2 sm:h-[360px]">
              <img
                src={bentoImages[0]}
                alt={`${product.name} image 1`}
                className="col-span-3 row-span-2 h-full w-full rounded-xl object-cover"
              />
              <img
                src={bentoImages[1]}
                alt={`${product.name} image 2`}
                className="col-span-3 row-span-1 h-full w-full rounded-xl object-cover"
              />
              <img
                src={bentoImages[2]}
                alt={`${product.name} image 3`}
                className="col-start-4 row-start-2 h-full w-full rounded-xl object-cover"
              />
              <img
                src={bentoImages[3]}
                alt={`${product.name} image 4`}
                className="col-start-5 row-start-2 h-full w-full rounded-xl object-cover"
              />
              <img
                src={bentoImages[4]}
                alt={`${product.name} image 5`}
                className="col-start-6 row-start-2 h-full w-full rounded-xl object-cover"
              />
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-semibold text-ui-fg-base">{product.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-ui-fg-subtle">
                {product.description ||
                  "Original artwork and curated prints available to purchase."}
              </p>
              <p className="mt-3 text-sm font-semibold text-green-700">{product.displayPrice}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default BentoProductGrid