import { Metadata } from "next"
import { faShirt, faTag, faHeart } from "@fortawesome/free-solid-svg-icons"

import { appCopy } from "@lib/copy"
import { listProducts } from "@lib/data/products"
import BentoProductGrid from "@modules/home/components/bento-product"
import ShopPageHero from "@modules/common/components/shop-page-hero"
import { checkIsApparelProduct } from "@modules/products/components/image-gallery"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: appCopy.metadata.apparel.title,
  description: appCopy.metadata.apparel.description,
}

const apparelHighlightIcons = [faShirt, faTag, faHeart]

export default async function ApparelPage({
  params,
}: {
  params: Promise<{ countryCode: string }> | { countryCode: string }
}) {
  const { countryCode } = await params
  let products: HttpTypes.StoreProduct[] = []
  let loadError = false

  try {
    products = (await listProducts({
      countryCode,
      queryParams: {
        limit: 100,
        fields: "*variants.calculated_price,*variants.prices,*variants.images,*categories,*collection,*images",
      },
    })).response.products.filter(checkIsApparelProduct)
  } catch {
    loadError = true
  }

  return (
    <div className="pb-12 sm:pb-16">
      <ShopPageHero
        sectionId="apparel"
        heading={appCopy.apparel.heading}
        tagline={appCopy.apparel.tagline}
        intro={appCopy.apparel.intro}
        highlightsLabel="Apparel highlights"
        highlights={appCopy.apparel.highlights.map((text, index) => ({
          text,
          icon: apparelHighlightIcons[index],
        }))}
        backgroundImage="/images/zuluHusband.jpeg"
        ctaLabel={appCopy.apparel.cta}
      />

      <div id="products" className="content-container scroll-mt-24">
        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <h2 className="text-lg font-semibold uppercase tracking-wide">Could not load apparel</h2>
            <p className="mt-2 text-sm">Medusa product data is unavailable right now. Please try again shortly.</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-base text-ui-fg-subtle">No apparel is available right now.</p>
        ) : (
          <BentoProductGrid products={products} variant="apparel" />
        )}
      </div>
    </div>
  )
}
