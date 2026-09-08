import "server-only"

import { promises as fs } from "fs"
import matter from "gray-matter"
import path from "path"

export type BlogPost = {
  slug: string
  category: string
  title: string
  excerpt: string
  publishedAt: string
  image: string | null
  imageAlt: string
  content: string
}

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog")

const readBlogPost = async (fileName: string): Promise<BlogPost | null> => {
  const slug = fileName.replace(/\.md$/, "")
  const source = await fs.readFile(path.join(BLOG_DIRECTORY, fileName), "utf8")
  const { data, content } = matter(source)

  if (data.draft === true || !data.title) {
    return null
  }

  return {
    slug,
    category: typeof data.category === "string" ? data.category : "Blog",
    title: String(data.title),
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    publishedAt:
      data.publishedAt instanceof Date
        ? data.publishedAt.toISOString()
        : String(data.publishedAt || "1970-01-01"),
    image: typeof data.image === "string" ? data.image : null,
    imageAlt: typeof data.imageAlt === "string" ? data.imageAlt : String(data.title),
    content: content.trim(),
  }
}

export const listBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const fileNames = (await fs.readdir(BLOG_DIRECTORY)).filter(
      (fileName) => fileName.endsWith(".md") && !fileName.startsWith("_")
    )
    const posts = await Promise.all(fileNames.map(readBlogPost))

    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort(
        (first, second) =>
          new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
      )
  } catch {
    return []
  }
}

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null
  }

  try {
    return await readBlogPost(`${slug}.md`)
  } catch {
    return null
  }
}
