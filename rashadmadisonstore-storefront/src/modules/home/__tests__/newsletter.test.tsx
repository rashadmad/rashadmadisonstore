import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import NewsletterSubscription from "../components/newsletter"

const mockFetch = jest.fn()

describe("NewsletterSubscription", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true })
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: mockFetch,
    })
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  it("shows validation error for invalid email", () => {
    render(<NewsletterSubscription />)

    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "Rashad" },
    })
    fireEvent.change(screen.getByPlaceholderText("Last name"), {
      target: { value: "Madison" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "not-an-email" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Join the list" }))

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument()
  })

  it("sends names and email, then clears the form", async () => {
    render(<NewsletterSubscription />)

    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "Rashad" },
    })
    fireEvent.change(screen.getByPlaceholderText("Last name"), {
      target: { value: "Madison" },
    })
    const emailInput = screen.getByPlaceholderText("Enter your email") as HTMLInputElement

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Join the list" }))

    expect(await screen.findByText("Thanks for joining the list.")).toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          firstName: "Rashad",
          lastName: "Madison",
        }),
      })
    )
    expect(emailInput.value).toBe("")
  })
})
