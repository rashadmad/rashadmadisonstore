import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { isValidEmail, normalizeEmail, setNewsletterFlag } from "../../../../lib/newsletter"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>
  const email = normalizeEmail(body.email)
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "A valid email is required." })
  }

  const clean = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined

  const customerService = req.scope.resolve(Modules.CUSTOMER)
  await setNewsletterFlag(customerService, email, true, {
    first_name: clean(body.firstName),
    last_name: clean(body.lastName),
  })

  res.json({ ok: true })
}
