import { createHash } from "node:crypto"
import { readFile, realpath, mkdir, writeFile } from "node:fs/promises"
import { basename, extname, join, relative, resolve, sep } from "node:path"
import { Bundle, Media, bundleSchema, origin } from "./schema"

const formats: Record<string, { extension: string; type: string }> = {
  ".jpg": { extension: "jpg", type: "image/jpeg" },
  ".jpeg": { extension: "jpg", type: "image/jpeg" },
  ".png": { extension: "png", type: "image/png" },
  ".webp": { extension: "webp", type: "image/webp" },
  ".gif": { extension: "gif", type: "image/gif" },
  ".avif": { extension: "avif", type: "image/avif" },
}
const maxImageBytes = 30 * 1024 * 1024

export function imageUrls(bundle: Bundle) {
  return [...new Set([
    ...bundle.catalog.products.flatMap((product) => [
      product.thumbnail,
      ...product.images.map((image) => image.url),
      ...product.variants.flatMap((variant) => [
        variant.thumbnail, ...variant.images.map((image) => image.url),
      ]),
    ]),
    ...bundle.catalog.inventory.map((item) => item.thumbnail),
  ].filter((url): url is string => Boolean(url)))]
}

export function replaceImageUrls(bundle: Bundle, mapping: Map<string, string>) {
  const replace = (url: string | null) => url ? mapping.get(url) ?? url : null
  for (const product of bundle.catalog.products) {
    product.thumbnail = replace(product.thumbnail)
    product.images.forEach((image) => { image.url = replace(image.url)! })
    for (const variant of product.variants) {
      variant.thumbnail = replace(variant.thumbnail)
      variant.images.forEach((image) => { image.url = replace(image.url)! })
    }
  }
  bundle.catalog.inventory.forEach((item) => { item.thumbnail = replace(item.thumbnail) })
}

export async function prepareMedia(bundle: Bundle, backendRoot: string, directory: string, sourceOrigin: string) {
  const mapping = new Map<string, string>()
  const media = new Map<string, Media>()
  const localOrigin = new URL(sourceOrigin).origin
  const cdn = origin(bundle.cloudfront_origin)
  for (const value of imageUrls(bundle)) {
    const url = new URL(value)
    if (url.username || url.password) throw new Error("Image URLs must not contain credentials")
    if (url.origin !== localOrigin) {
      if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
        throw new Error(`Unmapped local image origin: ${url.origin}`)
      }
      if (url.protocol !== "https:") throw new Error(`External image must use HTTPS: ${url.origin}`)
      continue
    }
    const pathname = decodeURIComponent(url.pathname)
    const segments = pathname.split("/").filter(Boolean)
    const folder = segments.shift()
    if (!folder || !["static", "uploads"].includes(folder) ||
        !segments.length || segments.some((part) => part === "." || part === ".." || part.includes("\\"))) {
      throw new Error(`Local image must be inside /static/ or /uploads/: ${pathname}`)
    }
    const root = await realpath(join(backendRoot, folder))
    const file = await realpath(join(root, ...segments))
    const relativePath = relative(root, file)
    if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
      throw new Error(`Image escapes the local media directory: ${pathname}`)
    }
    const format = formats[extname(file).toLowerCase()]
    if (!format) throw new Error(`Unsupported image format: ${basename(file)}`)
    const content = await readFile(file)
    if (!content.length || content.length > maxImageBytes) {
      throw new Error(`Image must be between 1 byte and 30 MiB: ${basename(file)}`)
    }
    const sha256 = createHash("sha256").update(content).digest("hex")
    const key = `catalog/${sha256}.${format.extension}`
    const object = { key, sha256, size: content.length, content_type: format.type }
    media.set(key, object)
    await mkdir(join(directory, "media"), { recursive: true, mode: 0o700 })
    await writeFile(join(directory, "media", basename(key)), content, { mode: 0o600 })
    mapping.set(value, `${cdn}/${key}`)
  }
  replaceImageUrls(bundle, mapping)
  bundle.media = [...media.values()].sort((a, b) => a.key.localeCompare(b.key))
  return { localUrls: mapping.size, uniqueFiles: media.size, externalUrls: imageUrls(bundle).filter((url) => new URL(url).origin !== cdn).length }
}

export async function loadBundle(directory: string) {
  const bundle = bundleSchema.parse(JSON.parse(await readFile(join(directory, "catalog.json"), "utf8")))
  origin(bundle.cloudfront_origin)
  for (const media of bundle.media) {
    const expectedExtension = formats[extname(media.key)]
    if (!expectedExtension || expectedExtension.type !== media.content_type ||
        basename(media.key) !== `${media.sha256}${extname(media.key)}`) {
      throw new Error(`Invalid media manifest: ${media.key}`)
    }
  }
  if (new Set(bundle.media.map((file) => file.key)).size !== bundle.media.length) {
    throw new Error("Duplicate keys in media manifest")
  }
  for (const value of imageUrls(bundle)) {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("Imported image URLs must use HTTPS and contain no credentials")
    }
    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error("Snapshot still contains local image URLs")
    }
    if (url.origin === bundle.cloudfront_origin && url.pathname.startsWith("/catalog/") &&
        !bundle.media.some((file) => `/${file.key}` === url.pathname)) {
      throw new Error(`Image is absent from the media manifest: ${url.pathname}`)
    }
  }
  return bundle
}

export async function mediaContent(directory: string, media: Media) {
  const file = resolve(directory, "media", basename(media.key))
  const root = await realpath(join(directory, "media"))
  const actual = await realpath(file)
  if (relative(root, actual).startsWith("..")) throw new Error(`Media path escapes bundle: ${media.key}`)
  const content = await readFile(actual)
  if (content.length !== media.size ||
      createHash("sha256").update(content).digest("hex") !== media.sha256) {
    throw new Error(`Media checksum mismatch: ${media.key}`)
  }
  return content
}

export async function verifyMedia(bundle: Bundle) {
  for (const media of bundle.media) {
    const response = await fetch(`${origin(bundle.cloudfront_origin)}/${media.key}`, {
      signal: AbortSignal.timeout(30_000), redirect: "error",
    })
    if (!response.ok) throw new Error(`CloudFront returned ${response.status} for ${media.key}`)
    if (Number(response.headers.get("content-length")) > maxImageBytes) {
      throw new Error(`CloudFront image exceeds 30 MiB: ${media.key}`)
    }
    if (!response.body) throw new Error(`CloudFront returned an empty body: ${media.key}`)
    const reader = response.body.getReader()
    const hash = createHash("sha256")
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > media.size) {
        await reader.cancel()
        throw new Error(`CloudFront image checksum mismatch: ${media.key}`)
      }
      hash.update(value)
    }
    if (size !== media.size || hash.digest("hex") !== media.sha256) {
      throw new Error(`CloudFront image checksum mismatch: ${media.key}`)
    }
  }
}
