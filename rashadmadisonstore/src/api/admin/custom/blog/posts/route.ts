import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { BLOG_MODULE } from "../../../../../modules/blog"

type BlogPostPayload = {
  slug?: string
  title?: string
  excerpt?: string
  content?: string
  status?: string
}

const normalize = (value: string) => value.trim().replace(/\s+/g, " ")

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService = req.scope.resolve(BLOG_MODULE) as {
    listPosts: () => Promise<unknown>
  }

  const posts = asArray(await blogService.listPosts())

  res.json({
    posts,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as BlogPostPayload
  const slug = normalize(body.slug || "")
  const title = normalize(body.title || "")
  const excerpt = normalize(body.excerpt || "")
  const content = normalize(body.content || "")
  const status = normalize(body.status || "draft")

  if (!slug || !title || !excerpt || !content) {
    res.status(400).json({
      error: "slug, title, excerpt, and content are required.",
    })
    return
  }

  const blogService = req.scope.resolve(BLOG_MODULE) as {
    createPosts: (data: Record<string, unknown>) => Promise<unknown>
  }

  const created = await blogService.createPosts({
    slug,
    title,
    excerpt,
    content,
    status,
  })

  res.status(201).json({
    post: created,
  })
}
