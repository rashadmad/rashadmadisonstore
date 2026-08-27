import { render, screen } from "@testing-library/react"

import ProductPage, { generateMetadata } from "./page"
import { listProducts, findMedusaProductForStripe } from "@lib/data/products"
import { listStripeProducts } from "@lib/data/stripe-products"
import { getRegion } from "@lib/data/regions"

jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
  findMedusaProductForStripe: jest.fn(),
}))

jest.mock("@lib/data/stripe-products", () => ({
  listStripeProducts: jest.fn(),
}))

jest.mock("@lib/data/regions", () => ({
  getRegion: jest.fn(),
  listRegions: jest.fn(() => Promise.resolve([])),
}))

jest.mock("@modules/products/templates", () => ({
  __esModule: true,
  default: ({ product }: any) => <div data-testid="medusa-template">{product?.title}</div>,
}))

jest.mock("@modules/products/templates/stripe-product-template", () => ({
  __esModule: true,
  default: ({ product }: any) => (
    <div data-testid="stripe-template">{product?.name || product?.handle}</div>
  ),
}))

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

describe("Product page hero fallback handling", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(getRegion as jest.Mock).mockResolvedValue({ id: "reg_test" })
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: { products: [], count: 0 },
      nextPage: null,
    })
    ;(listStripeProducts as jest.Mock).mockResolvedValue({
      products: [],
      loadError: false,
      missingKey: true,
    })
    ;(findMedusaProductForStripe as jest.Mock).mockResolvedValue(null)
  })

  it("uses hero fallback metadata when Stripe products are unavailable", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ countryCode: "us", handle: "african-sunset" }),
      searchParams: Promise.resolve({}),
    } as any)

    expect(metadata.title).toBe("African Sunset | The Quintessential")
  })

  it("renders Stripe template from hero fallback when lookup misses", async () => {
    const page = await ProductPage({
      params: Promise.resolve({ countryCode: "us", handle: "prince" }),
      searchParams: Promise.resolve({}),
    } as any)

    render(page)

    expect(screen.getByTestId("stripe-template")).toHaveTextContent("Prince")
  })
})
