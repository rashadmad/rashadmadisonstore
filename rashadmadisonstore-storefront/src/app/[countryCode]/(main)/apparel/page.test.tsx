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
        }],
        count: 1,
      },
      nextPage: null,
    })

    const page = await ApparelPage({ params: Promise.resolve({ countryCode: "us" }) })
    render(page)

    expect(screen.getByRole("heading", { level: 1, name: "Apparel" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Apparel highlights" })).toBeInTheDocument()
    expect(screen.getAllByText("Quintessential Shirt").length).toBeGreaterThan(0)
    expect(listProducts).toHaveBeenCalledWith(expect.objectContaining({
      countryCode: "us",
      queryParams: expect.objectContaining({ category_id: ["pcat_01M156N3KC165P2FA7SBQ9CG7B"] }),
    }))
  })
})
