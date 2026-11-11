export function s3FileModule(env: NodeJS.ProcessEnv) {
  const keys = [
    "S3_BUCKET", "S3_REGION", "S3_FILE_URL",
    "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY",
  ]
  if (!keys.some((key) => env[key]?.trim())) {
    return []
  }
  const missing = keys.filter((key) => !env[key]?.trim())
  if (missing.length) {
    throw new Error(`Incomplete S3 configuration. Missing: ${missing.join(", ")}`)
  }
  const url = new URL(env.S3_FILE_URL!.trim())
  if (url.protocol !== "https:" || url.username || url.password ||
      url.search || url.hash || url.pathname !== "/") {
    throw new Error("S3_FILE_URL must be a public HTTPS origin without a path or credentials")
  }
  return [{
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [{
        resolve: "./src/modules/private-s3",
        id: "private-s3",
        options: {
          bucket: env.S3_BUCKET!.trim(),
          region: env.S3_REGION!.trim(),
          file_url: url.origin,
          access_key_id: env.S3_ACCESS_KEY_ID!.trim(),
          secret_access_key: env.S3_SECRET_ACCESS_KEY!.trim(),
          session_token: env.S3_SESSION_TOKEN?.trim() || undefined,
          prefix: "uploads/",
        },
      }],
    },
  }]
}
