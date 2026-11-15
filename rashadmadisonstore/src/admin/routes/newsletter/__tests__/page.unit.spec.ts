/**
 * @jest-environment jsdom
 */
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import NewsletterPage, { config } from "../page"
import { getSubscribers, SubscriberPage } from "../../../lib/newsletter"

jest.mock("../../../lib/newsletter", () => ({
  PAGE_SIZE: 50,
  getSubscribers: jest.fn(),
}))

const getSubscribersMock = getSubscribers as jest.MockedFunction<typeof getSubscribers>
const firstPage: SubscriberPage = {
  subscribers: [{
    id: "sub_1",
    first_name: "Test",
    last_name: "Person",
    email: "test@example.com",
    status: "subscribed",
    source: "storefront",
    consented_at: "2026-01-01T12:00:00Z",
    created_at: "2026-01-01T12:00:00Z",
  }],
  count: 51,
  offset: 0,
  limit: 50,
}

describe("Newsletter admin page", () => {
  beforeEach(() => {
    getSubscribersMock.mockReset()
  })

  it("shows loading and empty states", async () => {
    getSubscribersMock.mockResolvedValue({ subscribers: [], count: 0, offset: 0, limit: 50 })
    render(React.createElement(NewsletterPage))
    expect(config.label).toBe("Newsletter")
    expect(screen.getByRole("status").textContent).toContain("Loading")
    expect((await screen.findByText("No newsletter signups yet.")).textContent).toBeTruthy()
    expect(getSubscribersMock).toHaveBeenCalledWith(0)
  })

  it("shows subscriber details and navigates between pages", async () => {
    getSubscribersMock
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce({
        ...firstPage,
        subscribers: [{ ...firstPage.subscribers[0], id: "sub_2", email: "other@example.com", status: "unsubscribed" }],
        offset: 50,
      })
      .mockResolvedValueOnce(firstPage)
    render(React.createElement(NewsletterPage))
    expect((await screen.findByText("test@example.com")).textContent).toBe("test@example.com")
    expect(screen.getByText("Test Person").textContent).toBe("Test Person")
    expect(screen.getByText("Subscribed").textContent).toBe("Subscribed")
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect((await screen.findByText("other@example.com")).textContent).toBe("other@example.com")
    expect(screen.getByText("Unsubscribed").textContent).toBe("Unsubscribed")
    expect(getSubscribersMock).toHaveBeenLastCalledWith(50)
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Previous" }))
    await screen.findByText("test@example.com")
    expect(getSubscribersMock).toHaveBeenLastCalledWith(0)
  })

  it("reports a request failure and retries", async () => {
    getSubscribersMock.mockRejectedValueOnce(new Error("Unauthorized")).mockResolvedValueOnce(firstPage)
    render(React.createElement(NewsletterPage))
    expect((await screen.findByRole("alert")).textContent).toContain("Unauthorized")
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
    expect((await screen.findByText("test@example.com")).textContent).toBe("test@example.com")
  })
})
