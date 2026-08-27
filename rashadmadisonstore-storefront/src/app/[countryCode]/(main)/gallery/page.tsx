import { Metadata } from "next"
import { faHandFist, faHeart, faPalette, faPencil } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { appCopy } from "@lib/copy"
import { listStripeProducts } from "@lib/data/stripe-products"
import BentoProductGrid from "@modules/home/components/bento-product"

export const metadata: Metadata = {
  title: appCopy.metadata.gallery.title,
  description: appCopy.metadata.gallery.description,
}

const galleryHighlightIcons = [faPalette, faPencil, faHandFist]

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ countryCode: string }> | { countryCode: string }
}) {
  await params

  const { products, loadError, missingKey, errorMessage } = await listStripeProducts()

  return (
    <div className="pb-12 sm:pb-16">
      <section className="relative mb-16 overflow-hidden bg-green-600 text-white sm:mb-20">
        <img
          src="/images/zebraBackground.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full rotate-90 scale-[1.65] object-fill opacity-50 lg:scale-[2.25]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-green-950/65" aria-hidden="true" />

        <div className="content-container relative z-20 grid gap-y-6 px-6 py-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-8 sm:px-10 sm:py-16 lg:min-h-[620px] lg:px-16 lg:py-20">
          <h1 className="font-display text-center text-4xl font-semibold tracking-tight text-yellow-300 sm:col-span-2 sm:text-5xl lg:text-6xl">
            {appCopy.gallery.heading}
          </h1>
          <p className="flex items-center justify-center gap-2 text-center text-xl font-semibold uppercase tracking-[0.08em] text-white sm:col-span-2 sm:row-start-2 sm:text-2xl">
            <span>{appCopy.gallery.tagline}</span>
            <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" aria-hidden="true" />
          </p>
          <div className="flex flex-col justify-center sm:col-start-1 sm:row-start-3">
            <p className="max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              {appCopy.gallery.intro}
            </p>
          </div>
          <ul className="grid content-center gap-4 sm:col-start-2 sm:row-start-3" aria-label="Gallery highlights">
            {appCopy.gallery.highlights.map((highlight, index) => (
              <li key={highlight} className="flex gap-4 text-base leading-7 text-white/95 sm:text-lg">
                <FontAwesomeIcon
                  icon={galleryHighlightIcons[index]}
                  className="mt-1.5 h-5 w-5 shrink-0 text-yellow-300"
                  aria-hidden="true"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="content-container">
        {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold uppercase tracking-wide">{appCopy.gallery.states.loadErrorTitle}</h2>
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
          <h2 className="text-lg font-semibold uppercase tracking-wide">{appCopy.gallery.states.missingKeyTitle}</h2>
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
    </div>
  )
}
