import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { BLOG_MODULE } from "../../../../../../../modules/blog"

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

const normalize = (value: string) => value.trim().replace(/\s+/g, " ")

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
    listComments: () => Promise<unknown>
  }

  const comments = asArray(await blogService.listComments()).filter((comment) => {
    const currentComment = comment as { post_slug?: string }
    return currentComment.post_slug === slug
  })

  res.json({ comments })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { slug } = req.params as { slug?: string }
  const body = (req.body || {}) as { author?: string; message?: string }

  if (!slug) {
    res.status(400).json({ error: "slug is required." })
    return
  }

  const author = normalize(body.author || "")
  const message = normalize(body.message || "")

  if (!author || !message) {
    res.status(400).json({ error: "author and message are required." })
    return
  }

  const blogService = req.scope.resolve(BLOG_MODULE) as {
    createComments: (data: Record<string, unknown>) => Promise<unknown>
  }

  const created = await blogService.createComments({
    post_slug: slug,
    author,
    message,
    status: "published",
  })

  res.status(201).json({ comment: created })
}
