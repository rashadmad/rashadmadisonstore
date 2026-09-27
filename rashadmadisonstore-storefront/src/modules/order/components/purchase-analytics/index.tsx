"use client"

import { sendGAEvent } from "@lib/gtag"
import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

type PurchaseAnalyticsProps = {
  order: HttpTypes.StoreOrder
}

export default function PurchaseAnalytics({ order }: PurchaseAnalyticsProps) {
  useEffect(() => {
    const storageKey = `ga4-purchase-${order.id}`

    if (sessionStorage.getItem(storageKey)) {
      return
    }

    sendGAEvent("purchase", {
      transaction_id: order.id,
      currency: order.currency_code.toUpperCase(),
      value: order.total,
      tax: order.tax_total,
      shipping: order.shipping_total,
      items: (order.items ?? []).map((item) => ({
        item_id: item.variant_id,
        item_name: item.product_title,
        item_variant: item.variant?.title ?? item.variant?.sku,
        price: item.unit_price,
        quantity: item.quantity,
      })),
    })

    sessionStorage.setItem(storageKey, "sent")
  }, [order])

  return null
}
