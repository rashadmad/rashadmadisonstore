import { fetchRegionsFromBackend } from "../middleware"

describe("fetchRegionsFromBackend", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("returns an empty array when the regions request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network unavailable")) as typeof fetch

    const regions = await fetchRegionsFromBackend("http://localhost:9000", "test-key")

    expect(regions).toEqual([])
  })

  it("returns the parsed regions from the backend response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        regions: [
          {
            id: "reg_1",
            name: "US",
            countries: [{ iso_2: "us" }],
          },
        ],
      }),
    } as Response) as typeof fetch

    const regions = await fetchRegionsFromBackend("http://localhost:9000", "test-key")

    expect(regions).toHaveLength(1)
    expect(regions[0].id).toBe("reg_1")
  })
})
