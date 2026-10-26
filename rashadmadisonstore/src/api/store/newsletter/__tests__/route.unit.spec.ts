import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { POST } from "../route"

const signup = {
  email: " PERSON@Example.com ",
  firstName: " First  Name ",
  lastName: " Last ",
  consent: true,
}

describe("Newsletter signup", () => {
  const service = {
    listSubscribers: jest.fn(),
    createSubscribers: jest.fn(),
  }
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }
  const request = (body: unknown) => ({
    body, scope: { resolve: jest.fn().mockReturnValue(service) },
  } as MedusaRequest)
  const response = res as MedusaResponse

  beforeEach(() => {
    jest.clearAllMocks()
    service.listSubscribers.mockReset().mockResolvedValue([])
    service.createSubscribers.mockReset().mockResolvedValue({ id: "sub_test" })
  })

  it("persists normalized names, lowercase email, and explicit consent date", async () => {
    await POST(request(signup), response)
    expect(service.listSubscribers).toHaveBeenCalledWith({ email: "person@example.com" })
    expect(service.createSubscribers).toHaveBeenCalledWith({
      email: "person@example.com", first_name: "First Name", last_name: "Last",
      status: "subscribed", source: "the-quintessential-storefront",
      consented_at: expect.any(Date),
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it.each([
    null, [], "invalid",
    { ...signup, firstName: " " },
    { ...signup, lastName: "" },
    { ...signup, firstName: "a".repeat(81) },
    { ...signup, lastName: "a".repeat(81) },
    { ...signup, email: "invalid" },
    { ...signup, email: `${"a".repeat(250)}@example.com` },
    { ...signup, consent: false },
    { ...signup, consent: undefined },
    { ...signup, consent: "true" },
  ])("rejects invalid signup data %# without writing", async (body) => {
    await expect(POST(request(body), response)).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
    })
    expect(service.createSubscribers).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it.each(["subscribed", "unsubscribed"])(
    "returns generic success without overwriting an existing %s record",
    async (status) => {
      service.listSubscribers.mockResolvedValue([{ id: "sub_existing", status }])
      await POST(request(signup), response)
      expect(service.createSubscribers).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ ok: true })
    }
  )

  it.each([MedusaError.Types.DUPLICATE_ERROR, MedusaError.Types.INVALID_DATA])(
    "handles a concurrent duplicate reported as %s only if the subscriber now exists", async (type) => {
    service.listSubscribers.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "sub_other" }])
    service.createSubscribers.mockRejectedValue(
      new MedusaError(type, "Duplicate email")
    )
    await POST(request(signup), response)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    }
  )

  it("does not report success for an unresolved duplicate", async () => {
    const error = new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "Duplicate")
    service.createSubscribers.mockRejectedValue(error)
    await expect(POST(request(signup), response)).rejects.toBe(error)
    expect(res.json).not.toHaveBeenCalled()
  })

  it("propagates database failures rather than reporting success", async () => {
    const error = new Error("Database unavailable")
    service.createSubscribers.mockRejectedValue(error)
    await expect(POST(request(signup), response)).rejects.toBe(error)
    expect(res.json).not.toHaveBeenCalled()
  })
})
