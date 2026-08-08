import { StripeGalleryProduct } from "@lib/data/stripe-products"
import AnimatedImage from "@modules/common/components/animated-image"

type BentoProductGridProps = {
  products: StripeGalleryProduct[]
}

const PLACEHOLDER_IMAGE = "/placeholder-art.jpg"

const chunkProducts = (products: StripeGalleryProduct[], size: number) => {
  const chunks: StripeGalleryProduct[][] = []

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size))
  }

  return chunks
}

const getBentoImages = (products: StripeGalleryProduct[]) => {
  const productImagePools = products.map((product) => {
    const normalized = product.images.filter(Boolean)
    return Array.from(new Set(normalized))
  })

  const hasAtLeastOneImage = productImagePools.some((pool) => pool.length > 0)

  if (!hasAtLeastOneImage) {
    return Array.from({ length: 5 }).map(() => PLACEHOLDER_IMAGE)
  }

  const selected: string[] = []
  const cursors = productImagePools.map(() => 0)

  while (selected.length < 5) {
    let addedImageThisRound = false

    for (let poolIndex = 0; poolIndex < productImagePools.length; poolIndex += 1) {
      const pool = productImagePools[poolIndex]

      if (pool.length === 0) {
        continue
      }

      selected.push(pool[cursors[poolIndex] % pool.length])
      cursors[poolIndex] += 1
      addedImageThisRound = true

      if (selected.length === 5) {
        break
      }
    }

    if (!addedImageThisRound) {
      break
    }
  }

  while (selected.length < 5) {
    selected.push(PLACEHOLDER_IMAGE)
  }

  return selected
}

const normalizeDesign = (value: string) => value.trim().toLowerCase()

const sortByName = (a: StripeGalleryProduct, b: StripeGalleryProduct) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" })

const BentoProductGrid = ({ products }: BentoProductGridProps) => {
  const groupedByDesign = products.reduce<Record<string, StripeGalleryProduct[]>>(
    (acc, product) => {
      const key = normalizeDesign(product.design || "Ungrouped")

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(product)
      return acc
    },
    {}
  )

  const designSections = Object.entries(groupedByDesign)
    .map(([normalizedKey, items]) => ({
      normalizedKey,
      title: items[0]?.design || "Ungrouped",
      groups: chunkProducts([...items].sort(sortByName), 3).map((productGroup, chunkIndex, all) => {
        const designTitle = items[0]?.design || "Ungrouped"

        return {
          key: `${normalizedKey}-${chunkIndex}`,
          title: all.length > 1 ? `${designTitle} ${chunkIndex + 1}` : designTitle,
          products: productGroup,
        }
      }),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))

  return (
    <div className="space-y-12 sm:space-y-16">
      {designSections.map((section) => (
        <section key={section.normalizedKey} className="space-y-5">
          <h2 className="text-2xl font-semibold text-ui-fg-base sm:text-3xl">{section.title}</h2>

          <ul className="space-y-8">
            {section.groups.map((group) => {
              const bentoImages = getBentoImages(group.products)
              const featuringText = group.products.map((product) => product.name).join(", ")
              const groupDescription =
                group.products.find((product) => product.description)?.description ||
                "Original artwork and curated prints available to purchase."
              const groupPrices = Array.from(
                new Set(group.products.map((product) => product.displayPrice).filter(Boolean))
              )

              return (
                <li
                  key={group.key}
                  className="w-full rounded-3xl border border-ui-border-base bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="overflow-hidden rounded-2xl">
                    <div className="grid h-[360px] grid-cols-6 grid-rows-2 gap-1 bg-white sm:h-[440px] lg:h-[520px]">
                      <AnimatedImage
                        src={bentoImages[0]}
                        alt={`${group.title} image 1`}
                        wrapperClassName="col-span-3 row-span-2 h-full w-full"
                        className="h-full w-full object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[1]}
                        alt={`${group.title} image 2`}
                        wrapperClassName="col-span-3 row-span-1 h-full w-full"
                        className="h-full w-full object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[2]}
                        alt={`${group.title} image 3`}
                        wrapperClassName="col-start-4 row-start-2 h-full w-full"
                        className="h-full w-full object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[3]}
                        alt={`${group.title} image 4`}
                        wrapperClassName="col-start-5 row-start-2 h-full w-full"
                        className="h-full w-full object-cover"
                      />
                      <AnimatedImage
                        src={bentoImages[4]}
                        alt={`${group.title} image 5`}
                        wrapperClassName="col-start-6 row-start-2 h-full w-full"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-semibold text-ui-fg-base sm:text-2xl">{group.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-ui-fg-subtle sm:text-sm">
                      Featuring: {featuringText}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-ui-fg-subtle sm:text-base">
                      {groupDescription}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-green-700">
                      {groupPrices.join(" • ")}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default BentoProductGrid