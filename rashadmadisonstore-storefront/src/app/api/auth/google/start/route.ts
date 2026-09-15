import { sdk } from "@lib/config"
import { getBaseURL } from "@lib/util/env"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const getSafeRedirectPath = (value: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account/profile"
  }

  return value
}

export async function GET(req: NextRequest) {
  const redirectTo = getSafeRedirectPath(req.nextUrl.searchParams.get("redirectTo"))
  const callbackUrl = `${getBaseURL()}/api/auth/google/callback`

  try {
    const result = await sdk.auth.login("customer", "google", {
      callback_url: callbackUrl,
    })

    if (typeof result === "string") {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    const response = NextResponse.redirect(result.location)
    response.cookies.set("_google_auth_redirect_to", redirectTo, {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch {
    return NextResponse.redirect(new URL("/account?view=sign-in&error=google-auth", req.url))
  }
}