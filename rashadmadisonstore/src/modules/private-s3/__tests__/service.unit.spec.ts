import { Logger } from "@medusajs/framework/types"
import PrivateS3FileService from "../service"

describe("private S3 provider", () => {
  const logger: Logger = {
    error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn(),
    log: jest.fn(), activity: jest.fn(), progress: jest.fn(),
    failure: jest.fn(), success: jest.fn(), shouldLog: jest.fn(),
    panic: jest.fn(), setLogLevel: jest.fn(), unsetLogLevel: jest.fn(),
    silly: jest.fn(), verbose: jest.fn(), http: jest.fn(),
  }
  it("uploads public storefront media without sending an ACL or making a network request", async () => {
    const requests: { headers: Record<string, string>; body?: unknown }[] = []
    const provider = new PrivateS3FileService({ logger }, {
      bucket: "test-bucket", region: "us-east-1", file_url: "https://example.cloudfront.net",
      prefix: "uploads/",
      access_key_id: "test-key", secret_access_key: "test-secret",
      additional_client_config: {
        requestHandler: {
          handle: async (request: { headers: Record<string, string>; body?: unknown }) => {
            requests.push(request)
            return { response: { statusCode: 200, headers: {}, body: Buffer.from("") } }
          },
        },
      },
    })
    const result = await provider.upload({
      filename: "image.png", mimeType: "image/png", content: Buffer.from("image").toString("base64"), access: "public",
    })
    expect(requests).toHaveLength(1)
    expect(requests[0].headers).not.toHaveProperty("x-amz-acl")
    expect(requests[0].headers["content-type"]).toBe("image/png")
    expect(result.url).toMatch(/^https:\/\/example\.cloudfront\.net\//)
    expect(result.key).toMatch(/^uploads\//)
    expect(result.url).not.toContain("%2F")
  })
  it("keeps private uploads and presigned uploads outside the public image prefixes", async () => {
    const requests: { path: string; headers: Record<string, string> }[] = []
    const provider = new PrivateS3FileService({ logger }, {
      bucket: "test-bucket", region: "us-east-1", file_url: "https://example.cloudfront.net",
      prefix: "uploads/", access_key_id: "test-key", secret_access_key: "test-secret",
      additional_client_config: {
        requestHandler: { handle: async (request: { path: string; headers: Record<string, string> }) => {
          requests.push(request)
          return { response: { statusCode: 200, headers: {}, body: Buffer.from("") } }
        } },
      },
    })
    const result = await provider.upload({ filename: "export.csv", mimeType: "text/csv", content: "YQ==" })
    expect(result.key).toMatch(/^private\//)
    expect(requests[0].path).toContain("/private/")
    expect(requests[0].headers["cache-control"]).toBe("private, no-store")
    expect(requests[0].headers).not.toHaveProperty("x-amz-acl")
    const signed = await provider.getPresignedUploadUrl({ filename: "private.csv", mimeType: "text/csv" })
    expect(signed.key).toBe("private/private.csv")
    expect(new URL(signed.url).pathname).toContain("/private/private.csv")
    expect(signed.url).not.toContain("x-amz-acl")
  })
  it("uses the private key consistently across multipart uploads", async () => {
    const paths: string[] = []
    const provider = new PrivateS3FileService({ logger }, {
      bucket: "test-bucket", region: "us-east-1", file_url: "https://example.cloudfront.net",
      prefix: "uploads/", access_key_id: "test-key", secret_access_key: "test-secret",
      additional_client_config: {
        requestHandler: { handle: async (request: { path: string; query: Record<string, string>; headers: Record<string, string> }) => {
          paths.push(request.path)
          expect(request.headers).not.toHaveProperty("x-amz-acl")
          const body = "uploads" in request.query
            ? "<InitiateMultipartUploadResult><UploadId>test-upload</UploadId></InitiateMultipartUploadResult>"
            : ""
          return { response: { statusCode: 200, headers: { etag: '"test-etag"' }, body: Buffer.from(body) } }
        } },
      },
    })
    const upload = await provider.getUploadStream({ filename: "large.png", mimeType: "image/png", access: "private" })
    upload.writeStream.end(Buffer.alloc(6 * 1024 * 1024))
    const result = await upload.promise
    expect(paths.length).toBeGreaterThan(2)
    expect(paths.every((path) => path.includes("/private/"))).toBe(true)
    expect(result.key).toBe(upload.fileKey)
    expect(result.url).toBe(upload.url)
  })
  it("surfaces S3 bulk-delete failures instead of returning success", async () => {
    const provider = new PrivateS3FileService({ logger }, {
      bucket: "test-bucket", region: "us-east-1", file_url: "https://example.cloudfront.net",
      prefix: "uploads/", access_key_id: "test-key", secret_access_key: "test-secret",
      additional_client_config: {
        requestHandler: { handle: async () => ({
          response: { statusCode: 200, headers: {}, body: Buffer.from(
            "<DeleteResult><Error><Key>uploads/file.png</Key><Code>AccessDenied</Code></Error></DeleteResult>"
          ) },
        }) },
      },
    })
    await expect(provider.delete([{ fileKey: "uploads/file.png" }])).rejects.toThrow("AccessDenied")
  })
})
