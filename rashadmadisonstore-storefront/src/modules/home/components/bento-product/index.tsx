import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import AnimatedImage from "@modules/common/components/animated-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BentoProductGridProps = {
  products: HttpTypes.StoreProduct[]
}

type BentoTile = {
  src: string
  name: string
  handle: string
  price: string
}

const PLACEHOLDER_IMAGE = "/images/placeHolderProfile.png"

const getPrice = (product: HttpTypes.StoreProduct) =>
  getProductPrice({ product }).cheapestPrice?.calculated_price || "Price available on request"

const getBentoTiles = (products: HttpTypes.StoreProduct[]) => {
  const targetTileCount = products.length > 3 ? Math.min(12, products.length * 2) : 5
  const pools = products.map((product) => ({
    product,
    images: Array.from(new Set((product.images ?? []).map((image) => image.url).filter(Boolean))),
  }))
  const imageCount = pools.reduce((total, pool) => total + pool.images.length, 0)
  const maxTiles = Math.max(5, Math.min(targetTileCount, imageCount))
  const selected: BentoTile[] = []

  while (selected.length < maxTiles) {
    let addedImage = false

    for (const pool of pools) {
      const image = pool.images.shift()
      if (!image) continue

      selected.push({
        src: image,
        name: pool.product.title,
        handle: pool.product.handle,
        price: getPrice(pool.product),
      })
      addedImage = true
      if (selected.length === maxTiles) break
    }

    if (!addedImage) break
  }

  while (selected.length < maxTiles) {
    const product = products[selected.length % products.length]
    selected.push({
      src: PLACEHOLDER_IMAGE,
      name: product?.title || "Untitled",
      handle: product?.handle || "untitled",
      price: product ? getPrice(product) : "Price available on request",
    })
  }

  return selected
}

const normalizeLabel = (value: string) => value.trim().toLowerCase()

const tileLayout = [
  { wrapper: "col-span-3 row-span-2 h-full w-full", position: "object-[50%_18%]" },
  { wrapper: "col-span-3 row-span-1 h-full w-full", position: "object-[50%_22%]" },
  { wrapper: "col-start-4 row-start-2 h-full w-full", position: "object-[50%_24%]" },
  { wrapper: "col-start-5 row-start-2 h-full w-full", position: "object-[50%_24%]" },
  { wrapper: "col-start-6 row-start-2 h-full w-full", position: "object-[50%_24%]" },
] as const

const renderTile = (tile: BentoTile, alt: string, index: number, key: string) => (
  <div key={key} className={`relative ${tileLayout[index]?.wrapper || "aspect-square h-full w-full"}`}>
    <LocalizedClientLink href={`/products/${tile.handle}`} className="block h-full w-full">
      <AnimatedImage
        src={tile.src}
        alt={alt}
        wrapperClassName="h-full w-full"
        className={`h-full w-full object-cover ${tileLayout[index]?.position || "object-[50%_22%]"}`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 py-2 sm:px-3">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-xs">
          {tile.name}
        </p>
        <p className="text-[11px] font-bold text-yellow-300 sm:text-xs">{tile.price}</p>
      </div>
    </LocalizedClientLink>
  </div>
)

export default function BentoProductGrid({ products }: BentoProductGridProps) {
  const grouped = products.reduce<
    Record<string, { category: string; collection: string; products: HttpTypes.StoreProduct[] }>
  >((groups, product) => {
    const category = (product as any).categories?.[0]?.name || "Uncategorized"
    const collection = product.collection?.title || "Uncollected"
    const key = `${normalizeLabel(category)}::${normalizeLabel(collection)}`

    groups[key] ||= { category, collection, products: [] }
    groups[key].products.push(product)
    return groups
  }, {})

  const sections = Object.values(grouped).sort((a, b) =>
    `${a.category} ${a.collection}`.localeCompare(`${b.category} ${b.collection}`, undefined, {
      sensitivity: "base",
    })
  )

  return (
    <div className="space-y-12 sm:space-y-16">
      {sections.map((section) => {
        const tiles = getBentoTiles(section.products)
        const primaryTiles = tiles.slice(0, 5)
        const extraTiles = tiles.slice(5)

        return (
          <section key={`${section.category}-${section.collection}`} className="space-y-8">
            <h2 className="text-2xl font-semibold uppercase tracking-wide text-ui-fg-base sm:text-3xl">
              {section.category}
            </h2>
            <div className="w-full rounded-3xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6">
              <div className="overflow-hidden rounded-2xl">
                <div className="grid h-[360px] grid-cols-6 grid-rows-2 gap-1 bg-white sm:h-[440px] lg:h-[520px]">
                  {primaryTiles.map((tile, index) =>
                    renderTile(tile, `${section.collection} image ${index + 1}`, index, `${section.collection}-${index}`)
                  )}
                </div>
                {extraTiles.length > 0 ? (
                  <div className="mt-1 grid grid-cols-2 gap-1 bg-white sm:grid-cols-3 lg:grid-cols-4">
                    {extraTiles.map((tile, index) => (
                      <div key={`${section.collection}-extra-${index}`} className="relative aspect-square h-full w-full">
                        <LocalizedClientLink href={`/products/${tile.handle}`} className="block h-full w-full">
                          <AnimatedImage
                            src={tile.src}
                            alt={`${section.collection} image ${index + 6}`}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-cover object-[50%_22%]"
                          />
                        </LocalizedClientLink>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <h4 className="mt-5 text-xl font-semibold uppercase tracking-wide text-ui-fg-base sm:text-2xl">
                {section.collection}
              </h4>
            </div>
          </section>
        )
      })}
    </div>
  )
}
