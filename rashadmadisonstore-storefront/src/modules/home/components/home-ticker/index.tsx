"use client"

import { useMemo, useState } from "react"

const messages = [
  "New original works and limited prints are being added weekly, so check back often for fresh pieces from Rashad Madison.",
  "Thank you for supporting independent Afrocentric art. Every order helps fund new collections, community projects, and future exhibitions.",
]

const HomeTicker = () => {
  const [dismissed, setDismissed] = useState(false)

  const tickerText = useMemo(
    () => `${messages[0]}  •  ${messages[1]}  •  `,
    []
  )

  if (dismissed) {
    return null
  }

  return (
    <div className="w-full">
      <div className="relative flex h-10 w-full items-center overflow-hidden bg-black pr-10 text-yellow-300">
        <div className="mx-auto w-full max-w-screen-2xl">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Close ticker"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black px-2 py-0.5 text-yellow-300"
          >
            ×
          </button>

          <div className="ticker-track whitespace-nowrap text-sm font-medium">
            <span className="ticker-item inline-block px-4">{tickerText}</span>
            <span className="ticker-item inline-block px-4" aria-hidden="true">
              {tickerText}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          display: inline-flex;
          min-width: max-content;
          animation: ticker-pan 28s linear infinite;
        }

        @keyframes ticker-pan {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

export default HomeTicker
