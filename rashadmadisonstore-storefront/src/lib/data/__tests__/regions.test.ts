import { getRegion, retrieveRegion } from "../regions"
import { sdk } from "@lib/config"

jest.mock("@lib/config", () => ({
  sdk: { client: { fetch: jest.fn() } },
}))

const fetchRegion = jest.mocked(sdk.client.fetch)

describe("region requests", () => {
  beforeEach(() => {
    fetchRegion.mockReset()
  })

  it("requests fresh regions so a newly configured region becomes available", async () => {
    const region = {
      id: "reg-us", name: "Chicago", currency_code: "usd",
      countries: [{ iso_2: "us" }],
    }
    fetchRegion.mockResolvedValueOnce({ regions: [] }).mockResolvedValueOnce({ regions: [region] })

    expect(await getRegion("us")).toBeNull()
    expect(await getRegion("us")).toEqual(region)
    expect(fetchRegion).toHaveBeenCalledTimes(2)
    expect(fetchRegion).toHaveBeenCalledWith("/store/regions", {
      method: "GET", cache: "no-store",
    })
  })

  it("requests individual regions without a stale cache", async () => {
    fetchRegion.mockResolvedValueOnce({ region: { id: "reg-us" } })

    expect(await retrieveRegion("reg-us")).toEqual({ id: "reg-us" })
    expect(fetchRegion).toHaveBeenCalledWith("/store/regions/reg-us", {
      method: "GET", cache: "no-store",
    })
  })
})
