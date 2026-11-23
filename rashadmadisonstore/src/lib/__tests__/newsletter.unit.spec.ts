import {
  createUnsubscribeToken,
  setNewsletterFlag,
  verifyUnsubscribeToken,
} from "../newsletter"

describe("unsubscribe token", () => {
  const secret = "test-secret"

  it("round-trips and normalizes the email", () => {
    const token = createUnsubscribeToken("Fan@Example.com", secret)
    expect(verifyUnsubscribeToken(token, secret)).toBe("fan@example.com")
  })

  it("rejects wrong secret, tampering and junk", () => {
    const token = createUnsubscribeToken("a@b.co", secret)
    expect(verifyUnsubscribeToken(token, "other")).toBeNull()
    const [, sig] = token.split(".")
    const forged = `${Buffer.from("x@y.co").toString("base64url")}.${sig}`
    expect(verifyUnsubscribeToken(forged, secret)).toBeNull()
    expect(verifyUnsubscribeToken("nope", secret)).toBeNull()
    expect(verifyUnsubscribeToken(undefined, secret)).toBeNull()
  })
})

describe("setNewsletterFlag", () => {
  const make = (customers: any[]) => ({
    listCustomers: jest.fn().mockResolvedValue(customers),
    createCustomers: jest.fn(),
    updateCustomers: jest.fn(),
  })

  it("creates a customer when subscribing an unknown email", async () => {
    const svc = make([])
    await setNewsletterFlag(svc as any, "a@b.co", true)
    expect(svc.createCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.co", metadata: expect.objectContaining({ newsletter: true }) })
    )
  })

  it("unsubscribe is idempotent and creates nothing for unknown emails", async () => {
    expect(await setNewsletterFlag(make([]) as any, "a@b.co", false)).toBe(0)
    const svc = make([{ id: "c1", metadata: { newsletter: false } }])
    await setNewsletterFlag(svc as any, "a@b.co", false)
    expect(svc.updateCustomers).not.toHaveBeenCalled()
    const svc2 = make([{ id: "c2", metadata: { newsletter: true, keep: 1 } }])
    await setNewsletterFlag(svc2 as any, "a@b.co", false)
    expect(svc2.updateCustomers).toHaveBeenCalledWith(
      "c2",
      expect.objectContaining({ metadata: expect.objectContaining({ newsletter: false, keep: 1 }) })
    )
  })
})
