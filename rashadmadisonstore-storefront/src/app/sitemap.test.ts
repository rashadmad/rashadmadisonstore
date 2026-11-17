import sitemap from "./sitemap"
import { listBlogPosts } from "@lib/data/blog"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"

jest.mock("@lib/data/blog", () => ({ listBlogPosts: jest.fn() }))
jest.mock("@lib/data/categories", () => ({ listCategories: jest.fn() }))
jest.mock("@lib/data/collections", () => ({ listCollections: jest.fn() }))
jest.mock("@lib/data/products", () => ({ listProducts: jest.fn() }))
jest.mock("@lib/data/regions", () => ({ listRegions: jest.fn() }))

const mockListBlogPosts = listBlogPosts as jest.Mock
const mockListCategories = listCategories as jest.Mock
const mockListCollections = listCollections as jest.Mock
const mockListProducts = listProducts as jest.Mock
const mockListRegions = listRegions as jest.Mock

describe("sitemap", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_BASE_URL = "https://shop.example/"
    mockListRegions.mockResolvedValue([
      {
        countries: [{ iso_2: "us" }, { iso_2: "ca" }],
      },
    ])
    mockListCategories.mockResolvedValue([
      { handle: "art", updated_at: "2026-10-01T00:00:00.000Z" },
    ])
    mockListCollections.mockResolvedValue({
      collections: [{ handle: "featured", updated_at: "2026-10-02T00:00:00.000Z" }],
      count: 1,
    })
    mockListBlogPosts.mockResolvedValue([
      {
        slug: "studio-notes",
        publishedAt: "2026-10-03T00:00:00.000Z",
      },
    ])
    mockListProducts.mockImplementation(({ pageParam, countryCode }) =>
      Promise.resolve({
        response: {
          products: [
            {
              handle: pageParam === 1 ? "tender-head" : "prince",
              updated_at: "2026-10-04T00:00:00.000Z",
            },
          ],
        },
        nextPage: pageParam === 1 ? 2 : null,
      })
    )
  })

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_URL
    } else {
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
    }
  })

  it("includes localized content and paginates through every product", async () => {
    const entries = await sitemap()
    const urls = entries.map(({ url }) => url)

    expect(urls).toContain("https://shop.example/us")
    expect(urls).toContain("https://shop.example/us/blog/studio-notes")
    expect(urls).toContain("https://shop.example/us/categories/art")
    expect(urls).toContain("https://shop.example/us/collections/featured")
    expect(urls).toContain("https://shop.example/us/products/tender-head")
    expect(urls).toContain("https://shop.example/us/products/prince")
    expect(urls).toContain("https://shop.example/ca/products/tender-head")
    expect(urls.some((url) => /\/(account|checkout)(\/|$)/.test(url))).toBe(false)
    expect(mockListProducts).toHaveBeenCalledTimes(4)
  })
})
