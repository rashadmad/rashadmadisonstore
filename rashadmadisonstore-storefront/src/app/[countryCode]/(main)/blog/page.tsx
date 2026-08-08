import { Metadata } from "next"

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
      <section className="border-b border-black/10 bg-[linear-gradient(135deg,#101b12_0%,#1f3822_60%,#0f1812_100%)] text-white">
        <div className="content-container grid gap-8 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-300/90">
              {appCopy.blog.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
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

      <section className="content-container py-14 sm:py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] p-6 shadow-[0_18px_35px_rgba(23,18,13,0.06)]"
            >
              <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">{post.category}</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#17120d]">
                {post.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#3b3024]">{post.excerpt}</p>
              <LocalizedClientLink
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex text-sm font-semibold text-[#2f6b3b] underline underline-offset-4"
              >
                Read post
              </LocalizedClientLink>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[1.75rem] border border-[#204025]/15 bg-[#fbf7ef] p-6 shadow-[0_18px_35px_rgba(23,18,13,0.06)] sm:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[#17120d] sm:text-3xl">From Mastodon</h2>
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-[#2f6b3b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f6b3b] transition hover:bg-[#2f6b3b] hover:text-white"
            >
              Follow @rashadmad
            </a>
          </div>

          {loadError ? (
            <p className="text-base leading-8 text-[#3b3024]">
              Mastodon posts are temporarily unavailable. Visit the profile directly for the latest updates.
            </p>
          ) : mastodonPosts.length === 0 ? (
            <p className="text-base leading-8 text-[#3b3024]">
              No Mastodon posts are available yet.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {mastodonPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-[#204025]/15 bg-[#f4ebda] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f6b3b]">
                    {dateFormatter.format(new Date(post.createdAt))}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-base leading-8 text-[#3b3024]">
                    {post.contentText}
                  </p>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex text-sm font-semibold text-[#2f6b3b] underline underline-offset-4"
                  >
                    Open on Mastodon
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 rounded-[1.75rem] border border-black/10 bg-[#e7dcc9] px-6 py-8 sm:px-8">
          <p className="text-lg leading-8 text-[#3b3024]">{appCopy.blog.closing}</p>
        </div>
      </section>
    </div>
  )
}
