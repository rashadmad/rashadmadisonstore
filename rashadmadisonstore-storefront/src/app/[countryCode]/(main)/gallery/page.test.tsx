import { render, screen } from "@testing-library/react"

import GalleryPage from "./page"
import { listProducts } from "@lib/data/products"

jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
}))

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe("GalleryPage", () => {
  it("renders Medusa products grouped by category and collection", async () => {
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: {
        products: [
          {
            id: "prod_1",
            handle: "sample-artwork",
            title: "Sample Artwork",
            description: "A vivid piece for the gallery.",
            images: [{ id: "img_1", url: "https://example.com/thumb.jpg" }],
            categories: [{ id: "cat_1", name: "Fine Art" }],
            collection: { id: "collection_1", title: "Identity", handle: "identity" },
            variants: [{ calculated_price: { calculated_amount: 2500, currency_code: "usd", original_amount: 2500, calculated_price: { price_list_type: "default" } } }],
          },
        ],
        count: 1,
      },
      nextPage: null,
    })

    const page = await GalleryPage({ params: Promise.resolve({ countryCode: "us" }) })
    render(page)

    expect(screen.getByRole("heading", { name: /gallery/i })).toBeInTheDocument()
    expect(screen.getByText("Fine Art")).toBeInTheDocument()
    expect(screen.getByText("Identity")).toBeInTheDocument()
    expect(screen.getAllByText("Sample Artwork").length).toBeGreaterThan(0)
  })

  it("shows a Medusa load error", async () => {
    ;(listProducts as jest.Mock).mockRejectedValue(new Error("Medusa unavailable"))

    const page = await GalleryPage({ params: Promise.resolve({ countryCode: "us" }) })
    render(page)

    expect(screen.getByText(/could not load gallery/i)).toBeInTheDocument()
    expect(screen.getByText(/medusa product data is unavailable/i)).toBeInTheDocument()
  })
})
