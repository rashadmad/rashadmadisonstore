import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"

type ShopPageHeroProps = {
  sectionId: string
  heading: string
  tagline: string
  intro: string
  highlightsLabel: string
  highlights: { icon: IconDefinition; text: string }[]
  backgroundImage: string
  ctaLabel?: string
}

export default function ShopPageHero({
  sectionId,
  heading,
  tagline,
  intro,
  highlightsLabel,
  highlights,
  backgroundImage,
  ctaLabel,
}: ShopPageHeroProps) {
  return (
    <section
      id={`${sectionId}-intro`}
      aria-labelledby={`${sectionId}-heading`}
      className="relative mb-10 overflow-hidden bg-green-950 text-white sm:mb-14"
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        sizes="100vw"
        priority
        className="pointer-events-none object-cover opacity-40"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-green-950/60" aria-hidden="true" />

      <div className="content-container relative grid gap-8 px-6 py-10 sm:grid-cols-2 sm:items-center sm:gap-10 sm:px-10 sm:py-12 lg:px-16">
        <div>
          <h1
            id={`${sectionId}-heading`}
            className="font-display text-4xl font-semibold tracking-tight text-yellow-300 sm:text-5xl"
          >
            {heading}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/90 sm:text-base">
            {tagline}
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/95 sm:text-lg sm:leading-8">
            {intro}
          </p>
          {ctaLabel ? (
            <a
              href="#products"
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-yellow-300 px-5 py-3 font-semibold text-green-950 transition-colors hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>

        <ul className="grid gap-3 sm:gap-4" aria-label={highlightsLabel}>
          {highlights.map(({ icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 border-t border-white/25 pt-3 text-sm leading-6 text-white/95 first:border-t-0 first:pt-0 sm:text-base"
            >
              <FontAwesomeIcon
                icon={icon}
                className="mt-1 h-4 w-4 shrink-0 text-yellow-300"
                aria-hidden="true"
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
