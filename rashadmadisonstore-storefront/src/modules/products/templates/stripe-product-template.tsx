import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StripeGalleryProduct } from "@lib/data/stripe-products"

type StripeProductTemplateProps = {
  product: StripeGalleryProduct
}

export default function StripeProductTemplate({ product }: StripeProductTemplateProps) {
  const primaryImage = product.images?.[0] ?? "/images/placeHolderProfile.png"

  return (
    <div className="bg-[#f5f2ea] py-10 sm:py-14">
      <div className="content-container rounded-[2rem] border border-[#e6dfd0] bg-[#f8f4ee] p-4 shadow-[0_12px_40px_rgba(23,32,18,0.04)] sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
          <LocalizedClientLink href="/" className="transition hover:text-green-600">
            Home
          </LocalizedClientLink>
          <span aria-hidden="true" className="text-green-500">
            |
          </span>
          <LocalizedClientLink href="/gallery" className="transition hover:text-green-600">
            Back to gallery
          </LocalizedClientLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d9d0be] bg-[#f0eadf] shadow-[0_10px_30px_rgba(23,32,18,0.05)]">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                {product.medium}
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-green-600 sm:text-5xl">
                {product.name}
              </h1>
            </div>

            {product.description ? (
              <div className="rounded-2xl border border-[#e6dfd0] bg-white/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f524b]">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-line text-base leading-7 text-[#4f524b]">
                  {product.description}
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-4">
              <div className="rounded-full border border-[#d9d0be] bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#173d29]">
                {product.displayPrice}
              </div>

              {product.purchaseUrl ? (
                <a
                  href={product.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded border-b-4 border-green-800 bg-green-600 px-5 font-bold text-white transition hover:border-green-600 hover:bg-green-500 hover:text-yellow-300"
                >
                  Buy now
                </a>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded border-b-4 border-green-800 bg-green-600 px-5 font-bold text-white opacity-70"
                  disabled
                >
                  Buy now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
