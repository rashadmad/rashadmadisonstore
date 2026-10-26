import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { HttpTypes } from "@medusajs/types"
import ShippingDetails from "."

it("shows the combined order shipping charge without repeating the USPS label", () => {
  const order = {
    currency_code: "usd",
    shipping_methods: [
      { name: "USPS Shipping", total: 9.5 },
      { name: "USPS Shipping", total: 3.13 },
    ],
  } as HttpTypes.StoreOrder
  render(<ShippingDetails order={order} />)
  expect(screen.getByTestId("shipping-method-summary")).toHaveTextContent("USPS Shipping ($12.63)")
  expect(screen.getAllByText(/USPS Shipping/)).toHaveLength(1)
})
