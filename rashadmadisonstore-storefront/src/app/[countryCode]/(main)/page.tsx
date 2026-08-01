import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { getHasLoggedInBefore } from "@lib/data/cookies"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Purpose from "@modules/home/components/purpose"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { appCopy } from "@lib/copy"
import { HttpTypes } from "@medusajs/types"

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
      <Hero customer={customer} hasLoggedInBefore={hasLoggedInBefore} />
      <Purpose />
      {region && collections.length > 0 ? (
        <div className="py-12">
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      ) : null}
    </div>
  )
}
