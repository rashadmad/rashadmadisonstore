import React from "react"
import { render, screen } from "@testing-library/react"
import ShippingAddress from "../components/shipping-address"

describe("ShippingAddress", () => {
  it("shows the United States shipping notice in a light font", () => {
    render(
      <ShippingAddress
        customer={null}
        cart={null}
        checked
        onChange={() => {}}
      />
    )

    const notice = screen.getByText(
      "As of now we are only shipping within the United States."
    )

    expect(notice).toHaveClass("font-light")
    expect(screen.getByTestId("shipping-address-input")).toBeInTheDocument()
  })
})
