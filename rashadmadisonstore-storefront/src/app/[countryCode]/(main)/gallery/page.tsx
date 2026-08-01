import { Metadata } from "next"

import { listStripeProducts } from "@lib/data/stripe-products"
import BentoProductGrid from "@modules/home/components/bento-product"

export const metadata: Metadata = {
  title: "Gallery | The Quintessential",
  description: "Browse all artwork in the gallery.",
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
          Gallery
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ui-fg-subtle">
          Explore themes of identity, culture, symbology and the black form in screen printed and Risograph artworks of Rashad Madison.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold">Could not load gallery</h2>
          <p className="mt-2 text-sm">
            Stripe product data is unavailable right now. Please try again shortly.
          </p>
          {errorMessage ? (
            <p className="mt-2 text-xs text-red-900/90">Details: {errorMessage}</p>
          ) : null}
        </div>
      ) : missingKey ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <h2 className="text-lg font-semibold">Stripe is not configured</h2>
          <p className="mt-2 text-sm">
            Add STRIPE_SECRET_KEY to your environment to load gallery products from Stripe.
          </p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-base text-ui-fg-subtle">
          No gallery pieces are available right now.
        </p>
      ) : (
        <BentoProductGrid products={products} />
      )}
    </div>
  )
}
