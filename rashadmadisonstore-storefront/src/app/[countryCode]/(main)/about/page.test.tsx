import { fireEvent, render, screen } from "@testing-library/react"

import AboutPage from "./page"

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("AboutPage", () => {
  it("renders the about page content and route links", () => {
    render(<AboutPage />)

    expect(
      screen.getByRole("heading", {
        name: /I see things others don't/i,
      })
    ).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /browse the gallery/i })).toHaveAttribute(
      "href",
      "/gallery"
    )
    expect(screen.getByRole("link", { name: /browse the gallery/i })).toHaveClass(
      "border-b-4",
      "border-green-800",
      "bg-green-600",
      "text-white"
    )
    expect(screen.getByRole("link", { name: /view collections/i })).toHaveAttribute(
      "href",
      "/collections"
    )
    expect(screen.getByRole("link", { name: /view collections/i })).toHaveClass(
      "border-b-4",
      "border-green-700",
      "bg-green-500",
      "text-white"
    )
    expect(screen.getByRole("link", { name: /visit the store/i })).toHaveAttribute(
      "href",
      "/store"
    )
    expect(screen.getByRole("link", { name: /visit the store/i })).toHaveClass(
      "border-b-4",
      "border-green-800",
      "bg-green-600",
      "text-white"
    )
  })

  it("opens a larger modal when clicking a practice image", () => {
    render(<AboutPage />)

    fireEvent.click(screen.getByRole("button", { name: /view identity image/i }))

    expect(screen.getByRole("img", { name: /tender head drawing study/i })).toBeInTheDocument()
  })
})
