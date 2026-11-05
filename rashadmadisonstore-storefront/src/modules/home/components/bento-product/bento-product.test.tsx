import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import BentoProductGrid from "./index"

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

const product = (overrides: any = {}) => ({
  subtitle: null,
  description: null,
  is_giftcard: false,
  status: "published" as const,
  thumbnail: null,
  width: null,
  weight: null,
  length: null,
  height: null,
  origin_country: null,
  hs_code: null,
  mid_code: null,
  material: null,
  collection_id: null,
  type_id: null,
  options: [],
  discountable: true,
  external_id: null,
  created_at: null,
  updated_at: null,
  deleted_at: null,
  id: overrides.id || "product_1",
  handle: overrides.handle || "sample-artwork",
  title: overrides.title || "Sample Artwork",
  images: overrides.images || [{ id: "image_1", url: "https://example.com/art.jpg" }],
  categories: overrides.categories || [{ id: "category_1", name: "Fine Art" }],
  collection: overrides.collection || { id: "collection_1", title: "Identity", handle: "identity" },
  variants: overrides.variants || [],
})

describe("BentoProductGrid", () => {
  it.each([5, 6, 9, 10, 11, 15])("continues the bento pattern for %i artwork products", (count) => {
    const products = Array.from({ length: count }, (_, index) => product({
      id: `product_${index}`,
      handle: `artwork-${index}`,
      title: `Artwork ${index}`,
    }))
    render(<BentoProductGrid products={products} />)

    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(count)
    links.forEach((link, index) => {
    expect(link).toHaveAttribute("href", `/products/artwork-${index}`)
    const tile = link.parentElement!
    const groupSize = Math.min(5, count - Math.floor(index / 5) * 5)
    const expectedObjectPosition =
      groupSize === 5 && index % 5 === 1 ? "50% 50%" : "50% 65%"
    expect(
      screen.getByRole("img", { name: `Identity image ${index + 1}` })
    ).toHaveStyle({ objectPosition: expectedObjectPosition })
      if (groupSize === 5) {
        expect(tile.parentElement).toHaveClass("grid-cols-6", "grid-rows-2")
        const layoutClasses = [
          ["col-span-3", "row-span-2"],
          ["col-span-3", "row-span-1"],
          ["col-start-4", "row-start-2"],
          ["col-start-5", "row-start-2"],
          ["col-start-6", "row-start-2"],
        ]
        expect(tile).toHaveClass(...layoutClasses[index % 5])
      } else {
        expect(tile.parentElement).not.toHaveClass("grid-cols-6")
      }
      expect(screen.getByRole("img", { name: `Identity image ${index + 1}` })).toBeInTheDocument()
    })
  })
  it.each([1, 2, 3, 4, 5])("bounds image sizing for a group of %i products", (count) => {
      render(<BentoProductGrid products={Array.from({ length: count }, (_, index) =>
        product({ id: `bounded_${index}`, handle: `bounded-${index}` })
      )} />)
      screen.getAllByRole("img").forEach((image, index) => {
        expect(image).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover")
        expect(image).toHaveStyle({
          objectPosition: count === 5 && index === 1 ? "50% 50%" : "50% 65%",
        })
      })
      const tile = screen.getAllByRole("link")[0].parentElement!
      expect(tile).toHaveClass("min-h-0", "min-w-0", "overflow-hidden")
      const heights = ["h-[320px]", "h-[600px]", "h-[900px]", "h-[480px]", "h-[360px]"]
      expect(tile.parentElement).toHaveClass(heights[count - 1])
  })
  it("groups Medusa products by category and collection", () => {
    render(<BentoProductGrid products={[product() as any]} />)

    expect(screen.getByRole("heading", { level: 2, name: "Fine Art" })).toBeInTheDocument()
    expect(
      screen.getByText("One-of-one original works made with archival materials.")
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 4, name: "Identity" })).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(1)
  })

  it("allows artwork and apparel product names to wrap across two lines", () => {
    render(
      <>
        <BentoProductGrid products={[product({ title: "A Longer Artwork Title" }) as any]} />
        <BentoProductGrid
          variant="apparel"
          products={[product({ id: "shirt", title: "A Longer Apparel Title" }) as any]}
        />
      </>
    )

    expect(screen.getByText("A Longer Artwork Title")).toHaveClass("line-clamp-2")
    expect(screen.getByText("A Longer Apparel Title")).toHaveClass("line-clamp-2")
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

  it("uses variant images for the apparel back view when product images are not the second shot", () => {
    render(
      <BentoProductGrid
        variant="apparel"
        products={[
          product({
            thumbnail: "https://example.com/front.jpg",
            images: [{ id: "front", url: "https://example.com/front.jpg" }],
            variants: [
              {
                id: "variant_1",
                images: [
                  { id: "front", url: "https://example.com/front.jpg" },
                  { id: "back", url: "https://example.com/back.jpg" },
                ],
              },
            ],
          }) as any,
        ]}
      />
    )

    const imgs = screen.getAllByRole("img")
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/front.jpg")
    expect(imgs[1]).toHaveAttribute("src", "https://example.com/back.jpg")
    expect(screen.getByText("Back")).toBeInTheDocument()
  })

  it("renders small collection description paragraph under collection title", () => {
    render(
      <BentoProductGrid
        products={[
          product({
            collection: {
              id: "coll_tender",
              title: "Tender Head",
              description: "Custom description for Tender Head collection.",
            },
          }) as any,
        ]}
      />
    )

    expect(screen.getByRole("heading", { level: 4, name: "Tender Head" })).toBeInTheDocument()
    expect(
      screen.getByText("Custom description for Tender Head collection.")
    ).toBeInTheDocument()
  })

  it("renders unique collection descriptions tailored to specific artwork collections", () => {
    render(
      <BentoProductGrid
        products={[
          product({
            id: "p_prince",
            title: "Prince Fine Art",
            collection: { id: "coll_prince", title: "Prince" },
          }) as any,
        ]}
      />
    )

    expect(screen.getByRole("heading", { level: 4, name: "Prince" })).toBeInTheDocument()
    expect(
      screen.getByText("A regal portrait series honoring nobility, sovereignty, and the enduring dignity of Black youth.")
    ).toBeInTheDocument()
  })
})
