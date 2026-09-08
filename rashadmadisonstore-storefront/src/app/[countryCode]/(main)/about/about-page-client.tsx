"use client"

import { useState } from "react"

import { appCopy } from "@lib/copy"
import AnimatedImage from "@modules/common/components/animated-image"
import Modal from "@modules/common/components/modal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AboutPageClient() {
  const [selectedImage, setSelectedImage] = useState<
    | { title: string; src: string; alt: string }
    | null
  >(null)

  const practiceImages = [
    {
      title: "Identity",
      src: "/images/tenderHeadDrawing.jpg",
      alt: "Tender Head drawing study",
    },
    {
      title: "Symbolism",
      src: "/images/tenderHeadInk.jpg",
      alt: "Tender Head ink and symbol exploration",
    },
    {
      title: "Craft",
      src: "/images/tenderHeadScreenPrint.jpeg",
      alt: "Tender Head screen print process",
    },
  ]

  return (
    <div className="bg-[#f6f1e7] text-[#17120d]">
      <section id="about" aria-labelledby="about-heading" className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,rgba(214,168,66,0.22),transparent_34%),linear-gradient(135deg,#102315_0%,#1b361f_55%,#0f1813_100%)] text-white">
        <div className="absolute inset-0 bg-[url('/images/greenPatternTwo.jpg')] opacity-10 mix-blend-screen" />
        <div className="content-container relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center lg:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-300/90">
              {appCopy.about.eyebrow}
            </p>
            <h1 id="about-heading" className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {appCopy.about.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              {appCopy.about.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LocalizedClientLink
                href="/gallery"
                className="inline-flex items-center rounded border-b-4 border-green-800 bg-green-600 px-4 py-2 font-bold text-white hover:border-green-600 hover:bg-green-500 hover:text-yellow-300"
              >
                {appCopy.about.ctaPrimary}
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/collections"
                className="inline-flex items-center rounded border-b-4 border-green-700 bg-green-500 px-4 py-2 font-bold text-white hover:border-green-500 hover:bg-green-400 hover:text-yellow-300"
              >
                {appCopy.about.ctaSecondary}
              </LocalizedClientLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] border border-yellow-300/20 bg-yellow-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <AnimatedImage
                src="/images/profile.JPG"
                alt="Portrait of Rashad Madison"
                wrapperClassName="h-[420px] w-full rounded-[1.5rem] sm:h-[520px]"
                className="h-[420px] w-full rounded-[1.5rem] object-cover sm:h-[520px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about-story" aria-labelledby="about-story-heading" className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/portterHall.webp')] bg-cover bg-center bg-no-repeat opacity-25"
          aria-hidden="true"
        />
        <div className="content-container relative z-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-12">
            <div className="space-y-6">
              <h2 id="about-story-heading" className="sr-only">Artist story</h2>
              {appCopy.about.story.map((paragraph) => (
                <p key={paragraph} className="max-w-3xl text-lg leading-8 text-[#3b3024] font-medium sm:text-xl">
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="w-full max-w-sm mx-auto lg:max-w-none lg:mx-0 rounded-[1.75rem] border border-[#204025]/15 bg-white p-5 sm:p-6 shadow-[0_18px_40px_rgba(23,18,13,0.08)] self-start">
              <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">
                {appCopy.about.education.label}
              </p>
              <a
                href="https://www.scad.edu/"
                target="_blank"
                rel="noreferrer"
                aria-label="Savannah College of Art and Design"
                className="mt-3 block text-[#17120d] transition hover:text-[#2f6b3b]"
              >
                <span className="text-sm font-bold uppercase leading-5 tracking-[0.08em]">
                  {appCopy.about.education.schoolName}
                </span>
              </a>
              <div className="mt-4 flex justify-center">
                <AnimatedImage
                  src="/images/Savannah_College_of_Art_and_Design_seal.png"
                  alt="Savannah College of Art and Design Seal"
                  wrapperClassName="h-auto w-36 sm:w-44"
                  className="h-auto w-36 sm:w-44 object-contain"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="practice" aria-labelledby="practice-heading" className="border-y border-black/10 bg-[#e7dcc9]">
        <div className="content-container py-14 sm:py-16 lg:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">Practice</p>
            <h2 id="practice-heading" className="mt-3 text-3xl font-semibold text-[#17120d] sm:text-4xl">
              This is my process for my screen prints
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {appCopy.about.pillars.map((pillar, index) => {
              const image = practiceImages[index]

              return (
                <article
                  key={pillar.title}
                  className="overflow-hidden rounded-[1.75rem] border border-[#204025]/15 bg-[#f9f4ec] shadow-[0_18px_35px_rgba(23,18,13,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className="block w-full overflow-hidden border-b border-[#204025]/10 bg-[#e8d8b7] text-left"
                    aria-label={`View ${image.title} image`}
                  >
                    <AnimatedImage
                      src={image.src}
                      alt={image.alt}
                      wrapperClassName="h-[22rem] w-full sm:h-[24rem]"
                      className="h-[22rem] w-full object-contain bg-[#efe2c4] transition-transform duration-300 hover:scale-[1.08] sm:h-[24rem]"
                    />
                  </button>
                  <div className="p-6">
                    <p className="text-sm uppercase tracking-[0.22em] text-[#2f6b3b]">
                      {pillar.title}
                    </p>
                    <p className="mt-4 text-lg leading-8 text-[#3b3024]">{pillar.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="about-support" aria-label="Support the practice" className="content-container py-14 sm:py-16 lg:py-20">
        <div className="rounded-[2rem] border border-black/10 bg-[#132017] px-6 py-10 text-white shadow-[0_26px_80px_rgba(0,0,0,0.18)] sm:px-10 sm:py-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-yellow-300">Why it matters</p>
            <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
              {appCopy.about.closing}
            </p>
          </div>
          <div className="mt-8 lg:mt-0">
            <LocalizedClientLink
              href="/gallery"
              className="inline-flex items-center rounded border-b-4 border-green-800 bg-green-600 px-4 py-2 font-bold text-white hover:border-green-600 hover:bg-green-500 hover:text-yellow-300"
            >
              Visit the gallery
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      {selectedImage && (
        <Modal isOpen={!!selectedImage} close={() => setSelectedImage(null)} size="large">
          <Modal.Body>
            <div className="relative w-full rounded-[1.25rem] border border-[#d8d1c3] bg-white p-4 shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                aria-label="Close image modal"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d1c3] bg-white text-lg font-bold text-[#17120d] shadow-md transition hover:scale-105"
              >
                ×
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-h-[75vh] w-full rounded-[0.8rem] object-contain"
              />
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}
