/** @jest-environment node */
import { NextRequest } from "next/server"
import { sdk } from "@lib/config"
import { POST } from "../route"

jest.mock("@lib/config", () => ({
  sdk: { client: { fetch: jest.fn() } },
}))

const medusaFetch = jest.mocked(sdk.client.fetch)
const signup = {
  email: "person@example.com",
  firstName: "First",
  lastName: "Last",
  consent: true,
}
const request = (body: string) =>
  new NextRequest("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

describe("Newsletter Medusa proxy", () => {
  beforeEach(() => {
    medusaFetch.mockReset().mockResolvedValue({ ok: true })
  })

  it("forwards signup to Medusa and returns generic success", async () => {
    const response = await POST(request(JSON.stringify(signup)))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(medusaFetch).toHaveBeenCalledWith("/store/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: signup,
      cache: "no-store",
    })
  })

  it("rejects malformed JSON without calling Medusa", async () => {
    const response = await POST(request("{"))
    expect(response.status).toBe(400)
    expect(medusaFetch).not.toHaveBeenCalled()
  })

  it.each(["null", "[]", '"invalid"'])(
    "rejects a non-object signup %s",
    async (body) => {
      const response = await POST(request(body))
      expect(response.status).toBe(400)
      expect(medusaFetch).not.toHaveBeenCalled()
    }
  )

  it.each([400, 500, undefined])(
    "surfaces a backend failure with status %s",
    async (status) => {
      const log = jest.spyOn(console, "error").mockImplementation(() => {})
      try {
        medusaFetch.mockRejectedValue({ status })
        const response = await POST(request(JSON.stringify(signup)))
        expect(response.status).toBe(status === 400 ? 400 : 502)
        expect(await response.json()).toHaveProperty("error")
        expect(log).toHaveBeenCalled()
      } finally {
        log.mockRestore()
      }
    }
  )
})
