import { isChicagoAreaAddress } from "../chicago-shipping"

describe("Chicago-area free shipping", () => {
  it.each([
    ["Chicago", "60615"],
    ["Cook", "60302"],
    ["DuPage", "60187"],
    ["Kane", "60134"],
    ["Lake", "60085"],
    ["McHenry", "60098"],
    ["Will", "60435"],
    ["ZIP+4", "60615-1234"],
  ])("includes %s", (_, postal_code) => {
    expect(
      isChicagoAreaAddress({ country_code: "us", province: "il", postal_code })
    ).toBe(true)
  })

  it.each(["il", "IL", "Illinois", " US-IL ", undefined, null, ""])(
    "accepts Illinois representations or an omitted state: %s",
    (province) => {
      expect(
        isChicagoAreaAddress({
          country_code: " US ",
          province,
          postal_code: " 60615-1234 ",
        })
      ).toBe(true)
    }
  )

  it.each([
    ["DeKalb", "60115"],
    ["Kendall", "60560"],
    ["Kankakee", "60901"],
    ["Boone", "61008"],
    ["Grundy", "60450"],
    ["Rockford", "61101"],
    ["Springfield", "62701"],
    ["Indiana", "46320"],
    ["Wisconsin", "53140"],
    ["Unassigned Chicago-like ZIP", "60600"],
    ["Unassigned suburban-like ZIP", "60003"],
  ])("excludes %s", (_, postal_code) => {
    expect(
      isChicagoAreaAddress({ country_code: "us", province: "il", postal_code })
    ).toBe(false)
  })

  it.each(["", "606", "606150", "60615oops", "60615-123", "60615-12345"])(
    "rejects malformed ZIP %s",
    (postal_code) => {
      expect(isChicagoAreaAddress({ country_code: "us", postal_code })).toBe(
        false
      )
    }
  )

  it("does not accept a conflicting state or country even with a local ZIP", () => {
    expect(
      isChicagoAreaAddress({
        country_code: "us",
        province: "in",
        postal_code: "60615",
      })
    ).toBe(false)
    expect(
      isChicagoAreaAddress({ country_code: "ca", postal_code: "60615" })
    ).toBe(false)
  })

  it("does not qualify missing addresses, countries, or ZIPs", () => {
    expect(isChicagoAreaAddress()).toBe(false)
    expect(isChicagoAreaAddress(null)).toBe(false)
    expect(isChicagoAreaAddress({ postal_code: "60615" })).toBe(false)
    expect(isChicagoAreaAddress({ country_code: "us" })).toBe(false)
  })
})
