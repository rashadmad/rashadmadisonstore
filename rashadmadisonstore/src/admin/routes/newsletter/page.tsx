import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { getSubscribers, PAGE_SIZE, SubscriberPage } from "../../lib/newsletter"

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date))

const NewsletterPage = () => {
  const [offset, setOffset] = useState(0)
  const [page, setPage] = useState<SubscriberPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setPage(null)

    getSubscribers(offset)
      .then((result) => {
        if (active) setPage(result)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "An unexpected error occurred.")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [offset, retry])

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-6">
      <h1 className="text-xl font-semibold text-ui-fg-base">Newsletter subscribers</h1>
      <p className="mt-2 text-sm text-ui-fg-subtle">
        Newsletter signups are separate from customer accounts.
      </p>

      {loading && <p className="mt-6" role="status">Loading subscribers...</p>}
      {error && (
        <div className="mt-6" role="alert">
          <p>Could not load subscribers: {error}</p>
          <button
            type="button"
            className="mt-3 rounded border border-ui-border-base px-3 py-2"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {page && (
        <>
          <p className="mt-6 text-sm text-ui-fg-subtle">
            {page.count} {page.count === 1 ? "signup" : "signups"} total, including unsubscribed.
          </p>
          {page.count === 0 ? (
            <p className="mt-4">No newsletter signups yet.</p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ui-border-base">
                      <th scope="col" className="px-3 py-2">Name</th>
                      <th scope="col" className="px-3 py-2">Email</th>
                      <th scope="col" className="px-3 py-2">Status</th>
                      <th scope="col" className="px-3 py-2">Signed up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-ui-border-base">
                        <td className="px-3 py-3">{subscriber.first_name} {subscriber.last_name}</td>
                        <td className="px-3 py-3">{subscriber.email}</td>
                        <td className="px-3 py-3">{subscriber.status === "subscribed" ? "Subscribed" : "Unsubscribed"}</td>
                        <td className="px-3 py-3">{formatDate(subscriber.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {page.subscribers.length === 0 && (
                <p className="mt-4">No signups on this page. Use Previous to return to an earlier page.</p>
              )}
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-ui-fg-subtle">
                  Showing {page.subscribers.length === 0 ? 0 : page.offset + 1}
                  {"–"}{page.subscribers.length === 0 ? 0 : page.offset + page.subscribers.length} of {page.count}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-ui-border-base px-3 py-2 disabled:opacity-50"
                    disabled={offset === 0}
                    onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rounded border border-ui-border-base px-3 py-2 disabled:opacity-50"
                    disabled={page.offset + page.subscribers.length >= page.count || page.subscribers.length === 0}
                    onClick={() => setOffset((value) => value + PAGE_SIZE)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Newsletter",
})

export default NewsletterPage
