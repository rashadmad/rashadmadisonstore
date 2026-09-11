import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const visibleImage = images.find((image) => !!image.url) ?? null

  if (!visibleImage) {
    return null
  }

  return (
    <div className="relative flex items-start">
      <div className="flex flex-1 flex-col gap-4 small:mx-8">
        <Container
          key={visibleImage.id}
          className="relative aspect-[29/34] w-full overflow-hidden rounded-[1.75rem] border border-[#d9d0be] bg-[#f0eadf] shadow-[0_10px_30px_rgba(23,32,18,0.05)]"
          id={visibleImage.id}
        >
          <Image
            src={visibleImage.url}
            priority
            className="absolute inset-0 rounded-[1.75rem]"
            alt="Product image"
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{
              objectFit: "cover",
            }}
          />
        </Container>
      </div>
    </div>
  )
}

export default ImageGallery
