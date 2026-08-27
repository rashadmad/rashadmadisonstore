import { Metadata } from "next"
import { notFound } from "next/navigation"
import { findMedusaProductForStripe, listProducts } from "@lib/data/products"
import { listStripeProducts, type StripeGalleryProduct } from "@lib/data/stripe-products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import StripeProductTemplate from "@modules/products/templates/stripe-product-template"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

const HERO_ARTWORK_FALLBACK_PRODUCTS: StripeGalleryProduct[] = [
  {
    id: "fallback-african-sunset",
    handle: "african-sunset",
    name: "African Sunset",
    medium: "Original Artwork",
    theme: "Gallery",
    description: null,
    images: [
      "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784665145/7034_akrxuz.jpg",
    ],
    active: true,
    displayPrice: "Price available on request",
  },
  {
    id: "fallback-african-princess-red",
    handle: "african-princess-red",
    name: "African Princess Red",
    medium: "Original Artwork",
    theme: "Gallery",
    description: null,
    images: [
      "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784772775/africanPrincess_atuxqk.jpg",
    ],
    active: true,
    displayPrice: "Price available on request",
  },
  {
    id: "fallback-tender-head",
    handle: "tender-head",
    name: "Tender Head",
    medium: "Original Artwork",
    theme: "Gallery",
    description: null,
    images: [
      "https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342820/tenderhead_vgseur.jpg",
    ],
    active: true,
    displayPrice: "Price available on request",
  },
  {
    id: "fallback-prince",
    handle: "prince",
    name: "Prince",
    medium: "Original Artwork",
    theme: "Gallery",
    description: null,
    images: [
      "https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342819/prince_dczlzy.jpg",
    ],
    active: true,
    displayPrice: "Price available on request",
  },
  {
    id: "fallback-zulu-husband",
    handle: "zulu-husband",
    name: "Zulu Husband",
    medium: "Original Artwork",
    theme: "Gallery",
    description: null,
    images: [
      "https://res.cloudinary.com/dxj8b6h12/image/upload/v1784773272/ZuluHusband_mr2por.png",
    ],
    active: true,
    displayPrice: "Price available on request",
  },
]

const getHeroFallbackProduct = (handle: string) =>
  HERO_ARTWORK_FALLBACK_PRODUCTS.find((product) => product.handle === handle) ?? null

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
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images!.filter((i) => imageIdsMap.has(i.id))
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
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (product) {
    return {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      openGraph: {
        title: `${product.title} | Medusa Store`,
        description: `${product.title}`,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  }

  const stripeProduct = await listStripeProducts().then(({ products }) =>
    products.find((item) => item.handle === handle) ?? null
  )

  const fallbackProduct = getHeroFallbackProduct(handle)
  const resolvedStripeProduct = stripeProduct ?? fallbackProduct

  if (!resolvedStripeProduct) {
    notFound()
  }

  return {
    title: `${resolvedStripeProduct.name} | The Quintessential`,
    description: resolvedStripeProduct.description || resolvedStripeProduct.name,
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (pricedProduct) {
    const images = getImagesForVariant(pricedProduct, selectedVariantId)

    return (
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images}
      />
    )
  }

  const stripeProduct = await listStripeProducts().then(({ products }) =>
    products.find((item) => item.handle === params.handle) ?? null
  )

  const fallbackProduct = getHeroFallbackProduct(params.handle)
  const resolvedStripeProduct = stripeProduct ?? fallbackProduct

  if (!resolvedStripeProduct) {
    notFound()
  }

  const mappedMedusaProduct = await findMedusaProductForStripe({
    countryCode: params.countryCode,
    stripeProduct: resolvedStripeProduct,
  })

  if (mappedMedusaProduct) {
    const images = mappedMedusaProduct.images ?? []

    return (
      <ProductTemplate
        product={mappedMedusaProduct}
        region={region}
        countryCode={params.countryCode}
        images={images}
      />
    )
  }

  return <StripeProductTemplate product={resolvedStripeProduct} />
}
