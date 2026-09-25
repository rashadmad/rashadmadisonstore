import { sendGAEvent } from "./gtag"

describe("sendGAEvent", () => {
  afterEach(() => {
    delete (window as Window & { gtag?: unknown }).gtag
  })

  it("sends an event to Google Analytics when gtag is available", () => {
    const gtag = jest.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag

    sendGAEvent("view_item", { value: 25, currency: "USD" })

    expect(gtag).toHaveBeenCalledWith("event", "view_item", {
      value: 25,
      currency: "USD",
    })
  })

  it("does nothing when gtag is unavailable", () => {
    expect(() => sendGAEvent("view_item")).not.toThrow()
  })
})
