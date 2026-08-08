"use client"

import { useEffect, useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PostCommentsProps = {
  slug: string
  defaultAuthor?: string
  isLoggedIn: boolean
}

type BlogComment = {
  id: string
  slug: string
  author: string
  message: string
  createdAt: string
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const PostComments = ({ slug, defaultAuthor = "", isLoggedIn }: PostCommentsProps) => {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [author, setAuthor] = useState(defaultAuthor)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const submitDisabled = useMemo(() => {
    return !isLoggedIn || isSubmitting || message.trim().length < 3
  }, [isLoggedIn, message, isSubmitting])

  useEffect(() => {
    let isMounted = true

    const loadComments = async () => {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const response = await fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
        const payload = (await response.json()) as { comments?: BlogComment[]; error?: string }

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load comments.")
        }

        if (isMounted) {
          setComments(payload.comments || [])
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load comments.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          author,
          message,
        }),
      })

      const payload = (await response.json()) as { comment?: BlogComment; error?: string }

      if (!response.ok || !payload.comment) {
        throw new Error(payload.error || "Could not submit comment.")
      }

      setComments((prev) => [payload.comment as BlogComment, ...prev])
      setMessage("")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not submit comment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="content-container pb-14 sm:pb-16 lg:pb-20">
      <div className="rounded-[1.75rem] border border-black/10 bg-[#e7dcc9] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-[#17120d] sm:text-3xl">Comments</h2>
        <p className="mt-2 text-base leading-8 text-[#3b3024]">
          Share your thoughts about this post.
        </p>

        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6b3b]">
              Commenting as {author}
            </p>

            <label className="grid gap-2 text-sm font-semibold text-[#2f6b3b]" htmlFor="comment-message">
              Comment
              <textarea
                id="comment-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[140px] rounded-xl border border-[#2f6b3b]/30 bg-white px-4 py-3 text-base text-[#17120d] focus:border-[#2f6b3b] focus:outline-none"
                placeholder="Write your comment"
                maxLength={1200}
              />
            </label>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitDisabled}
                className="inline-flex items-center rounded-full border border-[#2f6b3b] bg-[#2f6b3b] px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition disabled:cursor-not-allowed disabled:opacity-55 hover:bg-[#24552f]"
              >
                {isSubmitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-[#2f6b3b]/25 bg-[#fbf7ef] p-4">
            <p className="text-base leading-7 text-[#3b3024]">
              You must be signed in to leave a comment.
            </p>
            <LocalizedClientLink
              href="/account?view=sign-in"
              className="mt-3 inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6b3b] underline underline-offset-4"
            >
              Sign in
            </LocalizedClientLink>
          </div>
        )}

        {errorMessage ? <p className="mt-4 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="mt-8">
          {isLoading ? (
            <p className="text-base text-[#3b3024]">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-base text-[#3b3024]">No comments yet. Be the first to comment.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-xl border border-[#2f6b3b]/20 bg-[#fbf7ef] p-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6b3b]">
                    {comment.author}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#7a6a57]">
                    {dateFormatter.format(new Date(comment.createdAt))}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#3b3024]">
                    {comment.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default PostComments
