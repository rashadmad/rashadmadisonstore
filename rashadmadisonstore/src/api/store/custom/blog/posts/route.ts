import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { BLOG_MODULE } from "../../../../../modules/blog"

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

  const posts = asArray(await blogService.listPosts()).filter((post) => {
    return (post as { status?: string }).status === "published"
  })

  res.json({
    posts,
  })
}
