import React from "react"
import { render, screen } from "@testing-library/react"
import ImageGallery from "./index"

describe("ImageGallery", () => {
  it("shows the first product image and a hover back image when product is apparel and has multiple images", () => {
    const images = [
      { id: "img-1", url: "https://example.com/one.jpg" },
      { id: "img-2", url: "https://example.com/two.jpg" },
      { id: "img-3", url: "https://example.com/three.jpg" },
    ] as any

    render(<ImageGallery images={images} isApparel={true} />)

    const displayedImages = screen.getAllByRole("img")
    expect(displayedImages).toHaveLength(2)
    expect(displayedImages[0]).toHaveAttribute("src", expect.stringContaining("one.jpg"))
    expect(displayedImages[0]).toHaveClass("group-hover:opacity-0")
    expect(displayedImages[1]).toHaveAttribute("src", expect.stringContaining("two.jpg"))
    expect(displayedImages[1]).toHaveClass("opacity-0")
    expect(displayedImages[1]).toHaveClass("group-hover:opacity-100")
  })

  it("does not enable rollover or opacity fade on hover for non-apparel products with multiple images", () => {
    const images = [
      { id: "img-1", url: "https://example.com/fineart.jpg" },
      { id: "img-2", url: "https://example.com/detail.jpg" },
    ] as any

    render(
      <ImageGallery
        images={images}
        product={
          {
            id: "p_art",
            title: "African Sunset Fine Art",
            categories: [{ name: "Fine Art" }],
          } as any
        }
      />
    )

    const displayedImages = screen.getAllByRole("img")
    expect(displayedImages).toHaveLength(1)
    expect(displayedImages[0]).toHaveAttribute("src", expect.stringContaining("fineart.jpg"))
    expect(displayedImages[0]).not.toHaveClass("group-hover:opacity-0")
  })
})
