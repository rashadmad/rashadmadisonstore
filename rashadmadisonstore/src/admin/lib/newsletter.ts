import Medusa from "@medusajs/js-sdk"

declare const __BACKEND_URL__: string | undefined
declare const __AUTH_TYPE__: "session" | "jwt" | undefined
declare const __JWT_TOKEN_STORAGE_KEY__: string | undefined

export type Subscriber = {
  id: string
  first_name: string
  last_name: string
  email: string
  status: "subscribed" | "unsubscribed"
  source: string
  consented_at: string
  created_at: string
}

export type SubscriberPage = {
  subscribers: Subscriber[]
  count: number
  offset: number
  limit: number
}

export const PAGE_SIZE = 50

const sdk = new Medusa({
  baseUrl: __BACKEND_URL__ || "/",
  auth: {
    type: __AUTH_TYPE__ ?? "session",
    jwtTokenStorageKey: __JWT_TOKEN_STORAGE_KEY__ || undefined,
  },
})

export const getSubscribers = (offset: number): Promise<SubscriberPage> =>
  sdk.client.fetch<SubscriberPage>("/admin/newsletter", {
    query: { limit: PAGE_SIZE, offset },
  })
