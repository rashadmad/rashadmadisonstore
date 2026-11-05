import { Metadata } from "next"
import { faHandFist, faPalette, faPencil } from "@fortawesome/free-solid-svg-icons"

import { appCopy } from "@lib/copy"
import { listProducts } from "@lib/data/products"
import BentoProductGrid from "@modules/home/components/bento-product"
import ShopPageHero from "@modules/common/components/shop-page-hero"
import { checkIsApparelProduct } from "@modules/products/components/image-gallery"
import { HttpTypes } from "@medusajs/types"

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
  const { countryCode } = await params

  let products: HttpTypes.StoreProduct[] = []
  let loadError = false

  try {
    const response = await listProducts({
      countryCode,
      queryParams: {
        limit: 100,
        fields:
          "*images,*variants.calculated_price,*variants.prices,*variants.images,+width,+height,+length,*categories,*collection,",
      },
    })

    products = response.response.products.filter(
      (product) => !checkIsApparelProduct(product)
    )
  } catch {
    loadError = true
  }

  return (
    <div className="pb-12 sm:pb-16">
      <ShopPageHero
        sectionId="gallery"
        heading={appCopy.gallery.heading}
        tagline={appCopy.gallery.tagline}
        intro={appCopy.gallery.intro}
        highlightsLabel="Gallery highlights"
        highlights={appCopy.gallery.highlights.map((text, index) => ({
          text,
          icon: galleryHighlightIcons[index],
        }))}
        backgroundImage="/images/tenderHead_salon.png"
      />

      <div id="products" className="content-container scroll-mt-24">
        {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold uppercase tracking-wide">{appCopy.gallery.states.loadErrorTitle}</h2>
          <p className="mt-2 text-sm">
            {appCopy.gallery.states.loadErrorBody}
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
