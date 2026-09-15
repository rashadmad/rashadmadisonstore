import { Metadata } from "next"
import { faBagShopping, faHeart, faPalette, faShirt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { appCopy } from "@lib/copy"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: appCopy.metadata.store.title,
  description: appCopy.metadata.store.description,
}

const storeHighlightIcons = [faPalette, faShirt, faBagShopping]

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
    <div className="pb-12 sm:pb-16">
      <section
        id="store"
        aria-labelledby="store-heading"
        className="relative mb-12 overflow-hidden bg-green-600 text-white sm:mb-16"
      >
        <img
          src="/images/princeImageBackground.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-50"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-green-950/45" aria-hidden="true" />

        <div className="content-container relative z-20 grid gap-y-6 px-6 py-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-8 sm:px-10 sm:py-16 lg:min-h-[620px] lg:px-16 lg:py-20">
          <h1
            id="store-heading"
            className="font-display text-center text-4xl font-semibold tracking-tight text-yellow-300 sm:col-span-2 sm:text-5xl lg:text-6xl"
          >
            {appCopy.store.heading}
          </h1>
          <p className="flex items-center justify-center gap-2 text-center text-xl font-semibold uppercase tracking-[0.08em] text-white sm:col-span-2 sm:row-start-2 sm:text-2xl">
            <span>{appCopy.store.tagline}</span>
            <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" aria-hidden="true" />
          </p>
          <div className="flex flex-col justify-center sm:col-start-1 sm:row-start-3">
            <p className="max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              {appCopy.store.intro}
            </p>
          </div>
          <ul className="grid content-center gap-4 sm:col-start-2 sm:row-start-3" aria-label="Store highlights">
            {appCopy.store.highlights.map((highlight, index) => (
              <li key={highlight} className="flex gap-4 text-base leading-7 text-white/95 sm:text-lg">
                <FontAwesomeIcon
                  icon={storeHighlightIcons[index]}
                  className="mt-1.5 h-5 w-5 shrink-0 text-yellow-300"
                  aria-hidden="true"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </div>
  )
}
