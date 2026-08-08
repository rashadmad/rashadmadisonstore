import "server-only"

export type MastodonPost = {
  id: string
  url: string
  createdAt: string
  contentText: string
}

type MastodonApiStatus = {
  id: string
  url: string
  created_at: string
  content: string
  reblog?: unknown
  in_reply_to_id?: string | null
}

type MastodonAccountLookup = {
  id: string
}

const MASTODON_API_BASE_URL =
  process.env.MASTODON_API_BASE_URL?.trim() || "https://mastodon.social"
const MASTODON_ACCOUNT_ACCT = process.env.MASTODON_ACCOUNT_ACCT?.trim() || "rashadmad"
const MASTODON_PROFILE_URL =
  process.env.NEXT_PUBLIC_MASTODON_PROFILE_URL?.trim() ||
  "https://mastodon.social/@rashadmad"

const entityMap: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
}

const decodeHtmlEntities = (value: string) => {
  return Object.entries(entityMap).reduce(
    (acc, [entity, replacement]) => acc.split(entity).join(replacement),
    value
  )
}

const stripHtml = (html: string) => {
  const withLineBreaks = html
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, "\n")

  const noTags = withLineBreaks.replace(/<[^>]*>/g, "")

  return decodeHtmlEntities(noTags)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

const truncate = (value: string, length: number) => {
  if (value.length <= length) {
    return value
  }

  return `${value.slice(0, Math.max(0, length - 1)).trimEnd()}…`
}

const resolveMastodonAccountId = async () => {
  const lookupUrl = `${MASTODON_API_BASE_URL}/api/v1/accounts/lookup?acct=${encodeURIComponent(
    MASTODON_ACCOUNT_ACCT
  )}`

  const response = await fetch(lookupUrl, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
    },
  })

  if (!response.ok) {
    throw new Error(`Mastodon account lookup failed with ${response.status}.`)
  }

  const account = (await response.json()) as MastodonAccountLookup

  if (!account?.id) {
    throw new Error("Mastodon account lookup returned no account id.")
  }

  return account.id
}

export const listMastodonPosts = async (limit = 6) => {
  try {
    const accountId = await resolveMastodonAccountId()
    const params = new URLSearchParams({
      limit: String(limit),
      exclude_reblogs: "true",
      exclude_replies: "true",
    })

    const statusesUrl = `${MASTODON_API_BASE_URL}/api/v1/accounts/${accountId}/statuses?${params.toString()}`
    const response = await fetch(statusesUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    })

    if (!response.ok) {
      throw new Error(`Mastodon statuses request failed with ${response.status}.`)
    }

    const statuses = (await response.json()) as MastodonApiStatus[]

    const posts: MastodonPost[] = statuses
      .filter((status) => !status.reblog && !status.in_reply_to_id)
      .map((status) => ({
        id: status.id,
        url: status.url,
        createdAt: status.created_at,
        contentText: truncate(stripHtml(status.content), 340),
      }))

    return {
      posts,
      loadError: false,
      profileUrl: MASTODON_PROFILE_URL,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load Mastodon posts."

    return {
      posts: [] as MastodonPost[],
      loadError: true,
      errorMessage,
      profileUrl: MASTODON_PROFILE_URL,
    }
  }
}

export type MastodonCrossPostPayload = {
  title?: string
  content: string
  canonicalUrl?: string
  visibility?: "public" | "unlisted" | "private"
}

const buildMastodonStatus = ({
  title,
  content,
  canonicalUrl,
}: MastodonCrossPostPayload) => {
  const fragments = [title?.trim(), content.trim(), canonicalUrl?.trim()].filter(Boolean)
  const composed = fragments.join("\n\n")
  return truncate(composed, 500)
}

export const postToMastodon = async (payload: MastodonCrossPostPayload) => {
  const token = process.env.MASTODON_ACCESS_TOKEN?.trim()

  if (!token) {
    throw new Error("MASTODON_ACCESS_TOKEN is not configured.")
  }

  const status = buildMastodonStatus(payload)

  if (!status) {
    throw new Error("Cross-post content is empty.")
  }

  const body = new URLSearchParams({
    status,
    visibility: payload.visibility || "public",
  })

  const response = await fetch(`${MASTODON_API_BASE_URL}/api/v1/statuses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    const mastodonMessage = errorBody?.error || `Mastodon returned ${response.status}.`
    throw new Error(mastodonMessage)
  }

  const result = (await response.json()) as { id: string; url: string }

  return {
    id: result.id,
    url: result.url,
  }
}