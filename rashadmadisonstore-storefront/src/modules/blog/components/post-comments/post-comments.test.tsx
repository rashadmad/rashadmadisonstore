import React from "react"
import { render, screen, waitFor } from "@testing-library/react"

import PostComments from "."

jest.mock("@modules/common/components/localized-client-link", () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe("PostComments", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it("shows a friendly error when loading comments returns an empty response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue(""),
    }) as typeof fetch

    render(<PostComments slug="test-post" isLoggedIn={false} />)

    await waitFor(() => {
      expect(screen.getByText("Failed to load comments.")).toBeInTheDocument()
    })

    expect(screen.queryByText("Unexpected end of JSON input")).not.toBeInTheDocument()
  })
})