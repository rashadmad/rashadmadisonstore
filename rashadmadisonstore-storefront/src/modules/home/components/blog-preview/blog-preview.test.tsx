import { render, screen } from "@testing-library/react"

import { listBlogPosts } from "@lib/data/blog"
import BlogPreview from "./index"

jest.mock("@lib/data/blog", () => ({
  listBlogPosts: jest.fn(),
}))

jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe("BlogPreview", () => {
  it("shows three recent posts and links to the blog", async () => {
    ;(listBlogPosts as jest.Mock).mockResolvedValue(
      [1, 2, 3, 4].map((index) => ({
        slug: `post-${index}`,
        category: "Process",
        title: `Post ${index}`,
        excerpt: `Excerpt ${index}`,
        image: index === 1 ? "/images/tenderHeadScreenPrint.jpeg" : null,
        imageAlt: index === 1 ? "Tender Head screen print" : `Post ${index}`,
        content: "",
      }))
    )

    render(await BlogPreview())

    expect(screen.getByRole("heading", { name: "From the studio journal" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Read all posts" })).toHaveAttribute("href", "/blog")
    expect(screen.getAllByRole("link", { name: "Read post" })).toHaveLength(3)
    expect(screen.getByText("Post 1")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Tender Head screen print" })).toBeInTheDocument()
    expect(screen.queryByText("Post 4")).not.toBeInTheDocument()
  })
})