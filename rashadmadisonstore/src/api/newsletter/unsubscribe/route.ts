import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { setNewsletterFlag, verifyUnsubscribeToken } from "../../../lib/newsletter"

// Lives outside /store so email links work without a publishable API key.
const tokenFrom = (req: MedusaRequest) => {
  const q = (req.query ?? {}) as Record<string, unknown>
  const b = (req.body ?? {}) as Record<string, unknown>
  return typeof q.token === "string" ? q.token : b.token
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// Confirm page: shows who will be unsubscribed; changes nothing.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.UNSUBSCRIBE_SECRET
  const token = tokenFrom(req)
  const email = secret ? verifyUnsubscribeToken(token, secret) : null
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  if (!email) {
    return res.status(400).send("<p>This unsubscribe link is invalid.</p>")
  }
  res.send(
    `<form method="post" action="?token=${encodeURIComponent(String(token))}">` +
      `<p>Unsubscribe <strong>${escapeHtml(email)}</strong> from the newsletter?</p>` +
      `<button type="submit">Unsubscribe</button></form>`
  )
}

// One-click unsubscribe (token in query). Idempotent; same answer for unknown emails.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) {
    return res.status(503).json({ message: "Unsubscribe is not configured." })
  }
  const email = verifyUnsubscribeToken(tokenFrom(req), secret)
  if (!email) {
    return res.status(400).json({ message: "Invalid unsubscribe link." })
  }

  await setNewsletterFlag(req.scope.resolve(Modules.CUSTOMER), email, false)
  res.json({ ok: true })
}
