import "server-only"

export type StripeGalleryProduct = {
  id: string
  name: string
  design: string
  description: string | null
  images: string[]
  active: boolean
  displayPrice: string
}

type StripeProductsResult = {
  products: StripeGalleryProduct[]
  loadError: boolean
  missingKey: boolean
  errorMessage?: string
}

type StripePrice = {
  currency?: string
  unit_amount?: number | null
}

type StripeProductResponse = {
  id: string
  name: string
  description: string | null
  images: string[]
  active: boolean
  metadata?: Record<string, string>
  default_price: StripePrice | string | null
}

type StripeListResponse = {
  data: StripeProductResponse[]
  has_more: boolean
}

const hasArtTag = (metadata?: Record<string, string>) => {
  if (!metadata) {
    return false
  }

  const businessValue = Object.entries(metadata).find(
    ([key]) => key.toLowerCase() === "buisness"
  )?.[1]

  const rawTagValue = businessValue || metadata.tag || metadata.tags || ""

  return rawTagValue
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("art")
}

const formatPrice = (price: StripePrice | string | null) => {
  if (!price || typeof price === "string") {
    return "Price available on request"
  }

  if (!price.unit_amount || !price.currency) {
    return "Price available on request"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
  }).format(price.unit_amount / 100)
}

const getMetadataValue = (
  metadata: Record<string, string> | undefined,
  key: string
) => {
  if (!metadata) {
    return ""
  }

  const found = Object.entries(metadata).find(
    ([entryKey]) => entryKey.toLowerCase() === key.toLowerCase()
  )

  return found?.[1]?.trim() ?? ""
}

const getDesignLabel = (product: StripeProductResponse) => {
  const metadataDesign =
    getMetadataValue(product.metadata, "design") ||
    getMetadataValue(product.metadata, "series") ||
    getMetadataValue(product.metadata, "collection") ||
    getMetadataValue(product.metadata, "theme")

  if (metadataDesign) {
    return metadataDesign
  }

  const nameParts = product.name
    .split(/[-|:]/)
    .map((part) => part.trim())
    .filter(Boolean)

  return nameParts[0] || "Ungrouped"
}

export const listStripeProducts = async (): Promise<StripeProductsResult> => {
  const configuredKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY
  const secretKey = configuredKey ? configuredKey.trim().replace(/^['\"]|['\"]$/g, "") : ""

  if (!secretKey) {
    return {
      products: [],
      loadError: false,
      missingKey: true,
    }
  }

  if (!secretKey.startsWith("sk_")) {
    return {
      products: [],
      loadError: true,
      missingKey: false,
      errorMessage:
        "Configured Stripe key is not a secret key. Use STRIPE_SECRET_KEY with a value that starts with sk_.",
    }
  }

  try {
    const allProducts: StripeGalleryProduct[] = []
    let hasMore = true
    let startingAfter: string | undefined = undefined

    while (hasMore) {
      const query = new URLSearchParams({
        active: "true",
        limit: "100",
      })

      query.append("expand[]", "data.default_price")

      if (startingAfter) {
        query.append("starting_after", startingAfter)
      }

      const response = await fetch(`https://api.stripe.com/v1/products?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        const stripeMessage = errorPayload?.error?.message

        throw new Error(
          stripeMessage || `Stripe returned ${response.status} while loading products.`
        )
      }

      const payload = (await response.json()) as StripeListResponse

      for (const product of payload.data) {
        if (!hasArtTag(product.metadata)) {
          continue
        }

        allProducts.push({
          id: product.id,
          name: product.name,
          design: getDesignLabel(product),
          description: product.description,
          images: product.images ?? [],
          active: product.active,
          displayPrice: formatPrice(product.default_price ?? null),
        })
      }

      hasMore = payload.has_more
      startingAfter = payload.data.length
        ? payload.data[payload.data.length - 1].id
        : undefined
    }

    return {
      products: allProducts,
      loadError: false,
      missingKey: false,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Stripe products."

    return {
      products: [],
      loadError: true,
      missingKey: false,
      errorMessage: message,
    }
  }
}
