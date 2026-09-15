import { sdk } from "@lib/config"
import { setAuthToken, setHasLoggedInBefore } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type GoogleUserMetadata = {
  email?: string
  given_name?: string
  family_name?: string
  name?: string
}

const getSafeRedirectPath = (value: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account/profile"
  }

  return value
}

const decodeJwtPayload = (token: string): { user_metadata?: GoogleUserMetadata } => {
  const payload = token.split(".")[1]

  if (!payload) {
    return {}
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return {}
  }
}

const ensureGoogleCustomer = async (token: string) => {
  const existingCustomer = await sdk.client
    .fetch<{ customer: unknown }>("/store/customers/me", {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    .then(({ customer }) => customer)
    .catch(() => null)

  if (existingCustomer) {
    return token
  }

  const metadata = decodeJwtPayload(token).user_metadata || {}
  const [firstNameFallback = "", ...lastNameParts] = (metadata.name || "").split(" ")

  await sdk.store.customer.create(
    {
      email: metadata.email || "",
      first_name: metadata.given_name || firstNameFallback,
      last_name: metadata.family_name || lastNameParts.join(" "),
    },
    {},
    { authorization: `Bearer ${token}` }
  )

  return sdk.auth.refresh({ authorization: `Bearer ${token}` })
}

export async function GET(req: NextRequest) {
  const redirectTo = getSafeRedirectPath(req.cookies.get("_google_auth_redirect_to")?.value || null)
  const callbackParams = Object.fromEntries(req.nextUrl.searchParams.entries())

  try {
    const callbackToken = await sdk.auth.callback("customer", "google", callbackParams)
    const token = await ensureGoogleCustomer(callbackToken)

    await setAuthToken(token)
    await setHasLoggedInBefore()

    const response = NextResponse.redirect(new URL(redirectTo, req.url))
    response.cookies.delete("_google_auth_redirect_to")

    return response
  } catch {
    const response = NextResponse.redirect(new URL("/account?view=sign-in&error=google-auth", req.url))
    response.cookies.delete("_google_auth_redirect_to")

    return response
  }
}