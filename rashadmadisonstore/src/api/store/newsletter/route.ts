import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import NewsletterModuleService from "../../../modules/newsletter/service"

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid newsletter signup.")
  }
  const { email: inputEmail, firstName, lastName, consent } = body as Record<string, unknown>
  const email = normalize(inputEmail).toLowerCase()
  const first_name = normalize(firstName)
  const last_name = normalize(lastName)
  if (
    !first_name || !last_name || first_name.length > 80 || last_name.length > 80 ||
    email.length > 254 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ||
    consent !== true
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Enter your first name, last name, valid email address, and newsletter consent."
    )
  }
  const service = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)
  const [existing] = await service.listSubscribers({ email })
  // Do not expose whether an address is already on the list or overwrite its owner.
  if (!existing) {
    try {
      await service.createSubscribers({
        email, first_name, last_name,
        status: "subscribed",
        source: "the-quintessential-storefront",
        consented_at: new Date(),
      })
    } catch (error) {
      // Medusa also translates database unique violations into INVALID_DATA.
      if (!(error instanceof MedusaError) ||
          (error.type !== MedusaError.Types.DUPLICATE_ERROR &&
           error.type !== MedusaError.Types.INVALID_DATA)) {
        throw error
      }
      // A concurrent signup may have saved this email after the initial lookup.
      const [saved] = await service.listSubscribers({ email })
      if (!saved) throw error
    }
  }
  res.status(200).json({ ok: true })
}
