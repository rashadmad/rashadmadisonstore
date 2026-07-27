import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { getHasLoggedInBefore } from "@lib/data/cookies"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HomeTicker from "@modules/home/components/home-ticker"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

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
  const customer = await retrieveCustomer()
  const hasLoggedInBefore = await getHasLoggedInBefore()
  let collections: HttpTypes.StoreCollection[] = []

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
    <>
      <Hero customer={customer} hasLoggedInBefore={hasLoggedInBefore} />
      <HomeTicker />
      {region && collections.length > 0 ? (
        <div className="py-12">
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      ) : null}
    </>
  )
}
