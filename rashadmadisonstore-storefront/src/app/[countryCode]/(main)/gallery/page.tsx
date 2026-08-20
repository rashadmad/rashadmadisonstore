import { Metadata } from "next"

import { appCopy } from "@lib/copy"
import { listStripeProducts } from "@lib/data/stripe-products"
import BentoProductGrid from "@modules/home/components/bento-product"

export const metadata: Metadata = {
  title: appCopy.metadata.gallery.title,
  description: appCopy.metadata.gallery.description,
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ countryCode: string }> | { countryCode: string }
}) {
  await params

  const { products, loadError, missingKey, errorMessage } = await listStripeProducts()

  return (
    <div className="content-container py-12 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-ui-fg-base sm:text-4xl">
          {appCopy.gallery.heading}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ui-fg-subtle">
          {appCopy.gallery.intro}
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold">{appCopy.gallery.states.loadErrorTitle}</h2>
          <p className="mt-2 text-sm">
            {appCopy.gallery.states.loadErrorBody}
          </p>
          {errorMessage ? (
            <p className="mt-2 text-xs text-red-900/90">
              {appCopy.gallery.states.loadErrorDetailsPrefix} {errorMessage}
            </p>
          ) : null}
        </div>
      ) : missingKey ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <h2 className="text-lg font-semibold">{appCopy.gallery.states.missingKeyTitle}</h2>
          <p className="mt-2 text-sm">
            {appCopy.gallery.states.missingKeyBody}
          </p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-base text-ui-fg-subtle">
          {appCopy.gallery.states.empty}
        </p>
      ) : (
        <BentoProductGrid products={products} />
      )}
    </div>
  )
}
