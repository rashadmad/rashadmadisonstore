jest.mock("@lib/config", () => ({
  sdk: { client: { fetch: jest.fn() } },
}))

jest.mock("./cookies", () => ({
  getAuthHeaders: jest.fn().mockResolvedValue({}),
  getCacheOptions: jest.fn(),
  getCartId: jest.fn().mockResolvedValue("cart_1"),
  getCacheTag: jest.fn().mockResolvedValue("carts-cache"),
}))

jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }))

jest.mock("@lib/util/medusa-error", () => ({
  __esModule: true,
  default: (error: Error) => {
    throw error
  },
}))

import { sdk } from "@lib/config"
import { applyAutomaticShipping, listCartShippingMethods } from "./fulfillment"
import { revalidateTag } from "next/cache"
import { getCartId } from "./cookies"

const mockFetch = jest.mocked(sdk.client.fetch)

describe("cart delivery options", () => {
  beforeEach(() => jest.clearAllMocks())

  it("fetches fresh eligibility after shipping configuration or address changes", async () => {
    mockFetch.mockResolvedValueOnce({ shipping_options: [] })
    mockFetch.mockResolvedValueOnce({
      shipping_options: [{ id: "local-free", amount: 0 }],
    })

    await expect(listCartShippingMethods("cart_1")).resolves.toEqual([])
    await expect(listCartShippingMethods("cart_1")).resolves.toEqual([
      { id: "local-free", amount: 0 },
    ])
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/store/shipping-options", {
      method: "GET",
      query: { cart_id: "cart_1" },
      headers: {},
      cache: "no-store",
    })
  })

  it("surfaces failed delivery requests instead of hiding checkout", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Shipping service unavailable"))
    await expect(listCartShippingMethods("cart_1")).rejects.toThrow(
      "Shipping service unavailable"
    )
  })

  it("applies backend shipping to the cookie cart and refreshes totals", async () => {
    mockFetch.mockResolvedValueOnce({ amount: 14.25, local: false })
    await expect(applyAutomaticShipping()).resolves.toEqual({ amount: 14.25, local: false })
    expect(mockFetch).toHaveBeenCalledWith("/store/carts/cart_1/automatic-shipping", {
      method: "POST", headers: {}, cache: "no-store",
    })
    expect(revalidateTag).toHaveBeenCalledWith("carts-cache")
  })

  it("rejects automatic shipping without a cart", async () => {
    jest.mocked(getCartId).mockResolvedValueOnce(undefined)
    await expect(applyAutomaticShipping()).rejects.toThrow("No cart found")
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("does not turn failed automatic calculations into zero shipping", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Missing profile rate"))
    await expect(applyAutomaticShipping()).rejects.toThrow("Missing profile rate")
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
