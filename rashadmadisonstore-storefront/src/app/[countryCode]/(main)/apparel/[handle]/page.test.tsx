import { render, screen } from "@testing-library/react"
import ApparelProductPage from "./page"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
}))

jest.mock("@lib/data/regions", () => ({
  getRegion: jest.fn(),
  listRegions: jest.fn().mockResolvedValue([]),
}))

jest.mock("@modules/products/templates", () => ({
  __esModule: true,
  default: ({ product }: any) => <div data-testid="product-template">{product.title}</div>,
}))

describe("ApparelProductPage", () => {
  it("renders product page template for apparel shirt product", async () => {
    ;(getRegion as jest.Mock).mockResolvedValue({ id: "reg_1", name: "US" })
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: {
        products: [
          {
            id: "prod_1",
            title: "Quintessential Shirt",
            handle: "quintessential-shirt",
            thumbnail: "https://example.com/front.jpg",
            images: [{ id: "img_1", url: "https://example.com/front.jpg" }],
            variants: [],
          },
        ],
      },
    })

    const page = await ApparelProductPage({
      params: Promise.resolve({ countryCode: "us", handle: "quintessential-shirt" }),
      searchParams: Promise.resolve({}),
    })

    render(page)

    expect(screen.getByTestId("product-template")).toBeInTheDocument()
    expect(screen.getByText("Quintessential Shirt")).toBeInTheDocument()
  })
})
