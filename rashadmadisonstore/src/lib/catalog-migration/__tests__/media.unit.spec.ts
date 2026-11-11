import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { loadBundle, mediaContent, prepareMedia, verifyMedia } from "../media"
import { fixture } from "../fixtures/catalog"

describe("catalog media preparation", () => {
  let root: string
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "catalog-media-test-"))
    await mkdir(join(root, "static"))
    await mkdir(join(root, "bundle"))
    await writeFile(join(root, "static", "image.png"), Buffer.from("test-image-bytes"))
  })
  afterEach(async () => { await rm(root, { recursive: true, force: true }) })
  it("copies each unique file once and rewrites thumbnails and variant images", async () => {
    const bundle = fixture()
    const counts = await prepareMedia(bundle, root, join(root, "bundle"), "http://localhost:9000")
    expect(counts).toEqual({ localUrls: 1, uniqueFiles: 1, externalUrls: 0 })
    expect(bundle.media).toHaveLength(1)
    const url = `https://example.cloudfront.net/${bundle.media[0].key}`
    expect(bundle.catalog.products[0].thumbnail).toBe(url)
    expect(bundle.catalog.products[0].variants[0].images[0].url).toBe(url)
    expect(await mediaContent(join(root, "bundle"), bundle.media[0])).toEqual(Buffer.from("test-image-bytes"))
    await writeFile(join(root, "bundle", "catalog.json"), JSON.stringify(bundle))
    expect(await loadBundle(join(root, "bundle"))).toEqual(bundle)
  })
  it("fails on missing source images instead of exporting broken image links", async () => {
    await rm(join(root, "static", "image.png"))
    await expect(prepareMedia(fixture(), root, join(root, "bundle"), "http://localhost:9000")).rejects.toThrow("ENOENT")
  })
  it("refuses a symlink outside the permitted local image directory", async () => {
    await rm(join(root, "static", "image.png"))
    await writeFile(join(root, "outside.png"), "outside")
    await symlink(join(root, "outside.png"), join(root, "static", "image.png"))
    await expect(prepareMedia(fixture(), root, join(root, "bundle"), "http://localhost:9000")).rejects.toThrow("escapes")
  })
  it("checks media bytes and verifies CloudFront checksums, not just HTTP 200", async () => {
    const bundle = fixture()
    await prepareMedia(bundle, root, join(root, "bundle"), "http://localhost:9000")
    const bytes = await readFile(join(root, "bundle", "media", bundle.media[0].key.split("/")[1]))
    const mock = jest.spyOn(globalThis, "fetch")
    try {
      mock.mockResolvedValue(new Response(bytes))
      await expect(verifyMedia(bundle)).resolves.toBeUndefined()
      mock.mockResolvedValue(new Response("wrong-image"))
      await expect(verifyMedia(bundle)).rejects.toThrow("checksum mismatch")
      await writeFile(join(root, "bundle", "media", bundle.media[0].key.split("/")[1]), "tampered")
      await expect(mediaContent(join(root, "bundle"), bundle.media[0])).rejects.toThrow("checksum mismatch")
    } finally {
      mock.mockRestore()
    }
  })
})
