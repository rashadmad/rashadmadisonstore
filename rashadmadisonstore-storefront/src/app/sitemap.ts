import type { MetadataRoute } from "next"
import { listBlogPosts } from "@lib/data/blog"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

export const dynamic = "force-dynamic"

const localizedUrl = (baseUrl: URL, countryCode: string, path: string) =>
  new URL(`/${countryCode}${path}`, baseUrl).toString()

const encodeHandle = (handle: string) =>
  handle.split("/").map(encodeURIComponent).join("/")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = new URL(getBaseURL())
  const regions = await listRegions()
  const countryCodes = Array.from(
    new Set(
      regions.flatMap((region) =>
        region.countries
          ?.map((country) => country.iso_2?.toLowerCase())
          .filter((countryCode): countryCode is string => Boolean(countryCode)) ??
          []
      )
    )
  )

  if (!countryCodes.length) {
    return []
  }

  const [categories, collectionsResponse, blogPosts] = await Promise.all([
    listCategories(),
    listCollections({ fields: "handle,updated_at", limit: "100" }),
    listBlogPosts(),
  ])
  const entries: MetadataRoute.Sitemap = []

  for (const countryCode of countryCodes) {
    const fixedRoutes = [
      "",
      "/about",
      "/apparel",
      "/blog",
      "/customer-service",
      "/faq",
      "/gallery",
      "/store",
    ]

    entries.push(
      ...fixedRoutes.map((path) => ({
        url: localizedUrl(baseUrl, countryCode, path),
      })),
      ...blogPosts.map((post) => ({
        url: localizedUrl(
          baseUrl,
          countryCode,
          `/blog/${encodeURIComponent(post.slug)}`
        ),
        lastModified: new Date(post.publishedAt),
      })),
      ...categories.map((category) => ({
        url: localizedUrl(
          baseUrl,
          countryCode,
          `/categories/${encodeHandle(category.handle)}`
        ),
        lastModified: category.updated_at ?? undefined,
      })),
      ...collectionsResponse.collections.map((collection) => ({
        url: localizedUrl(
          baseUrl,
          countryCode,
          `/collections/${encodeHandle(collection.handle)}`
        ),
        lastModified: collection.updated_at,
      }))
    )

    let page = 1
    let hasMore = true
    while (hasMore) {
      const { response, nextPage } = await listProducts({
        countryCode,
        pageParam: page,
        queryParams: { limit: 100, fields: "handle,updated_at" },
      })

      entries.push(
        ...response.products.map((product) => ({
          url: localizedUrl(
            baseUrl,
            countryCode,
            `/products/${encodeHandle(product.handle)}`
          ),
          lastModified: product.updated_at ?? undefined,
        }))
      )

      if (nextPage === null) {
        hasMore = false
      } else {
        page = nextPage
      }
    }
  }

  return entries
}
