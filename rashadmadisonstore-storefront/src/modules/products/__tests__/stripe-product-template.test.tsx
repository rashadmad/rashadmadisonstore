import React from "react"
import { render, screen } from "@testing-library/react"

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { findMedusaProductForStripe } from "@lib/data/products"
import StripeProductTemplate from "../templates/stripe-product-template"

describe("StripeProductTemplate", () => {
  it("renders the product artwork and details for Stripe-backed gallery items", () => {
    render(
      <StripeProductTemplate
        product={{
          id: "prod_123",
          handle: "dream-state",
          name: "Dream State",
          medium: "Acrylic",
          theme: "Portrait",
          description: "A layered acrylic portrait with warm earth tones.",
          images: ["https://example.com/dream-state.jpg"],
          active: true,
          displayPrice: "$450.00",
          purchaseUrl: "https://buy.stripe.com/test_123",
        }}
      />
    )

    expect(screen.getByRole("heading", { name: /dream state/i })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /dream state/i })).toBeInTheDocument()
    expect(screen.getAllByText("Acrylic")).toHaveLength(1)
    expect(screen.queryByText("Medium")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: /back to gallery/i })).toHaveAttribute(
      "href",
      "/gallery"
    )
    expect(screen.getByRole("link", { name: /buy now/i })).toHaveAttribute(
      "href",
      "https://buy.stripe.com/test_123"
    )
    expect(screen.queryByText(/theme/i)).not.toBeInTheDocument()
  })

  it("matches a Stripe artwork to its Medusa product by handle metadata", async () => {
    const matchedProduct = {
      id: "medusa_456",
      handle: "african-princess-red",
      title: "African Princess Red",
      metadata: {
        product_handle: "african-princess-red",
      },
    }

    const stripeProduct = {
      id: "stripe_123",
      handle: "african-princess-red",
      name: "African Princess Red",
      medium: "Risograph",
      theme: "African",
      description: "Example description",
      images: ["https://example.com/african-princess-red.jpg"],
      active: true,
      displayPrice: "$500.00",
      metadata: {
        product_handle: "african-princess-red",
      },
    }

    await expect(
      findMedusaProductForStripe({
        countryCode: "us",
        stripeProduct,
        listProductsFn: async () => ({
          response: { products: [matchedProduct as any], count: 1 },
          nextPage: null,
        }),
      })
    ).resolves.toEqual(matchedProduct)
  })
})
