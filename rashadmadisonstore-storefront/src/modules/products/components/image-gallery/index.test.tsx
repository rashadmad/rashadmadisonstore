import React from "react"
import { render, screen } from "@testing-library/react"
import ImageGallery from "./index"

describe("ImageGallery", () => {
  it("shows only the first product image when multiple images are available", () => {
    const images = [
      { id: "img-1", url: "https://example.com/one.jpg" },
      { id: "img-2", url: "https://example.com/two.jpg" },
      { id: "img-3", url: "https://example.com/three.jpg" },
    ] as any

    render(<ImageGallery images={images} />)

    const displayedImages = screen.getAllByRole("img")
    expect(displayedImages).toHaveLength(1)
    expect(displayedImages[0]).toHaveAttribute("src", expect.stringContaining("one.jpg"))
  })
})
