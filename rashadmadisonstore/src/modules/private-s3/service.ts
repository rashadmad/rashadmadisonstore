import { S3FileService } from "@medusajs/file-s3/dist/services/s3-file"
import { FileTypes } from "@medusajs/framework/types"
import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { randomUUID } from "node:crypto"
import { parse } from "node:path"
import { PassThrough } from "node:stream"

export default class PrivateS3FileService extends S3FileService {
  static identifier = "private-s3"

  protected getClient() {
    const client = super.getClient()
    // OAC buckets use Bucket owner enforced ownership, not object ACLs.
    client.middlewareStack.add(
      (next) => async (args) => {
        if (args.input && typeof args.input === "object" && "ACL" in args.input) {
          if (args.input.ACL === "private" && "Key" in args.input && typeof args.input.Key === "string") {
            args.input.Key = this.privateKey(args.input.Key)
            if ("CacheControl" in args.input) args.input.CacheControl = "private, no-store"
          }
          delete args.input.ACL
        }
        return next(args)
      },
      { step: "initialize", name: "omitObjectAcl", priority: "high" }
    )
    return client
  }

  private privateKey(key: string) {
    const prefix = this.config_.prefix ?? ""
    if (!key.startsWith(prefix)) {
      throw new Error("Unexpected S3 upload prefix")
    }
    return `private/${key.slice(prefix.length)}`
  }

  private fileResult(result: FileTypes.ProviderFileResultDTO, access?: string) {
    const key = access === "public" ? result.key : this.privateKey(result.key)
    return { key, url: `${this.config_.fileUrl}/${key.split("/").map(encodeURIComponent).join("/")}` }
  }

  async upload(file: FileTypes.ProviderUploadFileDTO) {
    return this.fileResult(await super.upload(file), file.access)
  }

  async getUploadStream(file: FileTypes.ProviderUploadStreamDTO) {
    if (!file.filename) throw new Error("No filename provided")
    const filename = parse(file.filename)
    const key = `${file.access === "public" ? this.config_.prefix ?? "" : "private/"}${filename.name}-${randomUUID()}${filename.ext}`
    const stream = new PassThrough()
    const upload = new Upload({
      client: this.client_,
      params: {
        Bucket: this.config_.bucket, Key: key, Body: stream,
        ContentType: file.mimeType,
        CacheControl: file.access === "public" ? this.config_.cacheControl : "private, no-store",
        Metadata: { "original-filename": encodeURIComponent(file.filename) },
      },
    })
    const location = { key, url: `${this.config_.fileUrl}/${key.split("/").map(encodeURIComponent).join("/")}` }
    return {
      writeStream: stream, fileKey: key, url: location.url,
      promise: upload.done().then(() => location),
    }
  }

  async getPresignedUploadUrl(file: FileTypes.ProviderGetPresignedUploadUrlDTO) {
    const access = file.access ?? "private"
    const result = await super.getPresignedUploadUrl({ ...file, access })
    return { ...result, key: access === "public" ? result.key : this.privateKey(result.key) }
  }

  async delete(files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]) {
    if (Array.isArray(files)) {
      if (!files.length) return
      const result = await this.client_.send(new DeleteObjectsCommand({
        Bucket: this.config_.bucket,
        Delete: { Objects: files.map((file) => ({ Key: file.fileKey })), Quiet: true },
      }))
      if (result.Errors?.length) {
        throw new Error(`S3 failed to delete ${result.Errors.length} files: ${result.Errors.map((error) => error.Code).join(", ")}`)
      }
    } else {
      await this.client_.send(new DeleteObjectCommand({ Bucket: this.config_.bucket, Key: files.fileKey }))
    }
  }
}
