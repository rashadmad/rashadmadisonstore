import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-percentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any) => {
  if (!variant) {
    return null
  }

  let calculatedAmount: number | undefined
  let currencyCode: string | undefined
  let originalAmount: number | undefined

  if (variant.calculated_price && typeof variant.calculated_price.calculated_amount === "number") {
    calculatedAmount = variant.calculated_price.calculated_amount
    currencyCode = variant.calculated_price.currency_code
    originalAmount = variant.calculated_price.original_amount ?? calculatedAmount
  } else if (Array.isArray(variant.prices) && variant.prices.length > 0) {
    const usdPrice = variant.prices.find((p: any) => p.currency_code?.toLowerCase() === "usd")
    const priceObj = usdPrice || variant.prices[0]
    calculatedAmount = priceObj?.amount
    currencyCode = priceObj?.currency_code ?? "usd"
    originalAmount = calculatedAmount
  }

  if (typeof calculatedAmount !== "number") {
    return null
  }

  return {
    calculated_price_number: calculatedAmount,
    calculated_price: convertToLocale({
      amount: calculatedAmount,
      currency_code: currencyCode || "usd",
    }),
    original_price_number: originalAmount ?? calculatedAmount,
    original_price: convertToLocale({
      amount: originalAmount ?? calculatedAmount,
      currency_code: currencyCode || "usd",
    }),
    currency_code: currencyCode || "usd",
    price_type:
      variant.calculated_price?.calculated_price?.price_list_type ||
      variant.calculated_price?.price_list_type ||
      "default",
    percentage_diff: getPercentageDiff(originalAmount ?? calculatedAmount, calculatedAmount),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant: any =
      product.variants
        .filter((v: any) => {
          const amt = v.calculated_price?.calculated_amount ?? v.prices?.[0]?.amount
          return typeof amt === "number"
        })
        .sort((a: any, b: any) => {
          const aAmt = a.calculated_price?.calculated_amount ?? a.prices?.[0]?.amount ?? 0
          const bAmt = b.calculated_price?.calculated_amount ?? b.prices?.[0]?.amount ?? 0
          return aAmt - bAmt
        })[0] || product.variants[0]

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
