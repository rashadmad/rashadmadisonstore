import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type HeroProps = {
  customer: HttpTypes.StoreCustomer | null
  hasLoggedInBefore: boolean
}

const Hero = ({ customer, hasLoggedInBefore }: HeroProps) => {
  return (
    <main>
      <div className="relative isolate">
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-256 w-full mask-[radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-gray-200 dark:stroke-white/10"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg
            x="50%"
            y={-1}
            className="overflow-visible fill-gray-50 dark:fill-gray-800"
          >
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
            width="100%"
            height="100%"
            strokeWidth={0}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        >
          <div
            style={{
              clipPath:
                "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
            }}
            className="aspect-801/1036 w-200.25 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          />
        </div>
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                <div className="mt-4 flex w-full flex-col items-center gap-4 text-center sm:items-start sm:text-left lg:items-center lg:text-center">
                  <Heading
                    level="h1"
                    className="font-display block text-5xl leading-10 text-ui-fg-base font-bold mb-5 text-green-500"
                  >
                    This Is The Quintessential
                  </Heading>
                  <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans">
                    as of right now this is the place to
                  </p>
                  <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans">
                    celebrate and contribute to the Art projects
                  </p>
                  <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans">
                    of Rashad Madison
                  </p>

                  <div className="m-5 flex flex-col items-center gap-4 self-auto sm:items-start sm:self-start lg:items-center lg:self-auto">
                    <LocalizedClientLink
                      href="/collections"
                      className="inline-flex items-center bg-green-600 hover:bg-green-500 text-white hover:text-yellow-300 font-bold py-2 px-4 border-b-4 border-green-800 hover:border-green-600 rounded"
                    >
                      Browse Collection
                    </LocalizedClientLink>
                    <a
                      href="https://stripe.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white hover:text-yellow-300 font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
                    >
                      Donate materials
                    </a>
                    {!customer && (
                      <LocalizedClientLink
                        href={hasLoggedInBefore ? "/account?view=sign-in" : "/account?view=register"}
                        className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white hover:text-yellow-300 font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
                      >
                        {hasLoggedInBefore ? "Sign back in" : "Create an Account"}
                      </LocalizedClientLink>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="ml-auto w-56 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-0 xl:pt-80">
                  <div className="hero-art-frame african-sunset-frame relative">
                    <img
                      alt="African Sunset"
                      src="https://res.cloudinary.com/dxj8b6h12/image/upload/v1784665145/7034_akrxuz.jpg"
                      className="hero-art-frame-image african-sunset-frame-image aspect-2/3 w-full bg-gray-900/5 object-cover dark:bg-gray-700/5"
                    />
                  </div>
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <div className="hero-art-frame relative">
                    <img
                      alt="African Princes red"
                      src="https://res.cloudinary.com/dxj8b6h12/image/upload/v1784772775/africanPrincess_atuxqk.jpg"
                      className="hero-art-frame-image aspect-2/3 w-full bg-gray-900/5 object-cover dark:bg-gray-700/5"
                    />
                  </div>
                  <div className="artFrame-v3 relative">
                    <img
                      alt="Tender Head"
                      src="https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342820/tenderhead_vgseur.jpg"
                      className="hero-art-frame-image aspect-2/3 w-full bg-gray-900/5 object-cover dark:bg-gray-700/5"
                    />
                  </div>
                </div>
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <div className="hero-art-frame-v2 relative">
                    <img
                      alt="Prince"
                      src="https://res.cloudinary.com/dxj8b6h12/image/upload/v1747342819/prince_dczlzy.jpg"
                      className="hero-art-frame-image aspect-2/3 w-full bg-gray-900/5 object-cover dark:bg-gray-700/5"
                    />
                  </div>
                  <div className="hero-art-frame relative">
                    <img
                      alt="Zulu Husband"
                      src="https://res.cloudinary.com/dxj8b6h12/image/upload/v1784773272/ZuluHusband_mr2por.png"
                      className="hero-art-frame-image aspect-2/3 w-full bg-gray-900/5 object-cover dark:bg-gray-700/5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Hero
