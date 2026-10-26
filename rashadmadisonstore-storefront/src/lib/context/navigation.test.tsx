import { act, fireEvent, render, screen } from "@testing-library/react"
import { Component, ReactNode, Suspense, useState } from "react"
import { NavigationProvider, useRouter } from "./navigation"
import TransitionLoading from "@modules/common/components/transition-loading"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

import { useRouter as useNextRouter } from "next/navigation"

describe("Tracked navigation", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it.each(["push", "replace", "refresh", "back", "forward"] as const)(
    "shows delayed loading until a suspended %s transition commits",
    async (method) => {
      let completed = false
      let finish = () => {}
      const response = new Promise<void>((resolve) => {
        finish = () => {
          completed = true
          resolve()
        }
      })
      const router = {
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
      }
      jest.mocked(useNextRouter).mockReturnValue(router)

      function Destination() {
        if (!completed) throw response
        return <p>Destination ready</p>
      }

      function Page() {
        const [navigating, setNavigating] = useState(false)
        const trackedRouter = useRouter()
        router[method].mockImplementation(() => setNavigating(true))
        return (
          <>
            <button
              onClick={() => {
                if (
                  method === "refresh" ||
                  method === "back" ||
                  method === "forward"
                )
                  trackedRouter[method]()
                else
                  trackedRouter[method]("/us/checkout?step=payment", {
                    scroll: false,
                  })
              }}
            >
              Navigate
            </button>
            {navigating ? <Destination /> : <p>Current page</p>}
          </>
        )
      }

      render(
        <Suspense fallback={<p>Route fallback</p>}>
          <NavigationProvider>
            <Page />
          </NavigationProvider>
        </Suspense>
      )
      fireEvent.click(screen.getByText("Navigate"))
      act(() => jest.advanceTimersByTime(1999))
      expect(screen.queryByRole("status")).toBeNull()
      act(() => jest.advanceTimersByTime(1))
      expect(screen.getByRole("status")).toBeTruthy()
      expect(screen.getByRole("status").className).toContain(
        "pointer-events-none"
      )
      expect(screen.getByText("Current page")).toBeTruthy()
      screen.getByText("Navigate").focus()
      expect(document.activeElement).toBe(screen.getByText("Navigate"))
      if (method === "push" || method === "replace") {
        expect(router[method]).toHaveBeenCalledWith(
          "/us/checkout?step=payment",
          { scroll: false }
        )
      }
      await act(async () => finish())
      expect(screen.queryByRole("status")).toBeNull()
      expect(screen.getByText("Destination ready")).toBeTruthy()
    }
  )

  it("coordinates nested route fallbacks with a single timer and status", () => {
    const { rerender } = render(
      <NavigationProvider>
        <TransitionLoading label="Loading cart" />
      </NavigationProvider>
    )
    act(() => jest.advanceTimersByTime(1500))
    rerender(
      <NavigationProvider>
        <TransitionLoading label="Loading cart" />
        <TransitionLoading label="Loading account" />
      </NavigationProvider>
    )
    act(() => jest.advanceTimersByTime(499))
    expect(screen.queryByRole("status")).toBeNull()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getAllByRole("status")).toHaveLength(1)
    expect(screen.getByRole("status").className).not.toContain("fixed")
    rerender(
      <NavigationProvider>
        <p>Ready</p>
      </NavigationProvider>
    )
    expect(screen.queryByRole("status")).toBeNull()
    expect(jest.getTimerCount()).toBe(0)
  })

  it("keeps the timer when navigation hands off to a route fallback", async () => {
    let finish = () => {}
    let ready = false
    const response = new Promise<void>((resolve) => {
      finish = () => {
        ready = true
        resolve()
      }
    })
    const router = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
    jest.mocked(useNextRouter).mockReturnValue(router)
    function Destination() {
      if (!ready) throw response
      return <p>Ready</p>
    }
    function Page() {
      const [navigating, setNavigating] = useState(false)
      const tracked = useRouter()
      router.push.mockImplementation(() => setNavigating(true))
      return (
        <>
          <button onClick={() => tracked.push("/us/cart")}>Go</button>
          {navigating && (
            <Suspense fallback={<TransitionLoading label="Loading cart" />}>
              <Destination />
            </Suspense>
          )}
        </>
      )
    }
    render(
      <NavigationProvider>
        <Page />
      </NavigationProvider>
    )
    fireEvent.click(screen.getByText("Go"))
    act(() => jest.advanceTimersByTime(1999))
    expect(screen.queryByRole("status")).toBeNull()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.getAllByRole("status")).toHaveLength(1)
    await act(async () => finish())
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("clears loading when a failed navigation renders an error boundary", async () => {
    class ErrorBoundary extends Component<
      { children: ReactNode },
      { failed: boolean }
    > {
      state = { failed: false }
      static getDerivedStateFromError() {
        return { failed: true }
      }
      render() {
        return this.state.failed ? (
          <p>Unable to load destination</p>
        ) : (
          this.props.children
        )
      }
    }
    let fail = () => {}
    let failed = false
    const response = new Promise<void>((resolve) => {
      fail = () => {
        failed = true
        resolve()
      }
    })
    const router = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
    jest.mocked(useNextRouter).mockReturnValue(router)
    function Destination(): ReactNode {
      if (!failed) throw response
      throw new Error("Destination unavailable")
    }
    function Page() {
      const [navigating, setNavigating] = useState(false)
      const tracked = useRouter()
      router.push.mockImplementation(() => setNavigating(true))
      return (
        <>
          <button onClick={() => tracked.push("/us/cart")}>Go</button>
          {navigating && <Destination />}
        </>
      )
    }
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {})
    try {
      render(
        <NavigationProvider>
          <ErrorBoundary>
            <Suspense fallback={<TransitionLoading />}>
              <Page />
            </Suspense>
          </ErrorBoundary>
        </NavigationProvider>
      )
      fireEvent.click(screen.getByText("Go"))
      act(() => jest.advanceTimersByTime(2000))
      expect(screen.getByRole("status")).toBeTruthy()
      await act(async () => fail())
      expect(screen.getByText("Unable to load destination")).toBeTruthy()
      expect(screen.queryByRole("status")).toBeNull()
    } finally {
      consoleError.mockRestore()
    }
  })

  it("cleans up an interrupted transition when its provider unmounts", () => {
    const { unmount } = render(
      <NavigationProvider>
        <TransitionLoading />
      </NavigationProvider>
    )
    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByRole("status")).toBeTruthy()
    unmount()
    expect(screen.queryByRole("status")).toBeNull()
    expect(jest.getTimerCount()).toBe(0)
  })

  it("does not restart the delay when one route fallback replaces another", () => {
    const { rerender } = render(
      <NavigationProvider>
        <TransitionLoading key="cart" label="Loading cart" />
      </NavigationProvider>
    )
    act(() => jest.advanceTimersByTime(1500))
    rerender(
      <NavigationProvider>
        <TransitionLoading key="account" label="Loading account" />
      </NavigationProvider>
    )
    act(() => jest.advanceTimersByTime(500))
    expect(screen.getAllByRole("status")).toHaveLength(1)
    expect(screen.getByRole("status", { name: "Loading account" })).toBeTruthy()
    rerender(
      <NavigationProvider>
        <p>Account ready</p>
      </NavigationProvider>
    )
    expect(screen.queryByRole("status")).toBeNull()
  })
})
