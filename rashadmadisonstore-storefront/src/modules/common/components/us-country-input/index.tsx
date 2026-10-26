const USCountryInput = ({
  name,
  "data-testid": testId,
}: {
  name: string
  "data-testid"?: string
}) => {
  // TODO: Add the country selector when the site goes live outside the United States.
  return <input type="hidden" name={name} value="us" data-testid={testId} />
}

export default USCountryInput
