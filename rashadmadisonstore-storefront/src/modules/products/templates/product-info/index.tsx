import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const dimensions = product as HttpTypes.StoreProduct & {
    width?: number | null
    height?: number | null
    length?: number | null
  }
  const dimensionParts = [
    dimensions.width ? `W ${dimensions.width}` : null,
    dimensions.height ? `H ${dimensions.height}` : null,
    dimensions.length ? `L ${dimensions.length}` : null,
  ].filter(Boolean)
  const material = product.material || "-"

  return (
    <div id="product-info">
      <div className="mx-auto flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700 transition hover:text-green-600"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        <Heading
          level="h2"
          className="font-display mt-2 text-4xl font-semibold tracking-tight text-green-600 sm:text-5xl"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="whitespace-pre-line text-base leading-7 text-[#4f524b]"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        <div className="border-y border-[#e6dfd0] py-3" data-testid="product-material">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
            Material
          </p>
          <p className="mt-1 text-base text-[#4f524b]">{material}</p>
        </div>

        {dimensionParts.length > 0 && (
          <div className="border-y border-[#e6dfd0] py-3" data-testid="product-dimensions">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
              Dimensions
            </p>
            <p className="mt-1 text-base text-[#4f524b]">{dimensionParts.join(" x ")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
