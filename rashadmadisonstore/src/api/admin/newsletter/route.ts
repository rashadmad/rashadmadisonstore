import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import NewsletterModuleService from "../../../modules/newsletter/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 50)
  if (!Number.isSafeInteger(offset) || offset < 0 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Use a nonnegative offset and a limit between 1 and 100.")
  }
  const service = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)
  const [subscribers, count] = await service.listAndCountSubscribers(
    {}, { skip: offset, take: limit, order: { created_at: "DESC" } }
  )
  res.json({ subscribers, count, offset, limit })
}
