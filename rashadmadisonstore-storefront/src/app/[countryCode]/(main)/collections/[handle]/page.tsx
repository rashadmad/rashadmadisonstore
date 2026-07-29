import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  let collection: StoreCollection | null = null

  try {
    collection = await getCollectionByHandle(params.handle)
  } catch {
    return {
      title: "Collections | The Quintessential",
      description: "Collection details are temporarily unavailable.",
    }
  }

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Medusa Store`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  let collection: StoreCollection | null = null

  try {
    collection = await getCollectionByHandle(params.handle).then(
      (data: StoreCollection) => data
    )
  } catch {
    return (
      <div className="content-container py-12 sm:py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h1 className="text-2xl font-semibold">Could not load this collection</h1>
          <p className="mt-2 text-sm">
            We could not reach the backend right now. Please try again in a moment.
          </p>
          <LocalizedClientLink
            href="/collections"
            className="mt-4 inline-flex text-sm font-semibold text-red-900 underline"
          >
            Back to collections
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
