import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404 - Page Not Found | The Quintessential",
  description: "Sorry, we couldn’t find the page you’re looking for.",
}

export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 grid-rows-[1fr_auto_1fr] bg-[#f6f1e7] text-[#17120d] lg:grid-cols-[max(50%,36rem)_1fr] dark:bg-gray-900 dark:text-white">
      <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
        <LocalizedClientLink href="/" className="inline-flex items-center gap-3">
          <span className="sr-only">The Quintessential</span>
          <img
            alt="The Quintessential"
            src="/images/philosopher_symbol.svg"
            className="h-10 w-auto sm:h-12 brightness-0"
          />
        </LocalizedClientLink>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-20 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
        <div className="max-w-lg">
          <p className="text-base/8 font-semibold text-green-600 dark:text-green-400">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl dark:text-white">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-300">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10">
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center gap-2 rounded border-b-4 border-green-800 bg-green-600 px-4 py-2 font-bold text-white transition hover:border-green-600 hover:bg-green-500 hover:text-yellow-300"
            >
              <span aria-hidden="true">&larr;</span> Back to home
            </LocalizedClientLink>
          </div>
        </div>
      </main>
      <footer className="self-end lg:col-span-2 lg:col-start-1 lg:row-start-3">
        <div className="border-t border-black/10 bg-white/50 py-8 dark:border-white/10 dark:bg-gray-800/50">
          <nav className="mx-auto flex w-full max-w-7xl items-center gap-x-6 px-6 text-sm/7 text-gray-600 lg:px-8 dark:text-gray-400">
            <LocalizedClientLink href="/customer-service" className="hover:text-green-600 dark:hover:text-green-400 font-medium">
              Contact support
            </LocalizedClientLink>
            <svg viewBox="0 0 2 2" aria-hidden="true" className="size-1 fill-gray-400 dark:fill-gray-600">
              <circle r={1} cx={1} cy={1} />
            </svg>
            <LocalizedClientLink href="/gallery" className="hover:text-green-600 dark:hover:text-green-400 font-medium">
              Browse gallery
            </LocalizedClientLink>
          </nav>
        </div>
      </footer>
      <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
        <img
          alt="Lost and Found - The Quintessential"
          src="/images/lost_n_found.jpg"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  )
}
