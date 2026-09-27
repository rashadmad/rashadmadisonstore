"use client"

import { FormEvent, useState } from "react"
import { CalendarDaysIcon, PaintBrushIcon, HandRaisedIcon } from "@heroicons/react/24/outline"
import { appCopy } from "@lib/copy"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function NewsletterSubscription() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirstName || !trimmedLastName) {
      setSuccess("")
      setError(appCopy.newsletter.validation.requiredName)
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setSuccess("")
      setError(appCopy.newsletter.validation.invalidEmail)
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        }),
      })

      if (!response.ok) {
        throw new Error("Newsletter subscription failed")
      }

      setSuccess(appCopy.newsletter.validation.success)
      setFirstName("")
      setLastName("")
      setEmail("")
    } catch {
      setSuccess("")
      setError(appCopy.newsletter.validation.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="relative isolate overflow-hidden bg-[#101b12]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-[1.08] bg-cover bg-center bg-no-repeat brightness-125 contrast-110 saturate-125"
        style={{
          backgroundImage: "url('/images/zuluHusband.jpeg')",
          backgroundPosition: "center 26%",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(250,220,142,0.38),transparent_30%),linear-gradient(90deg,rgba(10,16,12,0.82),rgba(10,16,12,0.55),rgba(10,16,12,0.42))]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl min-h-[780px] px-6 py-16 sm:min-h-[860px] sm:px-8 sm:py-20 lg:min-h-[940px] lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-xl lg:max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-yellow-300">
              Studio updates
            </p>
            <h2
              id="newsletter-heading"
              className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {appCopy.newsletter.heading}
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/85 sm:text-xl">
              {appCopy.newsletter.description}
            </p>
            <form className="mt-8 max-w-lg" onSubmit={handleSubscription} noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="sr-only" htmlFor="newsletter-first-name">
                  {appCopy.newsletter.labels.firstName}
                </label>
                <input
                  id="newsletter-first-name"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={appCopy.newsletter.labels.firstNamePlaceholder}
                  autoComplete="given-name"
                  required
                  className="min-w-0 rounded-full border border-white/30 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-white/70 outline-none ring-0 backdrop-blur-sm transition focus:border-yellow-300 focus:bg-white/15 sm:text-sm/6"
                />
                <label className="sr-only" htmlFor="newsletter-last-name">
                  {appCopy.newsletter.labels.lastName}
                </label>
                <input
                  id="newsletter-last-name"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={appCopy.newsletter.labels.lastNamePlaceholder}
                  autoComplete="family-name"
                  required
                  className="min-w-0 rounded-full border border-white/30 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-white/70 outline-none ring-0 backdrop-blur-sm transition focus:border-yellow-300 focus:bg-white/15 sm:text-sm/6"
                />
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="email-address" className="sr-only">
                  {appCopy.newsletter.labels.email}
                </label>
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
                  className="min-w-0 flex-auto rounded-full border border-white/30 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-white/70 outline-none ring-0 backdrop-blur-sm transition focus:border-yellow-300 focus:bg-white/15 sm:text-sm/6"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex flex-none items-center justify-center rounded-full border-b-4 border-yellow-300 bg-yellow-300 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#101b12] transition hover:border-yellow-200 hover:bg-yellow-200"
                >
                  {isSubmitting
                    ? appCopy.newsletter.labels.submitting
                    : appCopy.newsletter.labels.submit}
                </button>
              </div>
              <div aria-live="polite" aria-atomic="true">
                {error && (
                  <p id="newsletter-email-error" className="mt-3 text-sm text-red-200">
                    {error}
                  </p>
                )}
                {success && <p className="mt-3 text-sm text-green-200">{success}</p>}
              </div>
            </form>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-black/30 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
            <dl className="grid grid-cols-1 gap-8">
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/90 p-2 ring-1 ring-gray-200">
                  <CalendarDaysIcon aria-hidden="true" className="size-6 text-[#0d160f]" />
                </div>
                <dt className="mt-4 text-lg font-semibold text-white">
                  {appCopy.newsletter.highlights.first.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-white/80">
                  {appCopy.newsletter.highlights.first.description}
                </dd>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/90 p-2 ring-1 ring-gray-200">
                  <PaintBrushIcon aria-hidden="true" className="size-6 text-[#0d160f]" />
                </div>
                <dt className="mt-4 text-lg font-semibold text-white">
                  {appCopy.newsletter.highlights.second.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-white/80">
                  {appCopy.newsletter.highlights.second.description}
                </dd>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/90 p-2 ring-1 ring-gray-200">
                  <HandRaisedIcon aria-hidden="true" className="size-6 text-[#0d160f]" />
                </div>
                <dt className="mt-4 text-lg font-semibold text-white">
                  {appCopy.newsletter.highlights.third.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-white/80">
                  {appCopy.newsletter.highlights.third.description}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
