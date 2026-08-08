import { Metadata } from "next"
import { notFound } from "next/navigation"

import { appCopy } from "@lib/copy"
import { getBlogPostBySlug, listBlogPosts } from "@lib/data/blog"
import { retrieveCustomer } from "@lib/data/customer"
import PostComments from "@modules/blog/components/post-comments"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
})

type BlogPostPageProps = {
  params: Promise<{ slug: string; countryCode: string }> | { slug: string; countryCode: string }
}

export async function generateStaticParams() {
  const posts = await listBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getBlogPostBySlug(resolvedParams.slug)

  if (!post) {
    return {
      title: "Post Not Found | The Quintessential",
      description: appCopy.metadata.blog.description,
    }
  }

  return {
    title: `${post.title} | The Quintessential`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const post = await getBlogPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  const customer = await retrieveCustomer().catch(() => null)
  const authorName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")

  return (
    <div className="bg-[#f6f1e7] text-[#17120d]">
      <article className="content-container py-12 sm:py-16 lg:py-20">
        <LocalizedClientLink
          href="/blog"
          className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6b3b] underline underline-offset-4"
        >
          Back to blog
        </LocalizedClientLink>

        <div className="mt-6 rounded-[1.75rem] border border-black/10 bg-[#fbf7ef] p-7 shadow-[0_18px_35px_rgba(23,18,13,0.06)] sm:p-10">
          <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">{post.category}</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#7a6a57]">
            Published {dateFormatter.format(new Date())}
          </p>

          <div className="mt-8 space-y-5">
            {post.content.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-8 text-[#3b3024]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      <PostComments
        slug={post.slug}
        defaultAuthor={authorName || customer?.email || ""}
        isLoggedIn={!!customer}
      />
    </div>
  )
}
