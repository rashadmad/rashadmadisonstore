import { appCopy } from "@lib/copy"
import { listBlogPosts } from "@lib/data/blog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default async function BlogPreview() {
  const posts = (await listBlogPosts()).slice(0, 3)

  if (posts.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="home-blog-heading" className="bg-[#f6f1e7] py-14 text-[#17120d] sm:py-20">
      <div className="content-container">
        <div className="flex flex-col gap-5 border-b border-black/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f6b3b]">
              {appCopy.blog.eyebrow}
            </p>
            <h2 id="home-blog-heading" className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {appCopy.blog.preview.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#3b3024] sm:text-lg">
              {appCopy.blog.intro}
            </p>
          </div>
          <LocalizedClientLink
            href="/blog"
            className="inline-flex w-fit border-b border-[#2f6b3b] pb-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f6b3b] transition hover:border-[#17120d] hover:text-[#17120d]"
          >
            {appCopy.blog.preview.cta}
          </LocalizedClientLink>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article key={post.slug} className="border-b border-black/15 pb-7 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-6 first:lg:border-l-0 first:lg:pl-0">
              {post.image ? (
                <LocalizedClientLink href={`/blog/${post.slug}`} className="relative mb-5 block aspect-[4/3] overflow-hidden bg-[#e7dcc9]">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </LocalizedClientLink>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f6b3b]">
                {String(index + 1).padStart(2, "0")} / {post.category}
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight">{post.title}</h3>
              <p className="mt-4 text-base leading-7 text-[#3b3024]">{post.excerpt}</p>
              <LocalizedClientLink
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex text-sm font-semibold text-[#2f6b3b] underline underline-offset-4"
              >
                {appCopy.blog.preview.postCta}
              </LocalizedClientLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}