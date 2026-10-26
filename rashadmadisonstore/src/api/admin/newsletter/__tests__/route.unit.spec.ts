import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { GET } from "../route"

describe("Admin newsletter listing", () => {
  const listAndCountSubscribers = jest.fn()
  const res = { json: jest.fn() }
  const request = (query: Record<string, string>) => ({
    query,
    scope: { resolve: jest.fn().mockReturnValue({ listAndCountSubscribers }) },
  } as MedusaRequest)

  beforeEach(() => {
    jest.clearAllMocks()
    listAndCountSubscribers.mockResolvedValue([[], 0])
  })

  it("returns a bounded default page", async () => {
    await GET(request({}), res as MedusaResponse)
    expect(listAndCountSubscribers).toHaveBeenCalledWith(
      {}, { skip: 0, take: 50, order: { created_at: "DESC" } }
    )
    expect(res.json).toHaveBeenCalledWith({ subscribers: [], count: 0, offset: 0, limit: 50 })
  })

  it("accepts valid pagination", async () => {
    await GET(request({ offset: "100", limit: "25" }), res as MedusaResponse)
    expect(listAndCountSubscribers).toHaveBeenCalledWith(
      {}, { skip: 100, take: 25, order: { created_at: "DESC" } }
    )
  })

  it.each([
    { offset: "-1" }, { offset: "1.5" }, { limit: "0" },
    { limit: "101" }, { limit: "invalid" },
  ])("rejects invalid pagination %j", async (query) => {
    await expect(GET(request(query), res as MedusaResponse)).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
    })
    expect(listAndCountSubscribers).not.toHaveBeenCalled()
  })
})
