import { Metadata } from "next"
import { faBagShopping, faPalette, faShirt } from "@fortawesome/free-solid-svg-icons"

import { appCopy } from "@lib/copy"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import ShopPageHero from "@modules/common/components/shop-page-hero"

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
      <ShopPageHero
        sectionId="store"
        heading={appCopy.store.heading}
        tagline={appCopy.store.tagline}
        intro={appCopy.store.intro}
        highlightsLabel="Store highlights"
        highlights={appCopy.store.highlights.map((text, index) => ({
          text,
          icon: storeHighlightIcons[index],
        }))}
        backgroundImage="/images/princeImageBackground.jpg"
      />
      <div id="products" className="scroll-mt-24">
        <StoreTemplate
          sortBy={sortBy}
          page={page}
          countryCode={params.countryCode}
        />
      </div>
    </div>
  )
}
