import { getProductPrice } from "@lib/util/get-product-price"
import { appCopy } from "@lib/copy"
import { HttpTypes } from "@medusajs/types"
import AnimatedImage from "@modules/common/components/animated-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BentoProductGridProps = {
  products: HttpTypes.StoreProduct[]
  variant?: "default" | "apparel"
}

type BentoTile = {
  src: string
  backSrc?: string
  name: string
  handle: string
  price: string
}

const getPrice = (product: HttpTypes.StoreProduct) =>
  getProductPrice({ product }).cheapestPrice?.calculated_price || "Price available on request"

const getProductImages = (product: HttpTypes.StoreProduct): string[] => {
  const urls: string[] = []
  if (product.thumbnail) {
    urls.push(product.thumbnail)
  }
  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img?.url && !urls.includes(img.url)) {
        urls.push(img.url)
      }
    }
  }
  return urls
}

const getBentoTiles = (products: HttpTypes.StoreProduct[], isApparel = false) => {
  return products.map((product) => {
    const urls = getProductImages(product)
    const frontImage = urls[0] || product.thumbnail || ""
    const backImage = isApparel && urls.length > 1 ? urls[1] : undefined

    return {
      src: frontImage,
      backSrc: backImage,
      name: product.title,
      handle: product.handle,
      price: getPrice(product),
    }
  })
}

const normalizeLabel = (value: string) => value.trim().toLowerCase()

const getMediumDescription = (category: string) => {
  const normalizedCategory = normalizeLabel(category)

  if (normalizedCategory.includes("risograph")) {
    return appCopy.gallery.mediumDescriptions.risograph
  }

  if (normalizedCategory.includes("screenprint") || normalizedCategory.includes("screen print")) {
    return appCopy.gallery.mediumDescriptions.screenprint
  }

  if (normalizedCategory.includes("print")) {
    return "Limited-edition prints made for collecting and living with the work."
  }

  if (normalizedCategory.includes("original") || normalizedCategory.includes("fine art")) {
    return "One-of-one original works made with archival materials."
  }

  return `A curated selection of ${category.toLowerCase()} by Rashad Madison.`
}

const tileLayout = [
  { wrapper: "col-span-3 row-span-2 h-full w-full", position: "object-[50%_18%]" },
  { wrapper: "col-span-3 row-span-1 h-full w-full", position: "object-[50%_22%]" },
  { wrapper: "col-start-4 row-start-2 h-full w-full", position: "object-[50%_24%]" },
  { wrapper: "col-start-5 row-start-2 h-full w-full", position: "object-[50%_24%]" },
  { wrapper: "col-start-6 row-start-2 h-full w-full", position: "object-[50%_24%]" },
] as const

const getGridClassName = (tileCount: number) => {
  if (tileCount === 1) return "grid min-h-[280px] grid-cols-1 bg-white sm:min-h-[360px] lg:min-h-[420px]"
  if (tileCount === 2) return "grid min-h-[280px] grid-cols-1 gap-1 bg-white sm:min-h-[360px] sm:grid-cols-2 lg:min-h-[420px]"
  if (tileCount === 3) return "grid min-h-[280px] grid-cols-1 gap-1 bg-white sm:min-h-[360px] sm:grid-cols-3 lg:min-h-[420px]"
  if (tileCount === 4) return "grid min-h-[220px] grid-cols-2 gap-1 bg-white sm:grid-cols-4 sm:min-h-[280px] lg:min-h-[320px]"

  return "grid h-[360px] grid-cols-6 grid-rows-2 gap-1 bg-white sm:h-[440px] lg:h-[520px]"
}

