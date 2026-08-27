import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div className="bg-[#f5f2ea] py-8 sm:py-12">
        <div
          className="content-container flex flex-col gap-6 small:flex-row small:items-start relative rounded-[2rem] border border-[#e6dfd0] bg-[#f8f4ee] p-4 shadow-[0_12px_40px_rgba(23,32,18,0.04)] sm:p-6 lg:p-8"
          data-testid="product-container"
        >
          <div className="flex w-full flex-col gap-y-6 small:sticky small:top-24 small:max-w-[280px] small:py-0 py-4">
            <ProductInfo product={product} />
            <ProductTabs product={product} />
          </div>

          <div className="relative block w-full flex-1">
            <ImageGallery images={images} />
          </div>

          <div className="flex w-full flex-col gap-y-6 small:sticky small:top-24 small:max-w-[300px] small:py-0 py-4">
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
