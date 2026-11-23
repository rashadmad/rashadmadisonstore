import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""

export async function POST(req: NextRequest) {
  const signupUrl = process.env.NEWSLETTER_SIGNUP_URL?.trim()
  const signupKey = process.env.NEWSLETTER_SIGNUP_KEY?.trim()
  const backendUrl = process.env.MEDUSA_BACKEND_URL?.trim() || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim()

  try {
    const body = (await req.json()) as Record<string, unknown>
    const email = normalize(body.email).toLowerCase()
    const firstName = normalize(body.firstName)
    const lastName = normalize(body.lastName)

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
    }

    if (firstName.length > 80 || lastName.length > 80 || email.length > 254) {
      return NextResponse.json({ error: "Newsletter information is too long." }, { status: 400 })
    }

    // Record the opt-in in Medusa (source of truth for unsubscribes).
    const saved = await fetch(`${backendUrl}/store/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey ?? "",
      },
      body: JSON.stringify({ email, firstName, lastName, source: "the-quintessential-storefront" }),
      cache: "no-store",
    })

    if (!saved.ok) {
      return NextResponse.json({ error: "Could not save newsletter signup." }, { status: 502 })
    }

    // Forwarding to the newsletter app is optional.
    if (signupUrl && signupKey) {
      const response = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-newsletter-key": signupKey },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          source: "the-quintessential-storefront",
        }),
        cache: "no-store",
      })

      if (!response.ok) {
        return NextResponse.json({ error: "Newsletter provider rejected the signup." }, { status: 502 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Could not submit newsletter signup." }, { status: 500 })
  }
}