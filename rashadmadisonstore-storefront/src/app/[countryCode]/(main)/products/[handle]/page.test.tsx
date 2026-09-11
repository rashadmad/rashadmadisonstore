import { render, screen } from "@testing-library/react"

import ProductPage, { generateMetadata } from "./page"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
}))

jest.mock("@lib/data/regions", () => ({
  getRegion: jest.fn(),
  listRegions: jest.fn(() => Promise.resolve([])),
}))

jest.mock("@modules/products/templates", () => ({
  __esModule: true,
  default: ({ product }: any) => <div data-testid="medusa-template">{product?.title}</div>,
}))

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

describe("Medusa product page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRegion as jest.Mock).mockResolvedValue({ id: "reg_test" })
  })

  it("uses the Medusa product for metadata", async () => {
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: { products: [{ title: "African Sunset", thumbnail: "image.jpg", description: "A print" }], count: 1 },
      nextPage: null,
    })

    const metadata = await generateMetadata({
      params: Promise.resolve({ countryCode: "us", handle: "african-sunset" }),
      searchParams: Promise.resolve({}),
    } as any)

    expect(metadata.title).toBe("African Sunset | The Quintessential")
  })

  it("renders the Medusa product template", async () => {
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: { products: [{ id: "medusa_1", title: "Prince", images: [], variants: [] }], count: 1 },
      nextPage: null,
    })

    const page = await ProductPage({
      params: Promise.resolve({ countryCode: "us", handle: "prince" }),
      searchParams: Promise.resolve({}),
    } as any)

    render(page)
    expect(screen.getByTestId("medusa-template")).toHaveTextContent("Prince")
  })

  it("requests product images in the product query", async () => {
    ;(listProducts as jest.Mock).mockResolvedValue({
      response: {
        products: [{ id: "medusa_1", title: "Prince", images: [{ id: "img_1", url: "a.jpg" }], variants: [] }],
        count: 1,
      },
      nextPage: null,
    })

    await ProductPage({
      params: Promise.resolve({ countryCode: "us", handle: "prince" }),
      searchParams: Promise.resolve({}),
    } as any)

    expect(listProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: "us",
        queryParams: expect.objectContaining({
          handle: "prince",
          fields: expect.stringContaining("*images"),
        }),
      })
    )
  })
})
