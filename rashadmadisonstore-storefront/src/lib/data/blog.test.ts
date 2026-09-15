jest.mock("server-only", () => ({}))

import { getBlogPostBySlug, listBlogPosts } from "./blog"

describe("Markdown blog loader", () => {
  it("loads published Markdown posts in newest-first order", async () => {
    const posts = await listBlogPosts()

    expect(posts.map((post) => post.slug)).toEqual([
      "how-tender-head-came-to-be",
    ])
    expect(posts[0].image).toBe("/images/tenderHead_salon.png")
    expect(posts[0].imageAlt).toBe("Tender Head screen print")
  })

  it("loads one post by its filename slug", async () => {
    const post = await getBlogPostBySlug("how-tender-head-came-to-be")

    expect(post?.title).toBe("How tender head came to be")
    expect(post?.category).toBe("Art Process")
  })

  it("rejects unsafe slugs", async () => {
    await expect(getBlogPostBySlug("../copy")).resolves.toBeNull()
  })
})