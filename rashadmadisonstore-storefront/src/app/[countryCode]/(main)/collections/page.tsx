import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Collections | The Quintessential",
  description: "Browse all artwork collections.",
}

export default async function CollectionsPage() {
  let collections: { id: string; title: string; handle: string }[] = []
  let loadError = false

  try {
    const response = await listCollections()
    collections = response.collections
  } catch {
    collections = []
    loadError = true
  }

  return (
    <div className="content-container py-12 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-ui-fg-base sm:text-4xl">
          Collection
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ui-fg-subtle">
          Explore each product line and open a collection to view pricing,
          descriptions, and artwork details.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold">Could not load collection</h2>
          <p className="mt-2 text-sm">
            The backend data source is unavailable right now. Please try again shortly.
          </p>
        </div>
      ) : collections.length === 0 ? (
        <p className="text-base text-ui-fg-subtle">No collection is available right now.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <LocalizedClientLink
                href={`/collections/${collection.handle}`}
                className="group block rounded-xl border border-ui-border-base bg-white p-5 transition hover:border-green-500"
              >
                <p className="text-lg font-semibold text-ui-fg-base group-hover:text-green-600">
                  {collection.title}
                </p>
                <p className="mt-2 text-sm text-ui-fg-subtle">
                  Open this collection
                </p>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
