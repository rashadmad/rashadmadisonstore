import { NextRequest, NextResponse } from "next/server"

import { postToMastodon } from "@lib/data/mastodon"

export async function POST(req: NextRequest) {
  const configuredCrossPostKey = process.env.BLOG_CROSSPOST_KEY?.trim()

  if (!configuredCrossPostKey) {
    return NextResponse.json(
      {
        error: "BLOG_CROSSPOST_KEY is not configured.",
      },
      { status: 503 }
    )
  }

  const incomingCrossPostKey = req.headers.get("x-crosspost-key")?.trim()

  if (incomingCrossPostKey !== configuredCrossPostKey) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      { status: 401 }
    )
  }

  try {
    const body = (await req.json()) as {
      title?: string
      content?: string
      canonicalUrl?: string
      visibility?: "public" | "unlisted" | "private"
    }

    if (!body?.content || !body.content.trim()) {
      return NextResponse.json(
        {
          error: "content is required.",
        },
        { status: 400 }
      )
    }

    const postedStatus = await postToMastodon({
      title: body.title,
      content: body.content,
      canonicalUrl: body.canonicalUrl,
      visibility: body.visibility,
    })

    return NextResponse.json({
      ok: true,
      mastodonId: postedStatus.id,
      mastodonUrl: postedStatus.url,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cross-post to Mastodon."

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
