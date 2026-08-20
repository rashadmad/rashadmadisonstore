import { StripeGalleryProduct } from "@lib/data/stripe-products"
import AnimatedImage from "@modules/common/components/animated-image"

type BentoProductGridProps = {
  products: StripeGalleryProduct[]
}

const PLACEHOLDER_IMAGE = "/placeholder-art.jpg"

type BentoTile = {
  src: string
  name: string
  price: string
}

const getBentoTiles = (products: StripeGalleryProduct[]) => {
  const targetTileCount = products.length > 3 ? Math.min(12, products.length * 2) : 5
  const productImagePools = products.map((product) => {
    const normalized = product.images.filter(Boolean)
    return {
      product,
      images: Array.from(new Set(normalized)),
    }
  })

  const hasAtLeastOneImage = productImagePools.some((pool) => pool.images.length > 0)

  if (!hasAtLeastOneImage) {
    return Array.from({ length: targetTileCount }).map((_, index) => {
      const fallbackProduct = products[index % products.length]

      return {
        src: PLACEHOLDER_IMAGE,
        name: fallbackProduct?.name || "Untitled",
        price: fallbackProduct?.displayPrice || "Price available on request",
      }
    })
  }

  const selected: BentoTile[] = []
  const mutablePools = productImagePools.map((pool) => ({
    product: pool.product,
    images: [...pool.images],
  }))
  const uniqueImageCount = mutablePools.reduce((total, pool) => total + pool.images.length, 0)
  const maxTilesWithoutRepeats = Math.max(5, Math.min(targetTileCount, uniqueImageCount))

  while (selected.length < maxTilesWithoutRepeats) {
    let addedImageThisRound = false

    for (let poolIndex = 0; poolIndex < mutablePools.length; poolIndex += 1) {
      const pool = mutablePools[poolIndex]

      if (pool.images.length === 0) {
        continue
      }

      selected.push({
        src: pool.images.shift() as string,
        name: pool.product.name,
        price: pool.product.displayPrice,
      })
      addedImageThisRound = true

      if (selected.length === maxTilesWithoutRepeats) {
        break
      }
    }

    if (!addedImageThisRound) {
      break
    }
  }

  while (selected.length < maxTilesWithoutRepeats) {
    const fallbackProduct = products[selected.length % products.length]
    selected.push({
      src: PLACEHOLDER_IMAGE,
      name: fallbackProduct?.name || "Untitled",
      price: fallbackProduct?.displayPrice || "Price available on request",
    })
  }

  return selected
}

const normalizeLabel = (value: string) => value.trim().toLowerCase()

const sortByName = (a: StripeGalleryProduct, b: StripeGalleryProduct) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" })

const sortByLabel = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" })

const renderBentoTile = (
  tile: BentoTile,
  alt: string,
  wrapperClassName: string,
  index: number,
  objectPositionClass: string,
  key: string
) => (
  <div key={key} className={`relative ${wrapperClassName}`}>
    <AnimatedImage
      src={tile.src}
      alt={alt}
      wrapperClassName="h-full w-full"
      className={`h-full w-full object-cover ${objectPositionClass}`}
    />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 py-2 sm:px-3">
      <p
        className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-xs"
        data-testid={`bento-image-name-${index}`}
      >
        {tile.name}
      </p>
      <p className="text-[11px] font-bold text-yellow-300 sm:text-xs" data-testid={`bento-image-price-${index}`}>
        {tile.price}
      </p>
    </div>
  </div>
)

const tileLayout = [
  {
    wrapperClassName: "col-span-3 row-span-2 h-full w-full",
    objectPositionClass: "object-[50%_18%]",
  },
  {
    wrapperClassName: "col-span-3 row-span-1 h-full w-full",
    objectPositionClass: "object-[50%_22%]",
  },
  {
    wrapperClassName: "col-start-4 row-start-2 h-full w-full",
    objectPositionClass: "object-[50%_24%]",
  },
  {
    wrapperClassName: "col-start-5 row-start-2 h-full w-full",
    objectPositionClass: "object-[50%_24%]",
  },
  {
    wrapperClassName: "col-start-6 row-start-2 h-full w-full",
    objectPositionClass: "object-[50%_24%]",
  },
] as const

