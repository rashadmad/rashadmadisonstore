import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(`Failed to generate static paths for apparel product pages: ${error}`)
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  const includeThumbnail = (images: HttpTypes.StoreProductImage[]) => {
    if (!product.thumbnail || images.some((image) => image.url === product.thumbnail)) {
      return images
    }

    return [
      {
        id: `${product.id}-thumbnail`,
        url: product.thumbnail,
        rank: -1,
      } as HttpTypes.StoreProductImage,
      ...images,
    ]
  }

  if (!product.variants || product.variants.length <= 1) {
    return includeThumbnail(product.images ?? [])
  }

  const defaultVariant = product.variants.find((variant) =>
    variant.images?.some((image) => image.url === product.thumbnail)
  )
  const variantId = selectedVariantId || defaultVariant?.id

  if (!variantId) {
    return []
  }

  const variant = product.variants.find((v) => v.id === variantId)
  if (!variant || !variant.images?.length) {
    return includeThumbnail([])
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  const associatedImages = (product.images ?? []).filter((i) => imageIdsMap.has(i.id))
  const optionValues = (variant.options ?? [])
    .map((option) => option.value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean)
  const optionMatchedImages = associatedImages.filter((image) => {
    const imageName = image.url.toLowerCase().replace(/[^a-z0-9]+/g, "")
    return optionValues.some((value) => imageName.includes(value))
  })
  const variantImages = optionMatchedImages.length > 0 ? optionMatchedImages : associatedImages

  return selectedVariantId ? variantImages : includeThumbnail(variantImages)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle, fields: "*images,+width,+height,+length,*categories,*collection,*variants.images,*variants.calculated_price," },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Apparel | The Quintessential`,
    description: product.description || product.title,
    openGraph: {
      title: `${product.title} | Apparel | The Quintessential`,
      description: product.description || product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ApparelProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle, fields: "*images,+width,+height,+length,*categories,*collection,*variants.images,*variants.calculated_price," },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}
