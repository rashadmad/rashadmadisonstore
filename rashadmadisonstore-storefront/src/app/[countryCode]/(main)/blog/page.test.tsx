import { render, screen } from "@testing-library/react"

import BlogPage from "./page"
import { listMastodonPosts } from "@lib/data/mastodon"

jest.mock("@lib/data/mastodon", () => ({
  listMastodonPosts: jest.fn(),
}))

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("BlogPage", () => {
  it("renders the blog landing page content", async () => {
    ;(listMastodonPosts as jest.Mock).mockResolvedValue({
      posts: [
        {
          id: "mastodon_1",
          url: "https://mastodon.social/@rashadmad/123",
          createdAt: "2026-08-06T12:00:00.000Z",
          contentText: "A fresh update from Mastodon.",
        },
      ],
      loadError: false,
      profileUrl: "https://mastodon.social/@rashadmad",
    })

    const page = await BlogPage()
    render(page)

    expect(
      screen.getByRole("heading", {
        name: /writing from the practice behind the quintessential/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /read the artist background/i })
    ).toHaveAttribute("href", "/about")

    expect(screen.getByRole("heading", { name: /from mastodon/i })).toBeInTheDocument()
    expect(screen.getByText(/a fresh update from mastodon/i)).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: /read post/i }).length).toBeGreaterThan(0)

    expect(screen.getByText(/more essays, release notes, and studio updates/i)).toBeInTheDocument()
  })
})
