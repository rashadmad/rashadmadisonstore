import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow, createRegionsWorkflow, createSalesChannelsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { randomUUID } from "node:crypto"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import importCatalog from "../../src/scripts/import-catalog"
import { fixture } from "../../src/lib/catalog-migration/fixtures/catalog"
import { replaceImageUrls } from "../../src/lib/catalog-migration/media"
import { readCatalog } from "../../src/lib/catalog-migration/read"
import { buildPlan } from "../../src/lib/catalog-migration/plan"
import { verifyCatalog } from "../../src/lib/catalog-migration/verify"

jest.setTimeout(180_000)

const isolatedEnv = {
  REDIS_URL: "", S3_BUCKET: "", S3_REGION: "", S3_FILE_URL: "",
  S3_ACCESS_KEY_ID: "", S3_SECRET_ACCESS_KEY: "",
  CATALOG_MIGRATION_ALLOW_WRITE: "true",
}
const previousEnv = Object.fromEntries(Object.keys(isolatedEnv).map((key) => [key, process.env[key]]))
const dbName = `catalog_migration_test_${randomUUID().replace(/-/g, "")}`
// Config is evaluated before the runner applies its own env option.
beforeAll(() => { Object.assign(process.env, isolatedEnv) })

medusaIntegrationTestRunner({
  inApp: true,
  dbName,
  env: isolatedEnv,
  testSuite: ({ getContainer }) => {
    it("imports and verifies real module relationships, resumes without duplicates, and preserves users and keys", async () => {
      const container = getContainer()
      const { result: [channel] } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
      })

      const [store] = await container.resolve(Modules.STORE).listStores()
      await updateStoresWorkflow(container).run({
        input: { selector: { id: store.id }, update: {
          default_sales_channel_id: channel.id,
          supported_currencies: [{ currency_code: "usd", is_default: true }],
        } },
      })
      await createRegionsWorkflow(container).run({
        input: { regions: [{ name: "US", currency_code: "usd", countries: ["us"] }] },
      })
      const user = await container.resolve(Modules.USER).createUsers({ email: "migration-test@example.com" })
      const { result: [key] } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Keep this key", type: "publishable", created_by: user.id }] },
      })
      const bundle = fixture()
      replaceImageUrls(bundle, new Map([
        ["http://localhost:9000/static/image.png", "https://example.cloudfront.net/image.png"],
      ]))
      const product = bundle.catalog.products[0]
      const sharedImage = { id: "img-shared", url: "https://example.cloudfront.net/shared.png", rank: 1 }
      product.images.push(sharedImage)
      product.options[0].values.push({ value: "Large" })
      product.variants[0].images.push(sharedImage)
      product.variants.push({
        ...structuredClone(product.variants[0]),
        id: "variant-large", title: "Large", sku: "PRINT-LARGE", variant_rank: 1,
        options: [{ value: "Large", option: { title: "Size" } }],
        images: [sharedImage],
      })
      const directory = await mkdtemp(join(tmpdir(), "catalog-integration-"))
      try {
        await writeFile(join(directory, "catalog.json"), JSON.stringify(bundle))
        await importCatalog({ container, args: [directory, "plan"] })
        expect((await readCatalog(container)).products).toHaveLength(0)
        await importCatalog({ container, args: [directory, "apply"] })
        const first = await readCatalog(container, true)
        verifyCatalog(bundle, first, buildPlan(bundle, first))
        await importCatalog({ container, args: [directory, "apply"] })
        await importCatalog({ container, args: [directory, "verify"] })
        const second = await readCatalog(container, true)
        expect(second.products.map((product) => product.id)).toEqual(first.products.map((product) => product.id))
        expect(second.inventory.map((item) => item.id)).toEqual(first.inventory.map((item) => item.id))
        expect(await container.resolve(Modules.USER).retrieveUser(user.id)).toMatchObject({ id: user.id })
        expect(await container.resolve(Modules.API_KEY).retrieveApiKey(key.id)).toMatchObject({ id: key.id, token: key.token })
      } finally {
        await rm(directory, { recursive: true, force: true })
      }
    })
  },
})

afterAll(async () => {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  for (const module of ["blog", "newsletter"]) {
    await rm(join(process.cwd(), "src", "modules", module, "migrations", `.snapshot-${dbName}.json`), { force: true })
  }
})
