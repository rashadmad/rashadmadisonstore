import { render, screen, within } from "@testing-library/react"

import BentoProductGrid from "./index"

const makeProduct = (overrides: Partial<any> = {}) => ({
  id: overrides.id || "prod_default",
  name: overrides.name || "Default Product",
  design: overrides.design || "Identity",
  description: overrides.description || "Gallery item description",
  images: overrides.images || ["https://example.com/default.jpg"],
  active: true,
  displayPrice: overrides.displayPrice || "$25.00",
})

describe("BentoProductGrid", () => {
  it("builds each bento card with 5 image boxes from grouped products", () => {
    render(
      <BentoProductGrid
        products={[
          makeProduct({
            id: "prod_1",
            name: "One",
            images: ["https://example.com/a1.jpg"],
          }),
          makeProduct({
            id: "prod_2",
            name: "Two",
            images: ["https://example.com/b1.jpg"],
          }),
          makeProduct({
            id: "prod_3",
            name: "Three",
            images: ["https://example.com/c1.jpg"],
          }),
        ]}
      />
    )

    const listItems = screen.getAllByRole("listitem")
    expect(listItems).toHaveLength(1)

    const images = within(listItems[0]).getAllByRole("img")
    expect(images).toHaveLength(5)
    expect(images[0]).toHaveAttribute("src", "https://example.com/a1.jpg")
    expect(images[1]).toHaveAttribute("src", "https://example.com/c1.jpg")
    expect(images[2]).toHaveAttribute("src", "https://example.com/b1.jpg")
  })

  it("splits the same detail group into sets of 3 products", () => {
    render(
      <BentoProductGrid
        products={[
          makeProduct({ id: "prod_1", name: "One" }),
          makeProduct({ id: "prod_2", name: "Two" }),
          makeProduct({ id: "prod_3", name: "Three" }),
          makeProduct({ id: "prod_4", name: "Four" }),
        ]}
      />
    )

    const listItems = screen.getAllByRole("listitem")
    expect(listItems).toHaveLength(2)

    expect(screen.getByText(/featuring:\s*four, one, three/i)).toBeInTheDocument()
    expect(screen.getByText(/featuring:\s*two/i)).toBeInTheDocument()
  })
})
