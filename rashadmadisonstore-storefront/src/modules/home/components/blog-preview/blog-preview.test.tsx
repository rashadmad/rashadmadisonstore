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
  it("shows real posts first and fills remaining slots with coming soon cards", async () => {
    ;(listBlogPosts as jest.Mock).mockResolvedValue(
      [1].map((index) => ({
        slug: `post-${index}`,
        category: "Process",
        title: `Post ${index}`,
        excerpt: `Excerpt ${index}`,
        image: "/images/tenderHeadScreenPrint.jpeg",
        imageAlt: "Tender Head screen print",
        content: "",
      }))
    )

    render(await BlogPreview())

    expect(screen.getByRole("heading", { name: "From the studio journal" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Read all posts" })).toHaveAttribute("href", "/blog")
    expect(screen.getByText("Post 1")).toBeInTheDocument()
    expect(screen.getAllByText("Blog post coming soon")).toHaveLength(2)
    expect(screen.getByRole("img", { name: "Tender Head screen print" })).toBeInTheDocument()
    expect(screen.getByText("Read post")).toBeInTheDocument()
  })
})