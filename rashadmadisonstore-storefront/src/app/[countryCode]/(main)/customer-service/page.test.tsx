import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import CustomerServicePage from "./page"

jest.mock("@modules/common/components/localized-client-link", () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe("CustomerServicePage component", () => {
  it("renders main heading, search input, and contact banner", () => {
    render(<CustomerServicePage />)

    expect(
      screen.getByRole("heading", { name: "Customer Service & FAQ", level: 1 })
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText("Search questions or keywords...")
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", { name: "Still have questions?", level: 2 })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /email rashadmad@gmail.com/i })
    ).toHaveAttribute("href", "mailto:rashadmad@gmail.com")

    expect(
      screen.getByRole("link", { name: /call or text 773-320-579/i })
    ).toHaveAttribute("href", "tel:773320579")
  })

  it("filters FAQ questions based on search query", () => {
    render(<CustomerServicePage />)

    const searchInput = screen.getByPlaceholderText("Search questions or keywords...")
    fireEvent.change(searchInput, { target: { value: "stripe" } })

    expect(
      screen.getByText("What payment methods do you accept?")
    ).toBeInTheDocument()

    expect(
      screen.queryByText("Does Rashad Madison accept custom art commissions?")
    ).not.toBeInTheDocument()
  })

  it("filters FAQ questions based on category buttons", () => {
    render(<CustomerServicePage />)

    const commissionsBtn = screen.getByRole("button", {
      name: "Commissions & Inquiries",
    })
    fireEvent.click(commissionsBtn)

    expect(
      screen.getByText("Does Rashad Madison accept custom art commissions?")
    ).toBeInTheDocument()

    expect(
      screen.queryByText("What payment methods do you accept?")
    ).not.toBeInTheDocument()
  })
})