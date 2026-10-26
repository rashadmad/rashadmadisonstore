import { StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  listShippingOptionsForCartWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  CHICAGO_FREE_SHIPPING_RULE,
  isChicagoAreaAddress,
} from "../../lib/chicago-shipping"

type ShippingContextInput = {
  cart: {
    shipping_address?: Parameters<typeof isChicagoAreaAddress>[0]
  }
}

export function chicagoShippingContext({ cart }: ShippingContextInput) {
  return new StepResponse({
    [CHICAGO_FREE_SHIPPING_RULE]: String(
      isChicagoAreaAddress(cart.shipping_address)
    ),
  })
}

listShippingOptionsForCartWorkflow.hooks.setShippingOptionsContext(
  chicagoShippingContext
)
listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(
  chicagoShippingContext
)
