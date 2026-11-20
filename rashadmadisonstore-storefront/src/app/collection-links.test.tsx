import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { HttpTypes } from "@medusajs/types"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import CollectionsPage from "./[countryCode]/(main)/collections/page"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import ProductInfo from "@modules/products/templates/product-info"

jest.mock("@lib/data/collections", () => ({ listCollections: jest.fn() }))
jest.mock("@lib/data/products", () => ({ listProducts: jest.fn() }))
jest.mock("@modules/products/components/product-preview", () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const apparel = { id: "apparel", title: "Apparel", handle: "apparel" } as HttpTypes.StoreCollection
const art = { id: "art", title: "Art", handle: "art" } as HttpTypes.StoreCollection

describe("collection links", () => {
  it("links apparel to the apparel page without changing other collections", async () => {
    jest.mocked(listCollections).mockResolvedValue({
      collections: [apparel, art],
      count: 2,
      limit: 10,
      offset: 0,
    })
    render(await CollectionsPage())

    expect(screen.getByRole("link", { name: /Apparel/ })).toHaveAttribute("href", "/apparel")
    expect(screen.getByRole("link", { name: /Art/ })).toHaveAttribute("href", "/collections/art")
  })

  it("links the featured apparel collection to the apparel page", async () => {
    jest.mocked(listProducts).mockResolvedValue({
      response: { products: [{ id: "shirt" } as HttpTypes.StoreProduct], count: 1 },
      nextPage: null,
    })
    render(await ProductRail({ collection: apparel, region: { id: "reg" } as HttpTypes.StoreRegion }))

    expect(screen.getByRole("link", { name: /explore collection/i })).toHaveAttribute("href", "/apparel")
  })

  it("links an apparel product back to the apparel page", () => {
    render(<ProductInfo product={{ id: "shirt", title: "Shirt", collection: apparel } as HttpTypes.StoreProduct} />)

    expect(screen.getByRole("link", { name: "Apparel" })).toHaveAttribute("href", "/apparel")
  })
})
