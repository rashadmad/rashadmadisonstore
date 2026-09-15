import React from "react"
import { render, screen } from "@testing-library/react"
import OptionSelect from "../components/product-actions/option-select"
import MobileActions from "../components/product-actions/mobile-actions"

jest.mock("next/navigation", () => ({
  useParams: () => ({ countryCode: "us" }),
  usePathname: () => "/products/test",
  useSearchParams: () => new URLSearchParams(),
}))

describe("OptionSelect", () => {
  it("displays the option title and currently selected color/option value in the title label", () => {
    const option = {
      id: "opt_color",
      title: "Color",
      values: [{ id: "v1", value: "Black" }, { id: "v2", value: "White" }],
    } as any

    render(
      <OptionSelect
        option={option}
        current="Black"
        updateOption={() => {}}
        title="Color"
        disabled={false}
      />
    )

    expect(screen.getByText("Color: Black")).toBeInTheDocument()
  })
})

describe("MobileActions", () => {
  it("displays the selected color on the mobile action button and uses styled primary add to cart button", () => {
    const product = {
      id: "prod_1",
      title: "Test Shirt",
      options: [
        {
          id: "opt_color",
          title: "Color",
          values: [
            { id: "v1", value: "Black" },
            { id: "v2", value: "White" },
          ],
        },
      ],
      variants: [
        { id: "var_1", options: [{ option_id: "opt_color", value: "Black" }] },
      ],
    } as any

    render(
      <MobileActions
        product={product}
        variant={product.variants[0]}
        options={{ opt_color: "Black" }}
        updateOptions={() => {}}
        inStock={true}
        handleAddToCart={() => {}}
        show={true}
        optionsDisabled={false}
      />
    )

    expect(screen.getByTestId("mobile-actions-button")).toHaveTextContent("Black")

    const cartBtn = screen.getByTestId("mobile-cart-button")
    expect(cartBtn).toHaveClass("bg-green-600")
    expect(cartBtn).toHaveClass("border-green-800")
  })
})
