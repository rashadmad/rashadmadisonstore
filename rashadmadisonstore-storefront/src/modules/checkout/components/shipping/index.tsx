"use client"

import { applyAutomaticShipping } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "@lib/context/navigation"
import { useEffect, useState } from "react"

const Shipping = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const isOpen = useSearchParams().get("step") === "delivery"
  const pathname = usePathname()
  const router = useRouter()
  const [shipping, setShipping] = useState<{ amount: number; local: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const fingerprint = JSON.stringify([
    cart.id, cart.currency_code, cart.shipping_address,
    cart.items?.map((item) => [item.id, item.variant_id, item.quantity]),
  ])

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setShipping(null)
    setError(null)
    setIsLoading(true)
    applyAutomaticShipping()
      .then((result) => { if (active) setShipping(result) })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to calculate shipping. Please try again.")
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [isOpen, fingerprint, attempt])

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2" className="flex text-3xl-regular gap-x-2 items-baseline">
          Delivery
          {!isOpen && !!cart.shipping_methods?.length && <CheckCircleSolid />}
        </Heading>
        {!isOpen && !!cart.shipping_methods?.length && (
          <button
            onClick={() => router.push(pathname + "?step=delivery", { scroll: false })}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            View shipping
          </button>
        )}
      </div>
      {isOpen ? (
        <>
          <Text className="mb-4">
            We ship via USPS within the United States. Shipping is calculated automatically
            from each product&apos;s packaging profile; there is no service to choose.
            Delivery times vary.
          </Text>
          <Text className="mb-4">
            Items are ordered by shipping rate, highest first. Each group of three
            items ships at full price, half price, then free. Every copy counts as
            an item. Half-price charges are rounded to the nearest cent.
            Eligible Chicago-area ZIP codes receive free shipping on the entire order.
          </Text>
          <div aria-live="polite" data-testid="automatic-shipping-summary">
            {isLoading && <Text>Calculating shipping...</Text>}
            {shipping && (
              <Text>
                {shipping.local ? "Free Chicago-area shipping" : "USPS Shipping"}:{" "}
                {convertToLocale({ amount: shipping.amount, currency_code: cart.currency_code })}
              </Text>
            )}
          </div>
          <ErrorMessage error={error} data-testid="delivery-option-error-message" />
          {error && (
            <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
              Retry shipping calculation
            </Button>
          )}
          <Button
            className="mt-6 w-full"
            isLoading={isLoading}
            disabled={isLoading || !shipping || !!error}
            onClick={() => router.push(pathname + "?step=payment", { scroll: false })}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </>
      ) : (
        !!cart.shipping_methods?.length && (
          <Text>
            Shipping: {convertToLocale({
              amount: cart.shipping_methods.reduce((sum, method) => sum + method.amount, 0),
              currency_code: cart.currency_code,
            })}
          </Text>
        )
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
