import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

import { appCopy } from "@lib/copy"
import { getBlogPostBySlug, listBlogPosts } from "@lib/data/blog"
import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
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
  const featuredProduct = post.slug === "how-tender-head-came-to-be"
    ? (await listProducts({
        countryCode: resolvedParams.countryCode,
        queryParams: { handle: "tender-head-screenprint", limit: 1 },
      })).response.products[0]
    : undefined
  const featuredPrice = featuredProduct
    ? getProductPrice({ product: featuredProduct }).cheapestPrice
    : null
  const featuredImage = featuredProduct?.thumbnail || featuredProduct?.images?.[0]?.url

  return (
    <div className="bg-[#f6f1e7] text-[#17120d]">
      <article className="content-container py-12 sm:py-16 lg:py-20">
        <LocalizedClientLink
          href="/blog"
          className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6b3b] underline underline-offset-4"
        >
          Back to blog
        </LocalizedClientLink>

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(140px,180px)_minmax(0,1fr)_minmax(140px,180px)] lg:gap-6 xl:gap-8">
          <aside aria-label="Advertisement" className="hidden lg:block">
            <div className="sticky top-8 min-h-[600px] border border-dashed border-[#2f6b3b]/35 bg-[#e7dcc9]/45 p-4">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a6a57]">
                Advertisement
              </p>
              <div data-ad-slot="blog-sidebar-left" className="mt-4 min-h-[520px]" />
            </div>
          </aside>

          <div className="rounded-[1.75rem] border border-black/10 bg-[#fbf7ef] p-7 shadow-[0_18px_35px_rgba(23,18,13,0.06)] sm:p-10">
            <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">{post.category}</p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#7a6a57]">
              Published {dateFormatter.format(new Date(post.publishedAt))}
            </p>

            {post.image ? (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-[#e7dcc9]">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 800px"
                />
              </div>
            ) : null}

            <div className="blog-content mt-8 space-y-5 text-lg leading-8 text-[#3b3024] [&_a]:font-semibold [&_a]:text-[#2f6b3b] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#2f6b3b] [&_blockquote]:pl-5 [&_h2]:pt-5 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:pt-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ node, style, className, ...props }: any) => (
                    <img
                      {...props}
                      style={style}
                      className={`h-auto rounded-xl my-4 ${className || ""}`.trim()}
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {post.slug === "how-tender-head-came-to-be" ? (
              <section
                aria-labelledby="bring-this-piece-home"
                className="mt-12 clear-both rounded-2xl border border-[#2f6b3b]/20 bg-[#e7dcc9]/45 p-6 sm:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6b3b]">
                  From the studio to your space
                </p>
                <h2
                  id="bring-this-piece-home"
                  className="mt-3 font-display text-3xl font-semibold"
                >
                  Bring this piece home
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#3b3024]">
                  If Tenderhead&apos;s story resonates with you, explore the print
                  and bring a celebration of Black beauty, identity, and heritage
                  into your space.
                </p>
                {featuredProduct && featuredPrice ? (
                  <LocalizedClientLink
                    href={`/products/${featuredProduct.handle}`}
                    className="group mt-6 block overflow-hidden rounded-xl border border-[#2f6b3b]/20 bg-[#fbf7ef] transition hover:border-[#2f6b3b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b3b]"
                  >
                    {featuredImage ? (
                      <div className="relative aspect-square bg-[#e7dcc9]">
                        <Image
                          src={featuredImage}
                          alt={featuredProduct.title}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 640px) 100vw, 600px"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                      <span className="text-lg font-semibold text-[#2f6b3b]">
                        {featuredProduct.title}
                      </span>
                      <span className="text-lg font-semibold">
                        {featuredProduct.variants && featuredProduct.variants.length > 1 ? "From " : ""}
                        {featuredPrice.calculated_price}
                      </span>
                    </div>
                  </LocalizedClientLink>
                ) : (
                  <p className="mt-6 text-[#7a6a57]">
                    This print is currently unavailable.
                  </p>
                )}
              </section>
            ) : null}
          </div>

          <aside aria-label="Advertisement" className="hidden lg:block">
            <div className="sticky top-8 min-h-[600px] border border-dashed border-[#2f6b3b]/35 bg-[#e7dcc9]/45 p-4">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a6a57]">
                Advertisement
              </p>
              <div data-ad-slot="blog-sidebar-right" className="mt-4 min-h-[520px]" />
            </div>
          </aside>
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
