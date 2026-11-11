import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve, join } from "node:path"
import { readCatalog } from "../lib/catalog-migration/read"
import { Bundle, origin, prepareCatalogForMigration, validateCatalog } from "../lib/catalog-migration/schema"
import { prepareMedia } from "../lib/catalog-migration/media"

export default async function exportCatalog({ container, args }: ExecArgs) {
  const [output, cloudfrontUrl, sourceUrl = "http://localhost:9000"] = args
  if (!output || !cloudfrontUrl || args.length > 3) {
    throw new Error("Usage: npm run catalog:export -- <new-directory> <https://cloudfront-domain> [local-backend-origin]")
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const catalog = prepareCatalogForMigration(await readCatalog(container))
  logger.info(`Read ${catalog.products.length} local products and ${catalog.products.reduce((count, product) => count + product.variants.length, 0)} variants.`)
  logger.info("Product types are excluded; optionless single-variant products receive a Title: Default option in the snapshot.")
  const missingProfiles = catalog.products.filter((product) => !product.shipping_profile)
  if (missingProfiles.length) {
    logger.warn(`${missingProfiles.length} products have no shipping profile; that absence will be preserved. Configure shipping before opening checkout.`)
  }
  validateCatalog(catalog)
  if (!catalog.products.length) throw new Error("Source catalog is empty")
  const directory = resolve(output)
  // Never replace a previous snapshot; it may be in use by an import.
  await mkdir(directory, { recursive: false, mode: 0o700 })
  const bundle: Bundle = { version: 1, cloudfront_origin: origin(cloudfrontUrl), catalog, media: [] }
  const counts = await prepareMedia(bundle, process.cwd(), directory, sourceUrl)
  await writeFile(join(directory, "catalog.json"), JSON.stringify(bundle, null, 2), { flag: "wx", mode: 0o600 })
  logger.info(`Exported ${catalog.products.length} products, ${catalog.products.reduce((count, product) => count + product.variants.length, 0)} variants, ${catalog.inventory.length} inventory items.`)
  logger.info(`Prepared ${counts.uniqueFiles} files from ${counts.localUrls} local image URLs; ${counts.externalUrls} external image URLs remain unchanged.`)
  logger.info(`Snapshot: ${directory}. No source data was modified and nothing was uploaded.`)
}
