import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import NewsletterSubscription from "../components/newsletter"

describe("NewsletterSubscription", () => {
  it("shows validation error for invalid email", () => {
    render(<NewsletterSubscription />)

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "not-an-email" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }))

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument()
  })

  it("clears input and shows success for valid email", () => {
    render(<NewsletterSubscription />)

    const emailInput = screen.getByPlaceholderText("Enter your email") as HTMLInputElement

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }))

    expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument()
    expect(screen.getByText("Thanks for subscribing.")).toBeInTheDocument()
    expect(emailInput.value).toBe("")
  })
})
