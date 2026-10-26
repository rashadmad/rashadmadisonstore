jest.mock("@lib/config", () => ({
  sdk: { client: { fetch: jest.fn() } },
}))
jest.mock("./cookies", () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({}),
}))
jest.mock("@lib/util/medusa-error", () => ({
  __esModule: true,
  default: (error: Error) => { throw error },
}))

import { sdk } from "@lib/config"
import { listCartPaymentMethods } from "./payment"

const mockFetch = jest.mocked(sdk.client.fetch)

describe("Checkout payment providers", () => {
  beforeEach(() => jest.clearAllMocks())

  it("fetches current regional providers instead of caching manual payment", async () => {
    mockFetch.mockResolvedValueOnce({
      payment_providers: [{ id: "pp_system_default" }],
    })
    mockFetch.mockResolvedValueOnce({
      payment_providers: [{ id: "pp_stripe_stripe" }],
    })
    await expect(listCartPaymentMethods("region_1")).resolves.toEqual([
      { id: "pp_system_default" },
    ])
    await expect(listCartPaymentMethods("region_1")).resolves.toEqual([
      { id: "pp_stripe_stripe" },
    ])
    expect(mockFetch).toHaveBeenLastCalledWith("/store/payment-providers", {
      method: "GET",
      query: { region_id: "region_1" },
      headers: {},
      cache: "no-store",
    })
  })

  it("preserves provider ordering", async () => {
    mockFetch.mockResolvedValueOnce({
      payment_providers: [{ id: "z_provider" }, { id: "a_provider" }],
    })
    await expect(listCartPaymentMethods("region_1")).resolves.toEqual([
      { id: "a_provider" }, { id: "z_provider" },
    ])
  })

  it("surfaces provider retrieval failures", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Payment service unavailable"))
    await expect(listCartPaymentMethods("region_1")).rejects.toThrow(
      "Payment service unavailable"
    )
  })
})
