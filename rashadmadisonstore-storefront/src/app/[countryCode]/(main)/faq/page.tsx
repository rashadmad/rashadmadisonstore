import { Metadata } from "next"

import { appCopy } from "@lib/copy"
import CustomerServiceClient from "../customer-service/customer-service-client"

export const metadata: Metadata = {
  title: appCopy.metadata.customerService.title,
  description: appCopy.metadata.customerService.description,
}

export default function FAQPage() {
  return <CustomerServiceClient />
}