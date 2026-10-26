import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import USCountryInput from "../components/us-country-input"

describe("USCountryInput", () => {
  it.each(["shipping_address.country_code", "billing_address.country_code", "country_code"])(
    "submits US without displaying a country field for %s",
    (name) => {
      render(
        <form data-testid="address-form">
          <USCountryInput name={name} data-testid="country-input" />
        </form>
      )

      expect(screen.getByTestId("country-input")).not.toBeVisible()
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
      const form = screen.getByTestId("address-form") as HTMLFormElement
      expect(new FormData(form).get(name)).toBe("us")
    }
  )
})
