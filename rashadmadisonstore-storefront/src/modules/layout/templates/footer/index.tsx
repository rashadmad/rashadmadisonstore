import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full bg-[url('/greenPatternTwo.jpg')] bg-repeat bg-[length:260px_auto]">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 gap-y-12 py-20 sm:py-24 md:grid-cols-12 md:gap-x-10 md:items-start">
          <div className="md:col-span-4 flex flex-col items-center md:items-start gap-y-4 md:max-w-xs">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-white uppercase text-white text-center md:text-left"
            >
              The Quintessential
            </LocalizedClientLink>
            <img
              src="/philosipher_symbol.svg"
              alt="The Quintessential"
              className="h-36 sm:h-40 w-auto block"
            />
          </div>
          <div className="md:col-span-8 w-full text-small-regular grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-14">
            <div className="flex flex-col gap-y-3 min-w-0 items-center text-center sm:items-start sm:text-left">
              <span className="txt-small-plus text-white">
                Collections
              </span>
              <ul
                className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small justify-items-center sm:justify-items-start"
                data-testid="footer-categories"
              >
                <li>
                  <LocalizedClientLink
                    className="hover:text-white text-green-400"
                    href="/collections"
                  >
                    African Princess
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white text-green-400"
                    href="/collections"
                  >
                    Prince
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white text-green-400"
                    href="/collections"
                  >
                    Tender Head
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white text-green-400"
                    href="/collections"
                  >
                    African sunset
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-3 min-w-0 items-center text-center sm:items-start sm:text-left">
              <span className="txt-small-plus text-white">Contact info</span>
              <ul className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small justify-items-center sm:justify-items-start">
                <li>
                  <a
                    className="hover:text-white text-green-400"
                    href="tel:773320579"
                  >
                    773320579
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white text-green-400"
                    href="mailto:rashadmad@gmail.com"
                  >
                    rashadmad@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex w-full flex-col gap-y-3 sm:col-span-2 lg:col-span-1 items-center sm:items-start text-center sm:text-left justify-self-center sm:justify-self-start">
              <span className="txt-small-plus text-white">Follow me</span>
              <div className="flex flex-wrap gap-3 items-center sm:items-start justify-center sm:justify-start">
                <a
                  href="https://www.instagram.com/rashaddraws/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center gap-3 text-white hover:text-yellow-300 transition-colors"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-black transition hover:bg-green-500">
                    <FontAwesomeIcon icon={faInstagram} className="text-xl" />
                  </span>
                  <span className="txt-small-plus">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/rashad.madison.1/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="inline-flex items-center gap-3 text-white hover:text-yellow-300 transition-colors"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-black transition hover:bg-green-500">
                    <FontAwesomeIcon icon={faFacebook} className="text-xl" />
                  </span>
                  <span className="txt-small-plus">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full border-t border-white/50 pt-8 mb-12 md:mb-14 flex-col items-center gap-4 md:flex-row md:justify-between text-ui-fg-muted">
          <Text className="txt-compact-small text-white text-center md:text-left">
            © {new Date().getFullYear()} The Quintessential. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
