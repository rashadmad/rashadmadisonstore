import { render, screen } from "@testing-library/react"

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
        name: /rashad madison builds images that carry memory, symbol, and black presence forward/i,
      })
    ).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /browse the gallery/i })).toHaveAttribute(
      "href",
      "/gallery"
    )
    expect(screen.getByRole("link", { name: /view collections/i })).toHaveAttribute(
      "href",
      "/collections"
    )
    expect(screen.getByRole("link", { name: /visit the store/i })).toHaveAttribute(
      "href",
      "/store"
    )
  })
})
