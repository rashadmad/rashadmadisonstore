import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnimatedImage from "@modules/common/components/animated-image"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getPricesForVariant } from "@lib/util/get-product-price"

const CLOUDINARY_FALLBACK_IMAGES = [
  "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784665145/7034_akrxuz.jpg",
  "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784772775/africanPrincess_atuxqk.jpg",
  "https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342820/tenderhead_vgseur.jpg",
  "https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342819/prince_dczlzy.jpg",
  "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784773272/ZuluHusband_mr2por.png",
]

const getVariantSearchText = (variant: any) => {
  const optionValues =
    variant?.options?.map((opt: any) => opt?.value).filter(Boolean).join(" ") || ""

  return `${variant?.title || ""} ${variant?.sku || ""} ${optionValues}`.toLowerCase()
}

const getPriceColumns = (product: HttpTypes.StoreProduct) => {
  const labels = [
    { title: "Small print", matcher: /small/ },
    { title: "Medium print", matcher: /medium/ },
    { title: "Large print", matcher: /large/ },
  ]

  const pricedVariants = (product.variants || []).filter(
    (variant: any) => !!variant?.calculated_price?.calculated_amount
  )

  const byPrice = [...pricedVariants].sort(
    (a: any, b: any) =>
      a.calculated_price.calculated_amount - b.calculated_price.calculated_amount
  )

  return labels.map((label, index) => {
    const matched = pricedVariants.find((variant: any) =>
      label.matcher.test(getVariantSearchText(variant))
    )

    const fallback = byPrice[index]
    const selected = matched || fallback
    const selectedPrice = selected ? getPricesForVariant(selected) : null

    return {
      title: label.title,
      value: selectedPrice?.calculated_price || "Unavailable",
    }
  })
}

const getBentoImages = (product: HttpTypes.StoreProduct) => {
  const variantImages =
    product.variants
      ?.flatMap((variant: any) =>
        (variant?.images || []).map((image: any) => image?.url)
      )
      .filter(Boolean) || []

  const productImages =
    (product.images || []).map((image: any) => image?.url).filter(Boolean) || []

  const imagePool = [product.thumbnail, ...productImages, ...variantImages].filter(Boolean) as string[]
  const cloudinaryOnly = imagePool.filter((url) => url.includes("res.cloudinary.com"))
  const unique = Array.from(new Set(cloudinaryOnly.length > 0 ? cloudinaryOnly : CLOUDINARY_FALLBACK_IMAGES))

  const padded = [...unique]
  while (padded.length < 5) {
    padded.push(unique[padded.length % unique.length])
  }

  return padded.slice(0, 5)
}

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  void sortBy
  void page

  let products: HttpTypes.StoreProduct[] = []
  let productsLoadError = false

  try {
    const {
      response: { products: collectionProducts },
    } = await listProducts({
      countryCode,
      queryParams: {
        collection_id: collection.id,
        limit: 100,
      },
    })

    products = collectionProducts
  } catch {
    products = []
    productsLoadError = true
  }

  const collectionDescription =
    typeof collection?.metadata?.description === "string"
      ? collection.metadata.description
      : null

  return (
    <div className="content-container py-10 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl font-semibold text-ui-fg-base sm:text-4xl">
          {collection.title}
        </h1>
        {collectionDescription ? (
          <p className="mt-4 max-w-3xl text-base leading-7 text-ui-fg-subtle sm:text-lg">
            {collectionDescription}
          </p>
        ) : null}
      </div>

      {productsLoadError ? (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 sm:p-5">
          <p className="text-sm font-medium">
            Product details are temporarily unavailable, but the collection page is still visible.
          </p>
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="space-y-10 sm:space-y-14">
          {products.map((product) => {
            const priceColumns = getPriceColumns(product)
            const bentoImages = getBentoImages(product)
            const productDescription =
              product.description ||
              collectionDescription ||
              "This product line celebrates craftsmanship, culture, and storytelling through original artwork and curated prints."

            return (
              <section
                key={product.id}
                className="rounded-2xl border border-ui-border-base bg-white p-5 shadow-sm sm:p-8"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
                  <div className="order-1 lg:order-2 lg:col-span-6">
                    <div className="grid h-[290px] grid-cols-6 grid-rows-2 gap-2 sm:h-[380px] sm:gap-3">
                      <AnimatedImage
                        src={bentoImages[0]}
                        alt={`${product.title} image 1`}
                        wrapperClassName="col-span-3 row-span-2 h-full w-full rounded-xl"
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[1]}
                        alt={`${product.title} image 2`}
                        wrapperClassName="col-span-3 row-span-1 h-full w-full rounded-xl"
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[2]}
                        alt={`${product.title} image 3`}
                        wrapperClassName="col-start-4 row-start-2 h-full w-full rounded-xl"
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[3]}
                        alt={`${product.title} image 4`}
                        wrapperClassName="col-start-5 row-start-2 h-full w-full rounded-xl"
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[4]}
                        alt={`${product.title} image 5`}
                        wrapperClassName="col-start-6 row-start-2 h-full w-full rounded-xl"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                  </div>

                  <div className="order-2 lg:order-1 lg:col-span-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-ui-fg-base sm:text-3xl">
                        {product.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {priceColumns.map((column) => (
                        <div
                          key={`${product.id}-${column.title}`}
                          className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 sm:p-4"
                        >
                          <p className="text-xs font-medium uppercase tracking-wide text-ui-fg-subtle">
                            {column.title}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-ui-fg-base sm:text-base">
                            {column.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-lg border border-ui-border-base p-4 sm:p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-ui-fg-subtle">
                        Description
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-ui-fg-subtle sm:text-base">
                        {productDescription}
                      </p>
                    </div>

                    <div className="mt-6">
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                      >
                        View product
                      </LocalizedClientLink>
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      ) : !productsLoadError ? (
        <p className="text-base text-ui-fg-subtle">No products found in this collection yet.</p>
      ) : null}

      <div className="mt-12">
        <LocalizedClientLink
          href="/gallery"
          className="text-sm font-semibold text-green-600 hover:text-green-500"
        >
          Back to all galleries
        </LocalizedClientLink>
      </div>
    </div>
  )
}
