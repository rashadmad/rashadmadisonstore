import React from "react"
import "@testing-library/jest-dom"
import { render, screen, within } from "@testing-library/react"
import { getBlogPostBySlug } from "@lib/data/blog"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import BlogPostPage from "./page"

jest.mock("@lib/data/blog", () => ({
  getBlogPostBySlug: jest.fn(),
  listBlogPosts: jest.fn(),
}))
jest.mock("@lib/data/customer", () => ({
  retrieveCustomer: jest.fn().mockResolvedValue(null),
}))
jest.mock("@lib/data/products", () => ({
  listProducts: jest.fn(),
}))
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))
jest.mock("rehype-raw", () => ({ __esModule: true, default: jest.fn() }))
jest.mock("@modules/blog/components/post-comments", () => ({
  __esModule: true,
  default: () => <section aria-label="Comments" />,
}))
jest.mock("@modules/common/components/localized-client-link", () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

const loadPost = jest.mocked(getBlogPostBySlug)
const loadProducts = jest.mocked(listProducts)

describe("Blog post artwork promotion", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    loadProducts.mockResolvedValue({
      response: {
        products: [{
          id: "prod_screenprint",
          title: "Tender Head",
          handle: "tender-head-screenprint",
          thumbnail: "http://localhost:9000/static/tenderhead.jpeg",
          variants: [{
            id: "variant_screenprint",
            calculated_price: {
              calculated_amount: 350, original_amount: 350, currency_code: "usd",
            },
          }],
        } as HttpTypes.StoreProduct],
        count: 1,
      },
      nextPage: null,
    })
  })
  const post = {
    slug: "how-tender-head-came-to-be",
    title: "How Tender Head Came to Be",
    category: "Art Process",
    excerpt: "The story behind Tenderhead.",
    publishedAt: "2026-09-03",
    image: null,
    imageAlt: "Tenderhead",
    content: "Thank you for reading my story.",
  }

  it("places a Tenderhead shopping card after the story and before comments", async () => {
    loadPost.mockResolvedValue(post)
    render(await BlogPostPage({ params: { slug: post.slug, countryCode: "us" } }))

    const card = screen.getByRole("region", { name: "Bring this piece home" })
    expect(within(card).getByRole("link"))
      .toHaveAttribute("href", "/products/tender-head-screenprint")
    expect(within(card).getByRole("img", { name: "Tender Head" })).toBeInTheDocument()
    expect(within(card).getByText("$350.00")).toBeInTheDocument()
    expect(screen.queryByText("Shop the Tenderhead print")).not.toBeInTheDocument()
    expect(loadProducts).toHaveBeenCalledWith({
      countryCode: "us",
      queryParams: { handle: "tender-head-screenprint", limit: 1 },
    })
    expect(screen.getByText(post.content).compareDocumentPosition(card))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(card.compareDocumentPosition(screen.getByRole("region", { name: "Comments" })))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it("does not promote Tenderhead on other posts", async () => {
    loadPost.mockResolvedValue({ ...post, slug: "another-post" })
    render(await BlogPostPage({ params: { slug: "another-post", countryCode: "us" } }))
    expect(screen.queryByRole("region", { name: "Bring this piece home" }))
      .not.toBeInTheDocument()
    expect(loadProducts).not.toHaveBeenCalled()
  })

  it("shows an explicit unavailable message when the print is no longer listed", async () => {
    loadPost.mockResolvedValue(post)
    loadProducts.mockResolvedValue({ response: { products: [], count: 0 }, nextPage: null })
    render(await BlogPostPage({ params: { slug: post.slug, countryCode: "us" } }))
    expect(screen.getByText("This print is currently unavailable.")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Bring this piece home" }))
      .queryByRole("link")).not.toBeInTheDocument()
  })
})
