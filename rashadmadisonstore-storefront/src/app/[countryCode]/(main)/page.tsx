import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { getHasLoggedInBefore } from "@lib/data/cookies"
import FeaturedProducts from "@modules/home/components/featured-products"
import BlogPreview from "@modules/home/components/blog-preview"
import Hero from "@modules/home/components/hero"
import Purpose from "@modules/home/components/purpose"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { appCopy } from "@lib/copy"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

const HERO_ARTWORK_HANDLES = [
  "african-sunset",
  "african-princess-red",
  "tender-head",
  "prince",
  "zulu-husband",
] as const

type HeroArtworkHandle = (typeof HERO_ARTWORK_HANDLES)[number]

export const metadata: Metadata = {
  title: appCopy.metadata.home.title,
  description: appCopy.metadata.home.description,
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  let region = null
  const customer = await retrieveCustomer()
  const hasLoggedInBefore = await getHasLoggedInBefore()
  let collections: HttpTypes.StoreCollection[] = []
  const heroArtworkSources: Partial<Record<HeroArtworkHandle, string>> = {}

  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { limit: 100, fields: "handle,*images," },
    })

    for (const handle of HERO_ARTWORK_HANDLES) {
      const match = response.products.find((product) => product.handle === handle)
      if (match?.images?.[0]) {
        heroArtworkSources[handle] = match.images[0].url
      }
    }
  } catch {
    // Hero falls back to static artwork sources when Medusa product images are unavailable.
  }

  try {
    region = await getRegion(countryCode)

    const collectionsResponse = await listCollections({
      fields: "id, handle, title",
    })

    collections = (collectionsResponse?.collections ?? []) as HttpTypes.StoreCollection[]
  } catch {
    // Keep homepage content visible even if commerce data fails temporarily.
  }

  return (
    <div className="min-h-screen">
      <Hero
        customer={customer}
        hasLoggedInBefore={hasLoggedInBefore}
        heroArtworkSources={heroArtworkSources}
      />
      <Purpose />
      {region && collections.length > 0 ? (
        <section aria-label="Featured collections" className="bg-black py-14 text-white sm:py-20">
          <div className="content-container mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-yellow-300">
              {appCopy.featuredProducts.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {appCopy.featuredProducts.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              {appCopy.featuredProducts.body}
            </p>
          </div>
          <ul className="flex flex-col">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </section>
      ) : null}
      <BlogPreview />
    </div>
  )
}
