import { render, screen } from "@testing-library/react"

import GalleryPage from "./page"
import { listStripeProducts } from "@lib/data/stripe-products"

jest.mock("@lib/data/stripe-products", () => ({
  listStripeProducts: jest.fn(),
}))

describe("GalleryPage", () => {
  it("renders Stripe products in the bento gallery", async () => {
    ;(listStripeProducts as jest.Mock).mockResolvedValue({
      products: [
        {
          id: "prod_1",
          name: "Sample Artwork",
          description: "A vivid piece for the gallery.",
          images: ["https://example.com/thumb.jpg"],
          active: true,
          displayPrice: "$25.00",
        },
      ],
      loadError: false,
      missingKey: false,
    })

    const page = await GalleryPage({
      params: Promise.resolve({ countryCode: "us" }),
    } as any)

    render(page)

    expect(screen.getByRole("heading", { name: /gallery/i })).toBeInTheDocument()
    expect(screen.getByText(/featuring:\s*sample artwork/i)).toBeInTheDocument()
    expect(screen.getByText("$25.00")).toBeInTheDocument()
  })

  it("shows Stripe configuration guidance when secret key is missing", async () => {
    ;(listStripeProducts as jest.Mock).mockResolvedValue({
      products: [],
      loadError: false,
      missingKey: true,
    })

    const page = await GalleryPage({
      params: Promise.resolve({ countryCode: "us" }),
    } as any)

    render(page)

    expect(screen.getByText(/stripe is not configured/i)).toBeInTheDocument()
    expect(
      screen.getByText(/add stripe_secret_key to your environment/i)
    ).toBeInTheDocument()
  })

  it("shows Stripe error details when loading fails", async () => {
    ;(listStripeProducts as jest.Mock).mockResolvedValue({
      products: [],
      loadError: true,
      missingKey: false,
      errorMessage: "Invalid API Key provided: sk_test_***",
    })

    const page = await GalleryPage({
      params: Promise.resolve({ countryCode: "us" }),
    } as any)

    render(page)

    expect(screen.getByText(/could not load gallery/i)).toBeInTheDocument()
    expect(screen.getByText(/details: invalid api key provided/i)).toBeInTheDocument()
  })
})
