import { s3FileModule } from "../s3-config"

describe("S3 file module configuration", () => {
  const env = {
    S3_BUCKET: "test-bucket", S3_REGION: "us-east-1",
    S3_FILE_URL: "https://example.cloudfront.net",
    S3_ACCESS_KEY_ID: "test-key", S3_SECRET_ACCESS_KEY: "test-secret",
  }
  it("preserves local file storage when S3 is absent", () => {
    expect(s3FileModule({})).toEqual([])
  })
  it("fails explicitly on partial configuration", () => {
    expect(() => s3FileModule({ S3_BUCKET: "test" })).toThrow("Incomplete S3 configuration")
  })
  it("uses the private provider with a CloudFront URL and upload prefix", () => {
    const [module] = s3FileModule(env)
    expect(module.options.providers[0]).toMatchObject({
      resolve: "./src/modules/private-s3",
      options: { file_url: env.S3_FILE_URL, prefix: "uploads/" },
    })
  })
  it.each(["http://cdn.example", "https://cdn.example/path", "https://user:pass@cdn.example", "https://cdn.example?token=1"])(
    "rejects an invalid public file origin: %s",
    (file_url) => expect(() => s3FileModule({ ...env, S3_FILE_URL: file_url })).toThrow()
  )
})
