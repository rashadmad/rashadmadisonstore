jest.mock("server-only", () => ({}))

import { getBlogPostBySlug, listBlogPosts } from "./blog"

describe("Markdown blog loader", () => {
  it("loads published Markdown posts in newest-first order", async () => {
    const posts = await listBlogPosts()

    expect(posts.map((post) => post.slug)).toEqual([
      "print-from-sketch-to-final-layer",
      "series-as-visual-language",
      "what-support-funds",
    ])
    expect(posts[0].content).toContain("Every print begins")
    expect(posts[0].image).toBe("/images/tenderHeadScreenPrint.jpeg")
    expect(posts[0].imageAlt).toBe("Tender Head screen print")
  })

  it("loads one post by its filename slug", async () => {
    const post = await getBlogPostBySlug("series-as-visual-language")

    expect(post?.title).toBe("How a series becomes a visual language")
    expect(post?.category).toBe("Collections")
  })

  it("rejects unsafe slugs", async () => {
    await expect(getBlogPostBySlug("../copy")).resolves.toBeNull()
  })
})