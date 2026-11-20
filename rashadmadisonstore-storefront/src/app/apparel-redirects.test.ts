const nextConfig = require("../../next.config")

it.each(["collections", "gallery"])(
  "permanently redirects the old localized %s apparel page",
  async (section) => {
    await expect(nextConfig.redirects()).resolves.toContainEqual({
      source: `/:countryCode/${section}/apparel`,
      destination: "/:countryCode/apparel",
      permanent: true,
    })
  }
)
