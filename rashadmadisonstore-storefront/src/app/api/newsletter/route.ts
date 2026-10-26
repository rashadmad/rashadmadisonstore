import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = JSON.parse(await req.text())
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error
    return NextResponse.json({ error: "Invalid signup data." }, { status: 400 })
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid signup data." }, { status: 400 })
  }
  try {
    await sdk.client.fetch("/store/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? error.status
        : undefined
    console.error("Newsletter signup could not be saved to Medusa.", {
      status: typeof status === "number" ? status : "unavailable",
    })
    return NextResponse.json(
      {
        error:
          status === 400
            ? "Please check your signup details and consent."
            : "Could not save your signup. Please try again.",
      },
      { status: status === 400 ? 400 : 502 }
    )
  }
}
