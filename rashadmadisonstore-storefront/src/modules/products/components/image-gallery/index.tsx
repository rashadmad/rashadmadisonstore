import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  product?: HttpTypes.StoreProduct | null
  isApparel?: boolean
}

export const checkIsApparelProduct = (product?: HttpTypes.StoreProduct | null): boolean => {
  if (!product) return false

  const APPAREL_CATEGORY_ID = "pcat_01M156N3KC165P2FA7SBQ9CG7B"

  if (Array.isArray(product.categories)) {
    const isApparelCategory = product.categories.some((cat: any) => {
      const idMatches = cat?.id === APPAREL_CATEGORY_ID
      const nameMatches = /apparel|shirt|sweatshirt|pant|wearable|tee/i.test(cat?.name || "")
      const handleMatches = /apparel|shirts|sweatshirts|pants|wearables|tee/i.test(cat?.handle || "")
      return idMatches || nameMatches || handleMatches
    })
    if (isApparelCategory) return true
  }

  if (product.collection) {
    const collTitle = (product.collection as any)?.title || ""
    const collHandle = (product.collection as any)?.handle || ""
    if (/apparel|wearable/i.test(collTitle) || /apparel|wearable/i.test(collHandle)) {
      return true
    }
  }

  const titleOrHandle = `${product.title || ""} ${product.handle || ""}`.toLowerCase()
  if (/t-shirt|shirt|sweatshirt|hoodie|apparel|wearable/i.test(titleOrHandle)) {
    return true
  }

  return false
}

const ImageGallery = ({ images, product, isApparel }: ImageGalleryProps) => {
  const primaryImage = images.find((image) => !!image.url) ?? null
  const secondaryImage = images.find((image, index) => index > 0 && !!image.url) ?? null

  if (!primaryImage) {
    return null
  }

  const isApparelProduct = isApparel ?? checkIsApparelProduct(product)
  const shouldEnableHover = isApparelProduct && Boolean(secondaryImage)

  return (
    <div className="relative flex items-start">
      <div className="flex flex-1 flex-col gap-4 small:mx-8">
        <Container
          key={primaryImage.id}
          className="group relative aspect-[29/34] w-full overflow-hidden rounded-[1.75rem] border border-[#d9d0be] bg-[#f0eadf] shadow-[0_10px_30px_rgba(23,32,18,0.05)]"
          id={primaryImage.id}
        >
          <Image
            src={primaryImage.url}
            priority
            className={`absolute inset-0 rounded-[1.75rem] transition-opacity duration-300 ease-out ${
              shouldEnableHover ? "group-hover:opacity-0" : ""
            }`}
            alt="Product image"
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{
              objectFit: "cover",
            }}
          />
          {shouldEnableHover && secondaryImage && (
            <Image
              src={secondaryImage.url}
              className="absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
              alt="Product image back view"
              fill
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </Container>
      </div>
    </div>
  )
}

export default ImageGallery