const renderTile = (
  tile: BentoTile,
  alt: string,
  index: number,
  tileCount: number,
  key: string
) => (
  <div
    key={key}
    className={`group relative ${tileCount >= 5 ? tileLayout[index]?.wrapper : "h-full w-full"}`}
  >
    <LocalizedClientLink href={`/products/${tile.handle}`} className="block h-full w-full">
      <AnimatedImage
        src={tile.src}
        alt={alt}
        wrapperClassName="h-full w-full overflow-hidden"
        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
          tileCount >= 5 ? tileLayout[index]?.position : "object-[50%_22%]"
        }`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 py-2 sm:px-3 z-20">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-xs">
          {tile.name}
        </p>
        <p className="text-[11px] font-bold text-yellow-300 sm:text-xs">{tile.price}</p>
      </div>
    </LocalizedClientLink>
  </div>
)

const renderApparelTile = (
  tile: BentoTile,
  alt: string,
  key: string
) => (
  <div
    key={key}
    className="group relative flex flex-col rounded-2xl border border-ui-border-base bg-white p-2 sm:p-3 shadow-sm transition-all duration-200 hover:shadow-md"
  >
    <LocalizedClientLink href={`/apparel/${tile.handle}`} className="block h-full w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#f8f6f0]">
        <AnimatedImage
          src={tile.src}
          alt={alt}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover object-[50%_18%] transition-transform duration-300 group-hover:scale-105"
        />
        {tile.backSrc && (
          <AnimatedImage
            src={tile.backSrc}
            alt={`${alt} back view`}
            wrapperClassName="absolute inset-0 h-full w-full z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            className="h-full w-full object-cover object-[50%_18%] transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {tile.backSrc && (
          <span className="absolute top-2 right-2 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300 shadow-sm z-20">
            <span className="group-hover:hidden">Front</span>
            <span className="hidden group-hover:inline">Back</span>
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
          {tile.name}
        </p>
        <p className="shrink-0 text-xs font-bold text-green-700">{tile.price}</p>
      </div>
    </LocalizedClientLink>
  </div>
)

export default function BentoProductGrid({ products, variant = "default" }: BentoProductGridProps) {
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

  if (variant === "apparel") {
    return (
      <div className="space-y-12 sm:space-y-16">
        {sections.map((section) => {
          const tiles = getBentoTiles(section.products, true)

          return (
            <section key={`${section.category}-${section.collection}`} className="space-y-6">
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-ui-fg-base sm:text-3xl">
                {section.category}
              </h2>
              <div className="w-full rounded-3xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {tiles.map((tile, index) =>
                    renderApparelTile(
                      tile,
                      `${section.collection} apparel ${index + 1}`,
                      `${section.collection}-apparel-${index}`
                    )
                  )}
                </div>
                <h4 className="mt-6 text-xl font-semibold uppercase tracking-wide text-ui-fg-base sm:text-2xl">
                  {section.collection}
                </h4>
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      {sections.map((section) => {
        const tiles = getBentoTiles(section.products, false)
        const primaryTiles = tiles.slice(0, 5)
        const extraTiles = tiles.slice(5)

        return (
          <section key={`${section.category}-${section.collection}`} className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-ui-fg-base sm:text-3xl">
                {section.category}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ui-fg-subtle sm:text-base">
                {getMediumDescription(section.category)}
              </p>
            </div>
            <div className="w-full rounded-3xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6">
              <div className="overflow-hidden rounded-2xl">
                <div className={getGridClassName(primaryTiles.length)}>
                  {primaryTiles.map((tile, index) =>
                    renderTile(
                      tile,
                      `${section.collection} image ${index + 1}`,
                      index,
                      primaryTiles.length,
                      `${section.collection}-${index}`
                    )
                  )}
                </div>
                {extraTiles.length > 0 ? (
                  <div className="mt-1 grid grid-cols-2 gap-1 bg-white sm:grid-cols-3 lg:grid-cols-4">
                    {extraTiles.map((tile, index) => (
                      <div key={`${section.collection}-extra-${index}`} className="group relative aspect-square h-full w-full overflow-hidden">
                        <LocalizedClientLink href={`/products/${tile.handle}`} className="block h-full w-full">
                          <AnimatedImage
                            src={tile.src}
                            alt={`${section.collection} image ${index + 6}`}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-cover object-[50%_22%] transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 py-2 sm:px-3 z-20">
                            <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-xs">
                              {tile.name}
                            </p>
                            <p className="text-[11px] font-bold text-yellow-300 sm:text-xs">{tile.price}</p>
                          </div>
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
