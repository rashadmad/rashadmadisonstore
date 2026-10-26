import "@testing-library/jest-dom"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import Shipping from "../components/shipping"
import { applyAutomaticShipping } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"

jest.mock("@lib/data/fulfillment", () => ({ applyAutomaticShipping: jest.fn() }))
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("step=delivery"),
  usePathname: () => "/us/checkout",
}))
const push = jest.fn()
jest.mock("@lib/context/navigation", () => ({ useRouter: () => ({ push }) }))

const apply = jest.mocked(applyAutomaticShipping)
const cart = {
  id: "cart_1", currency_code: "usd", items: [], shipping_methods: [],
} as HttpTypes.StoreCart

describe("Automatic shipping checkout", () => {
  beforeEach(() => jest.clearAllMocks())

  it("applies shipping automatically and displays its cost without choices", async () => {
    apply.mockResolvedValue({ amount: 14.25, local: false })
    render(<Shipping cart={cart} />)
    await screen.findByText("USPS Shipping: $14.25")
    expect(apply).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("radio")).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId("submit-delivery-option-button"))
    expect(push).toHaveBeenCalledWith("/us/checkout?step=payment", { scroll: false })
  })

  it("shows eligible local shipping as free", async () => {
    apply.mockResolvedValue({ amount: 0, local: true })
    render(<Shipping cart={cart} />)
    await screen.findByText("Free Chicago-area shipping: $0.00")
  })

  it("blocks payment while calculating", () => {
    apply.mockReturnValue(new Promise(() => {}))
    render(<Shipping cart={cart} />)
    expect(screen.getByTestId("submit-delivery-option-button")).toBeDisabled()
    expect(screen.getByText("Calculating shipping...")).toBeInTheDocument()
  })

  it("shows failures and supports retry rather than treating them as free shipping", async () => {
    apply.mockRejectedValueOnce(new Error("Rate not configured"))
      .mockResolvedValueOnce({ amount: 9.5, local: false })
    render(<Shipping cart={cart} />)
    await screen.findByText("Rate not configured")
    expect(screen.getByTestId("submit-delivery-option-button")).toBeDisabled()
    fireEvent.click(screen.getByText("Retry shipping calculation"))
    await screen.findByText("USPS Shipping: $9.50")
    await waitFor(() => expect(screen.getByTestId("submit-delivery-option-button")).toBeEnabled())
  })
})
