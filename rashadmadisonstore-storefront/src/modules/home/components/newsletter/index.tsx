"use client"

import { FormEvent, useState } from "react"
import { CalendarDaysIcon, HandRaisedIcon } from "@heroicons/react/24/outline"
import { appCopy } from "@lib/copy"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubscription = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setSuccess("")
      setError(appCopy.newsletter.validation.invalidEmail)
      return
    }

    // Placeholder for subscription logic once provider integration is wired.
    setError("")
    setSuccess(appCopy.newsletter.validation.success)
    setEmail("")
  }

  return (
    <section className="relative isolate overflow-hidden bg-gray-700 py-16 sm:py-24 lg:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-green-400 dark:text-white">
              {appCopy.newsletter.heading}
            </h2>
            <p className="mt-4 text-lg text-white dark:text-gray-300">
              {appCopy.newsletter.description}
            </p>
            <form className="mt-6 max-w-md" onSubmit={handleSubscription} noValidate>
              <label htmlFor="email-address" className="sr-only">
                {appCopy.newsletter.labels.email}
              </label>
              <div className="flex gap-x-4">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) {
                      setError("")
                    }
                    if (success) {
                      setSuccess("")
                    }
                  }}
                  placeholder={appCopy.newsletter.labels.emailPlaceholder}
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "newsletter-email-error" : undefined}
                  className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                />
                <button
                  type="submit"
                  className="inline-flex flex-none items-center rounded border-b-4 border-green-700 bg-green-500 px-4 py-2 font-bold text-white hover:border-green-500 hover:bg-green-400 hover:text-yellow-300"
                >
                  {appCopy.newsletter.labels.submit}
                </button>
              </div>
              {error && (
                <p id="newsletter-email-error" className="mt-2 text-sm text-red-200">
                  {error}
                </p>
              )}
              {success && <p className="mt-2 text-sm text-green-200">{success}</p>}
            </form>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/90 p-2 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                <CalendarDaysIcon
                  aria-hidden="true"
                  className="size-6 text-green-600 dark:text-white"
                />
              </div>
              <dt className="mt-4 text-base font-semibold text-green-500 dark:text-white">
                {appCopy.newsletter.highlights.first.title}
              </dt>
              <dd className="mt-2 text-base/7 text-white dark:text-white">
                {appCopy.newsletter.highlights.first.description}
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/90 p-2 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                <HandRaisedIcon
                  aria-hidden="true"
                  className="size-6 text-green-600 dark:text-white"
                />
              </div>
              <dt className="mt-4 text-base font-semibold text-green-500 dark:text-white">
                {appCopy.newsletter.highlights.second.title}
              </dt>
              <dd className="mt-2 text-base/7 text-white dark:text-white">
                {appCopy.newsletter.highlights.second.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-30"
        />
      </div>
    </section>
  )
}
