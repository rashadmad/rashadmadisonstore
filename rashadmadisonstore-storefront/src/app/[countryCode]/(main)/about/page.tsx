import { Metadata } from "next"

import { appCopy } from "@lib/copy"
import AnimatedImage from "@modules/common/components/animated-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: appCopy.metadata.about.title,
  description: appCopy.metadata.about.description,
}

export default function AboutPage() {
  return (
    <div className="bg-[#f6f1e7] text-[#17120d]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,rgba(214,168,66,0.22),transparent_34%),linear-gradient(135deg,#102315_0%,#1b361f_55%,#0f1813_100%)] text-white">
        <div className="absolute inset-0 bg-[url('/greenPatternTwo.jpg')] opacity-10 mix-blend-screen" />
        <div className="content-container relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center lg:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-300/90">
              {appCopy.about.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {appCopy.about.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              {appCopy.about.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LocalizedClientLink
                href="/gallery"
                className="inline-flex items-center rounded-full border border-yellow-300/70 bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#142013] transition hover:bg-transparent hover:text-yellow-300"
              >
                {appCopy.about.ctaPrimary}
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/collections"
                className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-yellow-300 hover:text-yellow-300"
              >
                {appCopy.about.ctaSecondary}
              </LocalizedClientLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] border border-yellow-300/20 bg-yellow-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <AnimatedImage
                src="/profile.JPG"
                alt="Portrait of Rashad Madison"
                wrapperClassName="h-[420px] w-full rounded-[1.5rem] sm:h-[520px]"
                className="h-[420px] w-full rounded-[1.5rem] object-cover sm:h-[520px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="content-container py-14 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="space-y-6">
            {appCopy.about.story.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-lg leading-8 text-[#3b3024] sm:text-xl">
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-[#204025]/15 bg-[#ede0c8] p-6 shadow-[0_18px_40px_rgba(23,18,13,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">Studio note</p>
            <p className="mt-4 text-2xl font-semibold leading-tight text-[#17120d]">
              {appCopy.about.quote}
            </p>
          </aside>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#e7dcc9]">
        <div className="content-container py-14 sm:py-16 lg:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">Practice</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#17120d] sm:text-4xl">
              Three anchors shape the work.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {appCopy.about.pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-[1.75rem] border border-[#204025]/15 bg-[#f9f4ec] p-6 shadow-[0_18px_35px_rgba(23,18,13,0.06)]"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">{pillar.title}</p>
                <p className="mt-4 text-lg leading-8 text-[#3b3024]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-container py-14 sm:py-16 lg:py-20">
        <div className="rounded-[2rem] border border-black/10 bg-[#132017] px-6 py-10 text-white shadow-[0_26px_80px_rgba(0,0,0,0.18)] sm:px-10 sm:py-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-yellow-300">Why it matters</p>
            <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
              {appCopy.about.closing}
            </p>
          </div>
          <div className="mt-8 lg:mt-0">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#142013] transition hover:bg-transparent hover:text-yellow-300"
            >
              Visit the store
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
