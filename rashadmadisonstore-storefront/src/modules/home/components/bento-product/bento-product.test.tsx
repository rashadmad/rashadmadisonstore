import { render, screen, within } from "@testing-library/react"

import BentoProductGrid from "./index"

const makeProduct = (overrides: Partial<any> = {}) => ({
  id: overrides.id || "prod_default",
  name: overrides.name || "Default Product",
  medium: overrides.medium || "Acrylic",
  theme: overrides.theme || "Identity",
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

  it("keeps the same theme in one bento box and adds extra image tiles", () => {
    render(
      <BentoProductGrid
        products={[
          makeProduct({
            id: "prod_1",
            name: "One",
            images: ["https://example.com/one-1.jpg", "https://example.com/one-2.jpg"],
          }),
          makeProduct({
            id: "prod_2",
            name: "Two",
            images: ["https://example.com/two-1.jpg", "https://example.com/two-2.jpg"],
          }),
          makeProduct({
            id: "prod_3",
            name: "Three",
            images: ["https://example.com/three-1.jpg", "https://example.com/three-2.jpg"],
          }),
          makeProduct({
            id: "prod_4",
            name: "Four",
            images: ["https://example.com/four-1.jpg", "https://example.com/four-2.jpg"],
          }),
        ]}
      />
    )

    const listItems = screen.getAllByRole("listitem")
    expect(listItems).toHaveLength(1)

    expect(screen.getByText(/featuring:\s*four, one, three, two/i)).toBeInTheDocument()

    const images = within(listItems[0]).getAllByRole("img")
    expect(images.length).toBeGreaterThan(5)
  })

  it("keeps products with different themes in separate bento boxes", () => {
    render(
      <BentoProductGrid
        products={[
          makeProduct({ id: "prod_1", name: "Mask One", theme: "Masks" }),
          makeProduct({ id: "prod_2", name: "Mask Two", theme: "Masks" }),
          makeProduct({ id: "prod_3", name: "Ancestor One", theme: "Ancestors" }),
        ]}
      />
    )

    expect(screen.getAllByText("Masks")).toHaveLength(2)
    expect(screen.getAllByText("Ancestors")).toHaveLength(2)
    expect(screen.getByText(/featuring:\s*mask one, mask two/i)).toBeInTheDocument()
    expect(screen.getByText(/featuring:\s*ancestor one/i)).toBeInTheDocument()
  })

  it("sorts bento sections by medium, then by theme", () => {
    render(
      <BentoProductGrid
        products={[
          makeProduct({ id: "prod_1", name: "Zulu", medium: "Oil", theme: "Zulu" }),
          makeProduct({ id: "prod_2", name: "Alpha", medium: "Acrylic", theme: "Masks" }),
          makeProduct({ id: "prod_3", name: "Beta", medium: "Oil", theme: "Ancestors" }),
        ]}
      />
    )

    const mediumHeadings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent)
    expect(mediumHeadings).toEqual(["Acrylic", "Oil"])

    const oilSection = screen.getByRole("heading", { level: 2, name: "Oil" }).closest("section")
    expect(oilSection).not.toBeNull()

    const oilThemeHeadings = within(oilSection as HTMLElement)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent)
    expect(oilThemeHeadings).toEqual(["Ancestors", "Zulu"])
  })
})
