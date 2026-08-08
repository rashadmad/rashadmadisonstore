import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { BLOG_MODULE } from "../../../../../../modules/blog"

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { slug } = req.params as { slug?: string }

  if (!slug) {
    res.status(400).json({ error: "slug is required." })
    return
  }

  const blogService = req.scope.resolve(BLOG_MODULE) as {
    listPosts: () => Promise<unknown>
  }

  const post = asArray(await blogService.listPosts()).find((entry) => {
    const currentPost = entry as { slug?: string; status?: string }
    return currentPost.slug === slug && currentPost.status === "published"
  })

  if (!post) {
    res.status(404).json({ error: "Post not found." })
    return
  }

  res.json({ post })
}
