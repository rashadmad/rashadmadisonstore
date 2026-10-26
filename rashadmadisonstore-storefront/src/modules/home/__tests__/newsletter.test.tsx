import React from "react"
import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { appCopy } from "@lib/copy"
import NewsletterSubscription from "../components/newsletter"

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

const mockFetch = jest.fn()

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText("First name"), {
    target: { value: " First " },
  })
  fireEvent.change(screen.getByPlaceholderText("Last name"), {
    target: { value: " Last " },
  })
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
    target: { value: "person@example.com" },
  })
}
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Join the list" }))

describe("NewsletterSubscription", () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({ ok: true })
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: mockFetch,
    })
  })

  it.each(["First name", "Last name"])(
    "requires a nonblank %s",
    (placeholder) => {
      render(<NewsletterSubscription />)
      fillForm()
      fireEvent.change(screen.getByPlaceholderText(placeholder), {
        target: { value: "  " },
      })
      submit()
      expect(
        screen.getByText(appCopy.newsletter.validation.requiredName)
      ).toBeInTheDocument()
      expect(mockFetch).not.toHaveBeenCalled()
    }
  )

  it("rejects an invalid email before saving", () => {
    render(<NewsletterSubscription />)
    fillForm()
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "not-an-email" },
    })
    submit()
    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("requires explicit consent and links to the privacy policy", () => {
    render(<NewsletterSubscription />)
    fillForm()
    submit()
    expect(
      screen.getByText("Please agree to receive newsletter emails.")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Privacy Policy" })
    ).toHaveAttribute("href", "/content/privacy-policy")
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("waits for a successful save, then replaces all newsletter content with the thank-you", async () => {
    let finish!: (response: { ok: boolean }) => void
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      })
    )
    render(<NewsletterSubscription />)
    fillForm()
    fireEvent.click(screen.getByRole("checkbox"))
    submit()

    expect(screen.getByRole("button")).toBeDisabled()
    expect(
      screen.queryByText(appCopy.newsletter.thankYouLabel)
    ).not.toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "person@example.com",
        firstName: "First",
        lastName: "Last",
        consent: true,
      }),
    })
    await act(async () => {
      finish({ ok: true })
    })

    expect(
      screen.getByText("Thank you for taking interest in my practice")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Looking forward to taking you on the journey with me.",
      })
    ).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.queryByText("Studio updates")).not.toBeInTheDocument()
    expect(
      screen.queryByText(appCopy.newsletter.description)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(appCopy.newsletter.highlights.first.title)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(appCopy.newsletter.highlights.second.title)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(appCopy.newsletter.highlights.third.title)
    ).not.toBeInTheDocument()
  })

  it.each(["http", "network"])(
    "keeps the form available after a %s failure",
    async (failure) => {
      if (failure === "http") mockFetch.mockResolvedValue({ ok: false })
      else mockFetch.mockRejectedValue(new Error("Network unavailable"))
      render(<NewsletterSubscription />)
      fillForm()
      fireEvent.click(screen.getByRole("checkbox"))
      submit()
      expect(
        await screen.findByText(appCopy.newsletter.validation.error)
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText("First name")).toHaveValue(" First ")
      expect(
        screen.getByRole("button", { name: "Join the list" })
      ).toBeEnabled()
      expect(
        screen.queryByText(appCopy.newsletter.thankYouLabel)
      ).not.toBeInTheDocument()
    }
  )
})
