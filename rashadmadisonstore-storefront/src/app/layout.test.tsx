import { render, screen } from "@testing-library/react"

import RootLayout from "./layout"

jest.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}))

describe("RootLayout", () => {
  const originalMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  afterEach(() => {
    if (originalMeasurementId === undefined) {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    } else {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalMeasurementId
    }
  })

  it("renders Google Analytics with the configured measurement ID", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123"

    render(
      <RootLayout>
        <div>Page content</div>
      </RootLayout>
    )

    expect(screen.getByText("Page content")).toBeInTheDocument()
    expect(screen.getByTestId("google-analytics")).toHaveAttribute(
      "data-ga-id",
      "G-TEST123"
    )
  })

  it("does not render Google Analytics without a measurement ID", () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    render(
      <RootLayout>
        <div>Page content</div>
      </RootLayout>
    )

    expect(screen.getByText("Page content")).toBeInTheDocument()
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument()
  })
})
