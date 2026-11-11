import { HeadObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3"
import { loadEnv } from "@medusajs/framework/utils"
import { loadBundle, mediaContent, verifyMedia } from "../lib/catalog-migration/media"
import { resolve } from "node:path"

export async function uploadCatalogMedia(directory: string, mode: string) {
  if (!["plan", "apply", "verify"].includes(mode)) throw new Error("Mode must be plan, apply, or verify")
  const bundle = await loadBundle(directory)
  for (const file of bundle.media) await mediaContent(directory, file)
  console.log(`Validated ${bundle.media.length} files (${bundle.media.reduce((bytes, file) => bytes + file.size, 0)} bytes).`)
  if (mode === "plan") {
    console.log("Dry run only. No AWS requests or uploads were made.")
    return
  }
  if (mode === "verify") {
    await verifyMedia(bundle)
    console.log("All migrated image bytes verified through CloudFront.")
    return
  }
  if (process.env.CATALOG_MIGRATION_ALLOW_WRITE !== "true") {
    throw new Error("Uploads require CATALOG_MIGRATION_ALLOW_WRITE=true and apply mode")
  }
  const bucket = process.env.S3_BUCKET?.trim()
  const region = process.env.S3_REGION?.trim()
  if (!bucket || !region) throw new Error("S3_BUCKET and S3_REGION are required")
  if (process.env.S3_FILE_URL?.replace(/\/$/, "") !== bundle.cloudfront_origin) {
    throw new Error("S3_FILE_URL must match the snapshot's CloudFront origin")
  }
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim()
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) throw new Error("Supply both S3 credential variables or neither")
  const client = new S3Client({
    region, maxAttempts: 5,
    credentials: accessKeyId && secretAccessKey ? {
      accessKeyId, secretAccessKey, sessionToken: process.env.S3_SESSION_TOKEN,
    } : undefined,
  })
  try {
    for (const file of bundle.media) {
      let exists = false
      try {
        const object = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: file.key }))
        if (object.Metadata?.sha256 !== file.sha256 || object.ContentLength !== file.size) {
          throw new Error(`Existing S3 object differs; refusing to overwrite ${file.key}`)
        }
        exists = true
      } catch (error) {
        if (!(error instanceof S3ServiceException) || error.$metadata.httpStatusCode !== 404) throw error
      }
      if (!exists) {
        await client.send(new PutObjectCommand({
          Bucket: bucket, Key: file.key,
          Body: await mediaContent(directory, file),
          ContentType: file.content_type,
          CacheControl: "public, max-age=31536000, immutable",
          Metadata: { sha256: file.sha256 },
          IfNoneMatch: "*",
        }))
      }
      console.log(`${exists ? "Already uploaded" : "Uploaded"}: ${file.key}`)
    }
  } finally {
    client.destroy()
  }
  await verifyMedia(bundle)
  console.log("All migrated image bytes verified through CloudFront.")
}

if (require.main === module) {
  loadEnv(process.env.NODE_ENV || "development", process.cwd())
  const [directory, mode = "plan", ...extra] = process.argv.slice(2)
  if (!directory || extra.length) {
    console.error("Usage: npm run catalog:media -- <bundle-directory> [plan|apply|verify]")
    process.exitCode = 1
  } else {
    uploadCatalogMedia(resolve(directory), mode).catch((error: Error) => {
      console.error(error.message)
      process.exitCode = 1
    })
  }
}
