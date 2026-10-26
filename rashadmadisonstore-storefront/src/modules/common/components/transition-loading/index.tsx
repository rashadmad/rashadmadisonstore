"use client"

import { useContext, useEffect, useId, useState } from "react"
import { RouteLoadingContext } from "@lib/context/loading"

export function useLoadingDelay(pending: boolean) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!pending) {
      setVisible(false)
      return
    }

    const timeout = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timeout)
  }, [pending])

  return pending && visible
}

export function LoadingScreen({
  label = "Loading page",
  variant = "page",
}: {
  label?: string
  variant?: "page" | "navigation"
}) {
  if (variant === "navigation") {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[90]"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div
          className="h-1 bg-green-600 motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <div
      className="w-full bg-white"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="gallery-loading-screen">
        <div className="gallery-loading-shell">
          <div className="gallery-loading-icon-wrap" aria-hidden="true">
            <img
              src="/images/loadingicon.svg"
              alt=""
              className="gallery-loading-icon"
            />
            <span className="gallery-loading-gradient" />
          </div>
          <p className="gallery-loading-label">{label}</p>
          <div className="gallery-loading-bar-track" aria-hidden="true">
            <span className="gallery-loading-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingIndicator({
  pending = true,
  label,
  variant,
}: {
  pending?: boolean
  label?: string
  variant?: "page" | "navigation"
}) {
  const visible = useLoadingDelay(pending)
  return visible ? <LoadingScreen label={label} variant={variant} /> : null
}

export default function TransitionLoading({
  label = "Loading page",
}: {
  label?: string
}) {
  const context = useContext(RouteLoadingContext)
  const register = context?.register
  const id = useId()

  useEffect(() => register?.(id), [register, id])

  if (!context) return <LoadingIndicator label={label} />
  return context.visible && context.activeId === id ? (
    <LoadingScreen label={label} />
  ) : null
}
