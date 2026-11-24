import { createHmac, timingSafeEqual } from "crypto"
import type { ICustomerModuleService } from "@medusajs/framework/types"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : ""

export const isValidEmail = (email: string) =>
  email.length <= 254 && EMAIL_REGEX.test(email)

const sign = (email: string, secret: string) =>
  createHmac("sha256", secret).update(email).digest("base64url")

// Token format: base64url(lowercased email) + "." + base64url(HMAC-SHA256(secret, email))
export function createUnsubscribeToken(email: string, secret: string): string {
  const normalized = normalizeEmail(email)
  return `${Buffer.from(normalized).toString("base64url")}.${sign(normalized, secret)}`
}

// Returns the email when the token is authentic, otherwise null.
export function verifyUnsubscribeToken(token: unknown, secret: string): string | null {
  if (typeof token !== "string" || !secret) return null
  const [payload, signature, ...rest] = token.split(".")
  if (!payload || !signature || rest.length) return null

  const email = Buffer.from(payload, "base64url").toString("utf8")
  const expected = Buffer.from(sign(email, secret))
  const given = Buffer.from(signature)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null

  return email === normalizeEmail(email) ? email : null
}

// Creates or updates every customer with this email and sets metadata.newsletter.
// Subscribing also saves names (only filling blanks) and the signup source.
export async function setNewsletterFlag(
  customerService: ICustomerModuleService,
  email: string,
  subscribed: boolean,
  info?: { first_name?: string; last_name?: string; source?: string }
): Promise<number> {
  const customers = await customerService.listCustomers({ email })
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = subscribed
    ? {
        newsletter: true,
        newsletter_subscribed_at: now,
        ...(info?.source ? { newsletter_source: info.source } : {}),
      }
    : { newsletter: false, newsletter_unsubscribed_at: now }

  if (!customers.length) {
    if (!subscribed) return 0
    await customerService.createCustomers({
      email,
      first_name: info?.first_name,
      last_name: info?.last_name,
      metadata: patch,
    })
    return 1
  }

  for (const customer of customers) {
    if (!subscribed && customer.metadata?.newsletter === false) continue
    await customerService.updateCustomers(customer.id, {
      ...(subscribed && !customer.first_name && info?.first_name ? { first_name: info.first_name } : {}),
      ...(subscribed && !customer.last_name && info?.last_name ? { last_name: info.last_name } : {}),
      metadata: { ...(customer.metadata ?? {}), ...patch },
    })
  }
  return customers.length
}
