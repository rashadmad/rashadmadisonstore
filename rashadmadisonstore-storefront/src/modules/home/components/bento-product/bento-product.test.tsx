import { render, screen } from "@testing-library/react"
import BentoProductGrid from "./index"

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

const product = (overrides: any = {}) => ({
  id: overrides.id || "product_1",
  handle: overrides.handle || "sample-artwork",
  title: overrides.title || "Sample Artwork",
  images: overrides.images || [{ id: "image_1", url: "https://example.com/art.jpg" }],
  categories: overrides.categories || [{ id: "category_1", name: "Fine Art" }],
  collection: overrides.collection || { id: "collection_1", title: "Identity", handle: "identity" },
  variants: overrides.variants || [],
})

describe("BentoProductGrid", () => {
  it("groups Medusa products by category and collection", () => {
    render(<BentoProductGrid products={[product() as any]} />)

    expect(screen.getByRole("heading", { level: 2, name: "Fine Art" })).toBeInTheDocument()
    expect(
      screen.getByText("One-of-one original works made with archival materials.")
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 4, name: "Identity" })).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(1)
  })

  it("keeps products in separate Medusa category sections", () => {
    render(
      <BentoProductGrid
        products={[
          product({ id: "one", title: "One", categories: [{ name: "Prints" }] }) as any,
          product({ id: "two", title: "Two", categories: [{ name: "Originals" }] }) as any,
        ]}
      />
    )

    expect(screen.getByRole("heading", { level: 2, name: "Prints" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "Originals" })).toBeInTheDocument()
  })

  it("does not include front/back hover logic for non-apparel products", () => {
    render(
      <BentoProductGrid
        products={[
          product({
            thumbnail: "https://example.com/default.jpg",
            images: [
              { id: "default", url: "https://example.com/default.jpg" },
              { id: "variant", url: "https://example.com/variant.jpg" },
            ],
          }) as any,
        ]}
      />
    )

    const imgs = screen.getAllByRole("img")
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/default.jpg")
    expect(screen.queryByText("Front")).not.toBeInTheDocument()
    expect(screen.queryByText("Back")).not.toBeInTheDocument()
  })

  it("includes front and back hover logic for apparel products", () => {
    render(
      <BentoProductGrid
        variant="apparel"
        products={[
          product({
            thumbnail: "https://example.com/default.jpg",
            images: [
              { id: "default", url: "https://example.com/default.jpg" },
              { id: "variant", url: "https://example.com/variant.jpg" },
            ],
          }) as any,
        ]}
      />
    )

    const imgs = screen.getAllByRole("img")
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/default.jpg")
    expect(imgs[1]).toHaveAttribute("src", "https://example.com/variant.jpg")
    expect(screen.getByText("Front")).toBeInTheDocument()
    expect(screen.getByText("Back")).toBeInTheDocument()
  })
})
