import { retrieveCustomer } from "@lib/data/customer"
import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const normalize = (value: string) => value.trim().replace(/\s+/g, " ")

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim()

  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 })
  }

  const response = await sdk.client.fetch<{ comments?: unknown[] }>(
    `/store/custom/blog/posts/${encodeURIComponent(slug)}/comments`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  return NextResponse.json({ comments: response.comments || [] })
}

export async function POST(req: NextRequest) {
  try {
    const customer = await retrieveCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: "You must be logged in to leave a comment." },
        { status: 401 }
      )
    }

    const body = (await req.json()) as {
      slug?: string
      message?: string
    }

    const slug = normalize(body?.slug || "")
    const message = normalize(body?.message || "")
    const author = normalize(
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || ""
    )

    if (!slug) {
      return NextResponse.json({ error: "slug is required." }, { status: 400 })
    }

    if (!author || author.length < 2) {
      return NextResponse.json(
        { error: "author must be at least 2 characters." },
        { status: 400 }
      )
    }

    if (!message || message.length < 3) {
      return NextResponse.json(
        { error: "message must be at least 3 characters." },
        { status: 400 }
      )
    }

    if (author.length > 80 || message.length > 1200) {
      return NextResponse.json(
        { error: "Comment is too long." },
        { status: 400 }
      )
    }

    const response = await sdk.client.fetch<{ comment?: unknown }>(
      `/store/custom/blog/posts/${encodeURIComponent(slug)}/comments`,
      {
        method: "POST",
        body: {
          author,
          message,
        },
      }
    )

    return NextResponse.json({ comment: response.comment }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Could not save comment." },
      { status: 500 }
    )
  }
}
