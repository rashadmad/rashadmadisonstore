"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CollectionsError({ error, reset }: Props) {
  void error

  return (
    <div className="content-container py-12 sm:py-16">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h1 className="text-2xl font-semibold">Collection is temporarily unavailable</h1>
        <p className="mt-2 text-sm">
          Something failed while loading this page. You can try again or return to home.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Try again
          </button>
          <LocalizedClientLink
            href="/"
            className="text-sm font-semibold text-red-900 underline"
          >
            Go to home page
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
