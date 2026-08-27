import { Metadata } from "next"

import { appCopy } from "@lib/copy"
import AboutPageClient from "./about-page-client"

export const metadata: Metadata = {
  title: appCopy.metadata.about.title,
  description: appCopy.metadata.about.description,
}

export default function AboutPage() {
  return <AboutPageClient />
}
