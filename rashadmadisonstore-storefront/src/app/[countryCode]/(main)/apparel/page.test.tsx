import { render, screen } from "@testing-library/react"

import ApparelPage from "./page"
import { listProducts } from "@lib/data/products"

jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
}))

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe("ApparelPage", () => {
  it("renders Medusa apparel products", async () => {
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: {
        products: [{
          id: "apparel_1",
          handle: "quintessential-shirt",
          title: "Quintessential Shirt",
          images: [{ id: "image_1", url: "https://example.com/shirt.jpg" }],
          categories: [{ id: "category_1", name: "Apparel" }],
          collection: { id: "collection_1", title: "Wearables", handle: "wearables" },
          variants: [],
        }, {
          id: "art_1",
          handle: "african-princess",
          title: "African Princess",
          images: [{ id: "image_2", url: "https://example.com/art.jpg" }],
          categories: [{ id: "category_2", name: "African" }],
          collection: { id: "collection_2", title: "Prints", handle: "prints" },
          variants: [],
        }],
        count: 2,
      },
      nextPage: null,
    })

    const page = await ApparelPage({ params: Promise.resolve({ countryCode: "us" }) })
    render(page)

    expect(screen.getByRole("heading", { level: 1, name: "Apparel" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Shop apparel" })).toHaveAttribute(
      "href",
      "#products"
    )
    expect(screen.getByRole("list", { name: "Apparel highlights" })).toBeInTheDocument()
    expect(screen.getAllByText("Quintessential Shirt").length).toBeGreaterThan(0)
    expect(screen.queryByText("African Princess")).not.toBeInTheDocument()
    expect(listProducts).toHaveBeenCalledWith(expect.objectContaining({
      countryCode: "us",
      queryParams: expect.not.objectContaining({ category_id: expect.anything() }),
    }))
  })
})
