import React from "react"
import { render, screen } from "@testing-library/react"
import AddressSelect from "../components/address-select"

describe("AddressSelect", () => {
  const addresses = [
    {
      id: "addr_1",
      first_name: "Rashad",
      last_name: "Madison",
      address_1: "123 Main St",
      city: "Chicago",
      postal_code: "60601",
      country_code: "us",
    },
    {
      id: "addr_2",
      first_name: "Rashad",
      last_name: "Madison",
      address_1: "456 Oak Ave",
      city: "Chicago",
      postal_code: "60602",
      country_code: "us",
    },
  ] as any

  it("renders address select button with choose address text", () => {
    render(
      <AddressSelect
        addresses={addresses}
        addressInput={null}
        onSelect={() => {}}
      />
    )

    expect(screen.getByTestId("shipping-address-select")).toBeInTheDocument()
    expect(screen.getByText("Choose an address")).toBeInTheDocument()
  })

  it("renders the selected address when addressInput matches", () => {
    render(
      <AddressSelect
        addresses={addresses}
        addressInput={addresses[0]}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText("123 Main St")).toBeInTheDocument()
  })
})
