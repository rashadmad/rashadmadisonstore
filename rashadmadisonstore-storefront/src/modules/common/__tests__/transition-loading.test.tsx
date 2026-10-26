import { act, render, screen } from "@testing-library/react"
import { LoadingIndicator as TransitionLoading } from "../components/transition-loading"

describe("Delayed transition loading", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it("does not display before two seconds and displays at the threshold", () => {
    render(<TransitionLoading />)
    act(() => jest.advanceTimersByTime(1999))
    expect(screen.queryByRole("status")).toBeNull()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByRole("status", { name: "Loading page" })).toBeTruthy()
  })

  it("does not flash loading for fast transitions", () => {
    const { rerender } = render(<TransitionLoading pending />)
    act(() => jest.advanceTimersByTime(1999))
    rerender(<TransitionLoading pending={false} />)
    act(() => jest.advanceTimersByTime(5000))
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("hides on completion and waits two seconds again for the next transition", () => {
    const { rerender } = render(<TransitionLoading pending />)
    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByRole("status")).toBeTruthy()
    rerender(<TransitionLoading pending={false} />)
    expect(screen.queryByRole("status")).toBeNull()
    rerender(<TransitionLoading pending label="Loading cart" />)
    act(() => jest.advanceTimersByTime(1999))
    expect(screen.queryByRole("status")).toBeNull()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByRole("status", { name: "Loading cart" })).toBeTruthy()
  })

  it("cleans up the delay when a route fallback unmounts", () => {
    const { unmount } = render(<TransitionLoading />)
    expect(jest.getTimerCount()).toBe(1)
    unmount()
    expect(jest.getTimerCount()).toBe(0)
  })
})
