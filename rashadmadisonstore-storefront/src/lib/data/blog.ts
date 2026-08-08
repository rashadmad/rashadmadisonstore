import "server-only"

import { appCopy } from "@lib/copy"
import { sdk } from "@lib/config"

export type BlogPost = (typeof appCopy.blog.posts)[number]

const normalizeBlogPost = (post: Partial<BlogPost> & { slug?: string }) => {
  if (!post.slug) {
    return null
  }

  return {
    slug: post.slug,
    category: post.category || "Blog",
    title: post.title || post.slug,
    excerpt: post.excerpt || "",
    content: Array.isArray(post.content) ? post.content : [],
  } as BlogPost
}

export const listBlogPosts = async () => {
  try {
    const response = await sdk.client.fetch<{ posts?: BlogPost[] }>(
      "/store/custom/blog/posts",
      {
        method: "GET",
        cache: "no-store",
      }
    )

    const posts = (response.posts || [])
      .map((post) => normalizeBlogPost(post))
      .filter(Boolean) as BlogPost[]

    return posts.length > 0 ? posts : appCopy.blog.posts
  } catch {
    return appCopy.blog.posts
  }
}

export const getBlogPostBySlug = async (slug: string) => {
  try {
    const response = await sdk.client.fetch<{ post?: BlogPost }>(
      `/store/custom/blog/posts/${slug}`,
      {
        method: "GET",
        cache: "no-store",
      }
    )

    const post = response.post ? normalizeBlogPost(response.post) : null

    if (post) {
      return post
    }
  } catch {
    // Fall back to static copy below.
  }

  return appCopy.blog.posts.find((post) => post.slug === slug) || null
}
