const fetchSubscribers = jest.fn()
const createSdk = jest.fn((_config: unknown) => ({ client: { fetch: fetchSubscribers } }))

jest.mock("@medusajs/js-sdk", () => ({
  __esModule: true,
  default: jest.fn((config) => createSdk(config)),
}))

describe("Newsletter admin API client", () => {
  beforeEach(() => {
    jest.resetModules()
    createSdk.mockClear()
    fetchSubscribers.mockReset()
    Object.assign(globalThis, {
      __BACKEND_URL__: "https://backend.example.test",
      __AUTH_TYPE__: "jwt",
      __JWT_TOKEN_STORAGE_KEY__: "admin-token",
    })
  })

  it("uses the dashboard backend and authentication settings for a paginated request", async () => {
    const response = { subscribers: [], count: 0, offset: 50, limit: 50 }
    fetchSubscribers.mockResolvedValue(response)
    const { getSubscribers } = require("../newsletter")
    await expect(getSubscribers(50)).resolves.toEqual(response)
    expect(createSdk).toHaveBeenCalledWith({
      baseUrl: "https://backend.example.test",
      auth: { type: "jwt", jwtTokenStorageKey: "admin-token" },
    })
    expect(fetchSubscribers).toHaveBeenCalledWith("/admin/newsletter", {
      query: { limit: 50, offset: 50 },
    })
  })

  it("uses the dashboard's session defaults and propagates errors", async () => {
    Object.assign(globalThis, {
      __BACKEND_URL__: undefined,
      __AUTH_TYPE__: undefined,
      __JWT_TOKEN_STORAGE_KEY__: undefined,
    })
    fetchSubscribers.mockRejectedValue(new Error("Unauthorized"))
    const { getSubscribers } = require("../newsletter")
    await expect(getSubscribers(0)).rejects.toThrow("Unauthorized")
    expect(createSdk).toHaveBeenCalledWith({
      baseUrl: "/",
      auth: { type: "session", jwtTokenStorageKey: undefined },
    })
  })
})
