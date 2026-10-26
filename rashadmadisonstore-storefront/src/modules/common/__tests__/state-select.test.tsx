import { fireEvent, render, screen } from "@testing-library/react"
import StateSelect from "../components/state-select"

describe("StateSelect", () => {
  it("offers all 50 states, DC, and five US territories", () => {
    render(<StateSelect name="province" required />)

    expect(screen.getByRole("combobox", { name: "State" })).toHaveValue("")
    expect(screen.getAllByRole("option")).toHaveLength(57)
    for (const [name, code] of [
      ["Alabama", "AL"],
      ["Illinois", "IL"],
      ["Wyoming", "WY"],
      ["District of Columbia", "DC"],
      ["American Samoa", "AS"],
      ["Guam", "GU"],
      ["Northern Mariana Islands", "MP"],
      ["Puerto Rico", "PR"],
      ["US Virgin Islands", "VI"],
    ]) {
      expect(screen.getByRole("option", { name })).toHaveValue(code)
    }
  })

  it.each(["il", "Illinois", "US-IL"])(
    "recognizes the saved state %s",
    (defaultValue) => {
      render(<StateSelect name="province" defaultValue={defaultValue} />)
      expect(screen.getByRole("combobox")).toHaveValue("IL")
    }
  )

  it("submits the abbreviation and allows an optional selection to be cleared", () => {
    render(
      <form data-testid="address-form">
        <StateSelect name="shipping_address.province" />
      </form>
    )
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "IL" } })
    const form = screen.getByTestId("address-form") as HTMLFormElement
    expect(new FormData(form).get("shipping_address.province")).toBe("IL")
    fireEvent.change(select, { target: { value: "" } })
    expect(select).toHaveValue("")
  })

  it("updates a controlled selection when a saved address changes", () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <StateSelect value="Illinois" onChange={onChange} />
    )
    expect(screen.getByRole("combobox")).toHaveValue("IL")
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "CA" },
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    rerender(<StateSelect value="CA" onChange={onChange} />)
    expect(screen.getByRole("combobox")).toHaveValue("CA")
  })

  it("preserves an unrecognized saved province instead of silently changing it", () => {
    render(<StateSelect defaultValue="Ontario" />)
    expect(screen.getByRole("combobox")).toHaveValue("Ontario")
  })
})
