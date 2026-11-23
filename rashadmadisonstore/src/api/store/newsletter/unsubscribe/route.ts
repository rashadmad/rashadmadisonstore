import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { setNewsletterFlag, verifyUnsubscribeToken } from "../../../../lib/newsletter"

// Safe to call repeatedly; always answers { ok: true } for a valid token,
// whether or not the email is known.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
  if (!secret) {
    return res.status(503).json({ message: "Unsubscribe is not configured." })
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const email = verifyUnsubscribeToken(body.token, secret)
  if (!email) {
    return res.status(400).json({ message: "Invalid unsubscribe link." })
  }

  await setNewsletterFlag(req.scope.resolve(Modules.CUSTOMER), email, false)
  res.json({ ok: true })
}
