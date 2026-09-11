import { Metadata } from "next"
import Image from "next/image"
import { Fragment } from "react"

import { appCopy } from "@lib/copy"
import { listBlogPosts } from "@lib/data/blog"
import { listMastodonPosts } from "@lib/data/mastodon"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: appCopy.metadata.blog.title,
  description: appCopy.metadata.blog.description,
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function BlogPage() {
  const blogPosts = await listBlogPosts()
  const { posts: mastodonPosts, loadError, profileUrl } = await listMastodonPosts(6)

  return (
    <div className="bg-[#f6f1e7] text-[#17120d]">
      <section id="blog" aria-labelledby="blog-heading" className="border-b border-black/10 bg-[linear-gradient(135deg,#101b12_0%,#1f3822_60%,#0f1812_100%)] text-white">
        <div className="content-container grid gap-8 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-300/90">
              {appCopy.blog.eyebrow}
            </p>
            <h1 id="blog-heading" className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {appCopy.blog.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              {appCopy.blog.intro}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-yellow-300">
              {appCopy.blog.featured.label}
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              {appCopy.blog.featured.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              {appCopy.blog.featured.excerpt}
            </p>
            <LocalizedClientLink
              href={appCopy.blog.featured.href}
              className="mt-6 inline-flex items-center rounded-full border border-yellow-300 bg-yellow-300 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[#142013] transition hover:bg-transparent hover:text-yellow-300"
            >
              {appCopy.blog.featured.cta}
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section id="blog-posts" aria-label="Latest posts and updates" className="content-container py-14 sm:py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: Math.max(blogPosts.length, mastodonPosts.length) }).map((_, index) => {
            const blogPost = blogPosts[index]
            const mastodonPost = mastodonPosts[index]

            return (
              <Fragment key={`feed-${index}`}>
                {blogPost ? (
                  <article
                    key={`blog-${blogPost.slug}`}
                    className="overflow-hidden rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] shadow-[0_18px_35px_rgba(23,18,13,0.06)]"
                  >
                    {blogPost.image ? (
                      <LocalizedClientLink href={`/blog/${blogPost.slug}`} className="relative block aspect-[4/3] bg-[#e7dcc9]">
                        <Image
                          src={blogPost.image}
                          alt={blogPost.imageAlt}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </LocalizedClientLink>
                    ) : null}
                    <div className="p-6">
                      <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">{blogPost.category}</p>
                      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#17120d]">
                        {blogPost.title}
                      </h2>
                      <p className="mt-4 text-base leading-8 text-[#3b3024]">{blogPost.excerpt}</p>
                      <LocalizedClientLink
                        href={`/blog/${blogPost.slug}`}
                        className="mt-5 inline-flex text-sm font-semibold text-[#2f6b3b] underline underline-offset-4"
                      >
                        Read post
                      </LocalizedClientLink>
                    </div>
                  </article>
                ) : null}

                {mastodonPost ? (
                  <article
                    key={`mastodon-${mastodonPost.id}`}
                    className="overflow-hidden rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] shadow-[0_18px_35px_rgba(23,18,13,0.06)]"
                  >
                    <div className="p-6">
                      <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">
                        {dateFormatter.format(new Date(mastodonPost.createdAt))}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#17120d]">
                        From Mastodon
                      </h2>
                      <p className="mt-4 text-base leading-8 text-[#3b3024] whitespace-pre-line">
                        {mastodonPost.contentText}
                      </p>
                      <a
                        href={mastodonPost.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex text-sm font-semibold text-[#2f6b3b] underline underline-offset-4"
                      >
                        Open on Mastodon
                      </a>
                    </div>
                  </article>
                ) : null}
              </Fragment>
            )
          })}
        </div>

        {loadError ? (
          <div className="mt-10 rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] p-6 shadow-[0_18px_35px_rgba(23,18,13,0.06)]">
            <p className="text-base leading-8 text-[#3b3024]">
              Mastodon posts are temporarily unavailable. Visit the profile directly for the latest updates.
            </p>
          </div>
        ) : mastodonPosts.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] p-6 shadow-[0_18px_35px_rgba(23,18,13,0.06)]">
            <p className="text-base leading-8 text-[#3b3024]">
              No Mastodon posts are available yet.
            </p>
          </div>
        ) : null}

        <div className="mt-12 rounded-[1.75rem] border border-black/10 bg-[#e7dcc9] px-6 py-8 sm:px-8">
          <p className="text-lg leading-8 text-[#3b3024]">{appCopy.blog.closing}</p>
        </div>
      </section>
    </div>
  )
}