const BentoProductGrid = ({ products }: BentoProductGridProps) => {
  const groupedByMediumTheme = products.reduce<
    Record<string, { medium: string; theme: string; products: StripeGalleryProduct[] }>
  >((acc, product) => {
    const medium = product.medium || "Unspecified Medium"
    const theme = product.theme || "Ungrouped"
    const key = `${normalizeLabel(medium)}::${normalizeLabel(theme)}`

    if (!acc[key]) {
      acc[key] = {
        medium,
        theme,
        products: [],
      }
    }

    acc[key].products.push(product)
    return acc
  }, {})

  const sortedMediumThemeGroups = Object.values(groupedByMediumTheme).sort((a, b) => {
    const mediumSort = sortByLabel(a.medium, b.medium)

    if (mediumSort !== 0) {
      return mediumSort
    }

    return sortByLabel(a.theme, b.theme)
  })

  const mediumSectionsMap = sortedMediumThemeGroups.reduce<
    Record<
      string,
      {
        title: string
        mediumKey: string
        themes: Array<{
          themeKey: string
          title: string
          products: StripeGalleryProduct[]
        }>
      }
    >
  >((acc, entry) => {
    const mediumKey = normalizeLabel(entry.medium)

    if (!acc[mediumKey]) {
      acc[mediumKey] = {
        title: entry.medium,
        mediumKey,
        themes: [],
      }
    }

    acc[mediumKey].themes.push({
      themeKey: normalizeLabel(entry.theme),
      title: entry.theme,
      products: [...entry.products].sort(sortByName),
    })

    return acc
  }, {})

  const mediumSections = Object.values(mediumSectionsMap)

  return (
    <div className="space-y-12 sm:space-y-16">
      {mediumSections.map((mediumSection) => (
        <section key={mediumSection.mediumKey} className="space-y-8">
          <h2 className="text-2xl font-semibold text-ui-fg-base sm:text-3xl">{mediumSection.title}</h2>

          {mediumSection.themes.map((themeSection) => (
            <div key={`${mediumSection.mediumKey}-${themeSection.themeKey}`} className="space-y-5">
              <h3 className="text-xl font-semibold text-ui-fg-base sm:text-2xl">{themeSection.title}</h3>

              <ul className="space-y-8">
                {(() => {
                  const bentoTiles = getBentoTiles(themeSection.products)
                  const featuringText = themeSection.products.map((product) => product.name).join(", ")
                  const groupDescription =
                    themeSection.products.find((product) => product.description)?.description ||
                    "Original artwork and curated prints available to purchase."
                  const primaryTiles = bentoTiles.slice(0, 5)
                  const extraTiles = bentoTiles.slice(5)

                  return (
                    <li
                      key={`${mediumSection.mediumKey}-${themeSection.themeKey}`}
                      className="w-full rounded-3xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6"
                    >
                      <div className="overflow-hidden rounded-2xl">
                        <div className="grid h-[360px] grid-cols-6 grid-rows-2 gap-1 bg-white sm:h-[440px] lg:h-[520px]">
                          {primaryTiles.map((tile, index) =>
                            renderBentoTile(
                              tile,
                              `${themeSection.title} image ${index + 1}`,
                              tileLayout[index].wrapperClassName,
                              index + 1,
                              tileLayout[index].objectPositionClass,
                              `${themeSection.themeKey}-primary-${index}`
                            )
                          )}
                        </div>
                        {extraTiles.length > 0 ? (
                          <div className="mt-1 grid grid-cols-2 gap-1 bg-white sm:grid-cols-3 lg:grid-cols-4">
                            {extraTiles.map((tile, index) =>
                              renderBentoTile(
                                tile,
                                `${themeSection.title} image ${index + 6}`,
                                "aspect-square h-full w-full",
                                index + 6,
                                "object-[50%_22%]",
                                `${themeSection.themeKey}-extra-${index}`
                              )
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-5">
                        <h4 className="text-xl font-semibold text-ui-fg-base sm:text-2xl">{themeSection.title}</h4>
                        <p className="mt-1 text-xs uppercase tracking-wide text-ui-fg-subtle sm:text-sm">
                          Featuring: {featuringText}
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm text-ui-fg-subtle sm:text-base">
                          {groupDescription}
                        </p>
                      </div>
                    </li>
                  )
                })()}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

export default BentoProductGrid