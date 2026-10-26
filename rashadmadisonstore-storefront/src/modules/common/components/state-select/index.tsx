import { forwardRef } from "react"
import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"

const states = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
  ["AS", "American Samoa"],
  ["GU", "Guam"],
  ["MP", "Northern Mariana Islands"],
  ["PR", "Puerto Rico"],
  ["VI", "US Virgin Islands"],
] as const

function normalizeState(value: NativeSelectProps["value"]) {
  if (typeof value !== "string") {
    return value
  }

  const normalized = value.trim().toLowerCase().replace(/^us-/, "")
  return states.find(
    ([code, name]) =>
      code.toLowerCase() === normalized || name.toLowerCase() === normalized
  )?.[0] ?? value
}

const StateSelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & { label?: string }
>(({ label = "State", value, defaultValue, ...props }, ref) => {
  const selected = normalizeState(value ?? defaultValue)
  const legacyValue =
    typeof selected === "string" &&
    selected !== "" &&
    !states.some(([code]) => code === selected)
      ? selected
      : null

  return (
    <NativeSelect
      ref={ref}
      aria-label={label}
      placeholder={label}
      autoComplete="address-level1"
      {...props}
      value={value === undefined ? undefined : selected}
      defaultValue={value === undefined ? selected ?? "" : undefined}
    >
      {!props.required && <option value="">No state selected</option>}
      {legacyValue && <option value={legacyValue}>{legacyValue}</option>}
      {states.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </NativeSelect>
  )
})

StateSelect.displayName = "StateSelect"

export default StateSelect
