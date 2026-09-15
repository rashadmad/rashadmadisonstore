"use client"

import { useState, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faPhone, faSearch, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { appCopy } from "@lib/copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CustomerServiceClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({})

  const toggleFaq = (key: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const categories = appCopy.customerService.categories

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return categories
      .map((cat) => {
        if (selectedCategory !== "all" && cat.id !== selectedCategory) {
          return null
        }

        if (!query) {
          return cat
        }

        const matchingQuestions = cat.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query)
        )

        if (matchingQuestions.length === 0) {
          return null
        }

        return {
          ...cat,
          questions: matchingQuestions,
        }
      })
      .filter((cat): cat is typeof categories[number] => cat !== null)
  }, [searchQuery, selectedCategory, categories])

  return (
    <div className="bg-[#f6f1e7] text-[#17120d] min-h-screen">
      {/* Hero Header */}
      <section
        id="customer-service-hero"
        aria-labelledby="customer-service-heading"
        className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,rgba(214,168,66,0.22),transparent_34%),linear-gradient(135deg,#102315_0%,#1b361f_55%,#0f1813_100%)] text-white"
      >
        <div className="absolute inset-0 bg-[url('/images/greenPatternTwo.jpg')] opacity-10 mix-blend-screen" />
        <div className="content-container relative py-16 sm:py-20 lg:py-24 max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-yellow-300/90 font-semibold">
            {appCopy.customerService.eyebrow}
          </p>
          <h1
            id="customer-service-heading"
            className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl"
          >
            {appCopy.customerService.heading}
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/80 sm:text-xl max-w-2xl mx-auto">
            {appCopy.customerService.subheading}
          </p>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 text-white/50 text-base"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={appCopy.customerService.searchPlaceholder}
                className="w-full rounded-full border border-white/20 bg-white/10 pl-12 pr-4 py-3.5 text-white placeholder-white/60 text-base focus:border-yellow-300 focus:bg-white/15 focus:outline-none transition backdrop-blur-sm"
                aria-label="Search FAQs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-sm text-yellow-300 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <div className="content-container py-12 sm:py-16 lg:py-20 max-w-5xl mx-auto">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "bg-[#2f6b3b] text-white shadow-sm"
                : "bg-white/80 text-[#204025] hover:bg-white border border-[#204025]/15"
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-[#2f6b3b] text-white shadow-sm"
                  : "bg-white/80 text-[#204025] hover:bg-white border border-[#204025]/15"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Questions Accordion */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-10">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-[#204025]/15 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(23,18,13,0.04)]"
              >
                <h2 className="text-2xl font-bold text-[#102315] mb-6 pb-3 border-b border-[#204025]/10">
                  {cat.title}
                </h2>
                <div className="divide-y divide-[#204025]/10">
                  {cat.questions.map((faq, idx) => {
                    const faqKey = `${cat.id}-${idx}`
                    const isOpen = openFaqs[faqKey] ?? true // default open first view for easy reading

                    return (
                      <div key={faqKey} className="py-4 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => toggleFaq(faqKey)}
                          className="w-full flex items-center justify-between gap-4 text-left group focus:outline-none"
                          aria-expanded={isOpen}
                        >
                          <span className="text-lg font-semibold text-[#17120d] group-hover:text-[#2f6b3b] transition-colors">
                            {faq.q}
                          </span>
                          <span className="flex-none h-8 w-8 rounded-full bg-[#f6f1e7] flex items-center justify-center text-[#2f6b3b]">
                            <FontAwesomeIcon
                              icon={isOpen ? faChevronUp : faChevronDown}
                              className="text-sm"
                            />
                          </span>
                        </button>
                        {isOpen && (
                          <p className="mt-3 text-base text-[#3b3024] leading-relaxed pr-8">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#204025]/15 p-8">
            <p className="text-xl font-semibold text-[#102315]">
              No questions found matching &quot;{searchQuery}&quot;
            </p>
            <p className="mt-2 text-base text-[#3b3024]">
              Try searching with different keywords or contact us directly below.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="mt-6 inline-flex items-center rounded border-b-4 border-green-800 bg-green-600 px-4 py-2 font-bold text-white hover:border-green-600 hover:bg-green-500"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Direct Contact Banner */}
        <section
          aria-labelledby="contact-box-heading"
          className="mt-16 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(214,168,66,0.22),transparent_34%),linear-gradient(135deg,#102315_0%,#1b361f_55%,#0f1813_100%)] p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/images/greenPatternTwo.jpg')] opacity-10 mix-blend-screen pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2
              id="contact-box-heading"
              className="text-3xl font-display font-semibold sm:text-4xl text-white"
            >
              {appCopy.customerService.contactBox.heading}
            </h2>
            <p className="mt-3 text-lg text-white/80">
              {appCopy.customerService.contactBox.body}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={appCopy.footer.contact.emailHref}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded border-b-4 border-green-800 bg-green-600 px-6 py-3.5 font-bold text-white hover:border-green-600 hover:bg-green-500 hover:text-yellow-300 transition"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                {appCopy.customerService.contactBox.emailLabel}
              </a>
              <a
                href={appCopy.footer.contact.phoneHref}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded border-b-4 border-yellow-500 bg-yellow-400 px-6 py-3.5 font-bold text-[#102315] hover:bg-yellow-300 transition"
              >
                <FontAwesomeIcon icon={faPhone} />
                {appCopy.customerService.contactBox.phoneLabel}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}