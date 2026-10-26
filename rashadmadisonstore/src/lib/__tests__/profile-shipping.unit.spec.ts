import { allocateProfileShipping, getProfileRate, getProfileShippingQuote, PROFILE_RATES } from "../profile-shipping"

describe("Automatic profile shipping", () => {
  const item = (profileId: string, rate: number, quantity = 1, id = profileId) => ({
    id, profileId, rate, quantity,
  })

  it("uses the seven approved base rates in USD cents", () => {
    expect(PROFILE_RATES).toEqual({
      "Risograph print": 950,
      "Risograph Print tabloid": 950,
      "ScreenPrint stretched": 2200,
      "ScreenPrint framed": 2650,
      "Risograph Print Framed": 1400,
      "Small Bag": 625,
      bag: 575,
    })
  })

  it("sorts by shipping rate rather than input order", () => {
    expect(allocateProfileShipping([
      item("apparel", 625), item("frame", 2650), item("tube", 950),
    ])).toEqual({ frame: 2650, tube: 475, apparel: 0 })
  })

  it("recognizes profile names with trailing whitespace and case variations", () => {
    expect(getProfileRate("Risograph Print tabloid ")).toBe(950)
    expect(getProfileRate("small  bag")).toBe(625)
    expect(getProfileRate("Unknown")).toBeUndefined()
  })

  it("counts copies separately and repeats after the third item", () => {
    expect(allocateProfileShipping([item("tube", 950, 3)])).toEqual({ tube: 1425 })
    expect(allocateProfileShipping([item("tube", 950, 6)])).toEqual({ tube: 2850 })
    expect(allocateProfileShipping([item("tube", 950, 4)])).toEqual({ tube: 2375 })
  })

  it("carries the pattern across profiles and rounds half cents up", () => {
    expect(allocateProfileShipping([
      item("frame", 2650), item("apparel", 625, 4), item("parcel", 575),
    ])).toEqual({ frame: 2650, apparel: 1251, parcel: 0 })
  })

  it("matches a per-copy calculation across group boundaries", () => {
    for (let first = 1; first <= 6; first++) {
      for (let second = 1; second <= 8; second++) {
        const units = [
          ...Array(first).fill({ profile: "a", rate: 950 }),
          ...Array(second).fill({ profile: "b", rate: 625 }),
        ]
        const expected: Record<string, number> = {}
        units.forEach((unit, index) => {
          expected[unit.profile] = (expected[unit.profile] ?? 0) +
            Math.round(unit.rate * [1, 0.5, 0][index % 3])
        })
        expect(allocateProfileShipping([item("a", 950, first), item("b", 625, second)]))
          .toEqual(expected)
      }
    }
  })

  it("uses stable ordering when profile rates tie", () => {
    const items = [item("a", 950, 2), item("b", 950, 2)]
    expect(allocateProfileShipping(items)).toEqual(allocateProfileShipping([...items].reverse()))
  })

  it("rejects invalid rates and quantities", () => {
    expect(() => allocateProfileShipping([item("a", -1)])).toThrow()
    expect(() => allocateProfileShipping([item("a", 950, 1.5)])).toThrow()
  })

  const cart = (postal_code: string, profileName = "Risograph print") => ({
    id: "cart_1", currency_code: "usd", completed_at: null,
    shipping_address: { country_code: "us", province: postal_code === "60614" ? "IL" : "NY", postal_code },
    items: [{
      id: "item_1", requires_shipping: true, quantity: 3,
      variant: { product: { shipping_profile: { id: "profile_1", name: profileName } } },
    }],
    shipping_methods: [],
  })

  it("makes every profile free for an eligible Chicago ZIP", async () => {
    const query = { graph: jest.fn().mockResolvedValue({ data: [cart("60614")] }) }
    await expect(getProfileShippingQuote(query, "cart_1")).resolves.toMatchObject({
      charges: { profile_1: 0 }, local: true,
    })
  })

  it("charges for a nonlocal address and fails explicitly for unknown profiles", async () => {
    const query = { graph: jest.fn().mockResolvedValue({ data: [cart("10001")] }) }
    await expect(getProfileShippingQuote(query, "cart_1")).resolves.toMatchObject({
      charges: { profile_1: 1425 }, local: false,
    })
    query.graph.mockResolvedValue({ data: [cart("10001", "Unconfigured")] })
    await expect(getProfileShippingQuote(query, "cart_1")).rejects.toThrow("no configured")
  })
})
