import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { DM_Sans, Syne } from "next/font/google"
import "styles/globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${dmSans.variable} ${syne.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        <main id="main-content" className="relative">
          {props.children}
        </main>
      </body>
    </html>
  )
}
