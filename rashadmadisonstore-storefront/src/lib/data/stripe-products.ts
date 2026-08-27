import "server-only"

export type StripeGalleryProduct = {
  id: string
  handle: string
  name: string
  medium: string
  theme: string
  description: string | null
  images: string[]
  active: boolean
  displayPrice: string
  purchaseUrl?: string
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

const getThemeLabel = (product: StripeProductResponse) => {
  const metadataTheme = getMetadataValue(product.metadata, "theme")

  if (metadataTheme) {
    return metadataTheme
  }

  const metadataDesign = getMetadataValue(product.metadata, "design")

  if (metadataDesign) {
    return metadataDesign
  }

  const nameParts = product.name
    .split(/[-|:]/)
    .map((part) => part.trim())
    .filter(Boolean)

  return nameParts[0] || "Ungrouped"
}

const getMediumLabel = (product: StripeProductResponse) => {
  const metadataMedium =
    getMetadataValue(product.metadata, "medium") ||
    getMetadataValue(product.metadata, "material")

  if (metadataMedium) {
    return metadataMedium
  }

  return "Unspecified Medium"
}

const getProductHandle = (product: StripeProductResponse) => {
  const metadataHandle =
    getMetadataValue(product.metadata, "handle") ||
    getMetadataValue(product.metadata, "slug") ||
    getMetadataValue(product.metadata, "product_handle")

  if (metadataHandle) {
    return metadataHandle
  }

  return (
    product.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || product.id
  )
}

const getPurchaseUrl = (product: StripeProductResponse) => {
  const urlKeys = [
    "purchase_url",
    "purchaseurl",
    "buy_url",
    "buyurl",
    "checkout_url",
    "checkouturl",
    "product_url",
    "producturl",
    "url",
  ]

  for (const key of urlKeys) {
    const value = getMetadataValue(product.metadata, key)
    if (value) {
      return value
    }
  }

  return ""
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
          handle: getProductHandle(product),
          name: product.name,
          medium: getMediumLabel(product),
          theme: getThemeLabel(product),
          description: product.description,
          images: product.images ?? [],
          active: product.active,
          displayPrice: formatPrice(product.default_price ?? null),
          purchaseUrl: getPurchaseUrl(product),
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
