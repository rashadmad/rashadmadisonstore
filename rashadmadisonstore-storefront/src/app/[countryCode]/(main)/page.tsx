import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "The Quintessential - Afrocentric Art Storefront",
  description:
    "A collection of art and merch from the artist Rashad Madison.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  let region = null
  let collections: { id: string; handle: string; title: string }[] = []

  try {
    region = await getRegion(countryCode)

    const collectionsResponse = await listCollections({
      fields: "id, handle, title",
    })

    collections = collectionsResponse?.collections ?? []
  } catch {
    // Keep homepage content visible even if commerce data fails temporarily.
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        {region && collections.length > 0 ? (
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        ) : (
          <div className="content-container">
            <p className="text-center text-ui-fg-subtle">
              Featured products are temporarily unavailable.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
