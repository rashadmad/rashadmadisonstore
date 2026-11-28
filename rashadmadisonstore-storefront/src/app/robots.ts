import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/account",
        "/*/account/*",
        "/*/checkout",
        "/*/checkout/*",
        "/api/*",
      ],
    },
    sitemap: new URL("/sitemap.xml", getBaseURL()).toString(),
  }
}
