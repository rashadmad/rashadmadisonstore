"use client"

import { useRouter as useNextRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react"
import {
  LoadingScreen,
  useLoadingDelay,
} from "@modules/common/components/transition-loading"
import { RouteLoadingContext } from "./loading"

type Router = ReturnType<typeof useNextRouter>

export const NavigationContext = createContext<Router | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useNextRouter()
  const [pending, startTransition] = useTransition()
  const [fallbacks, setFallbacks] = useState<Set<string>>(() => new Set())
  const registerFallback = useCallback((id: string) => {
    setFallbacks((current) => new Set(current).add(id))
    return () =>
      setFallbacks((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
  }, [])
  const visible = useLoadingDelay(pending || fallbacks.size > 0)
  const loadingContext = useMemo(
    () => ({
      register: registerFallback,
      activeId: fallbacks.values().next().value,
      visible,
    }),
    [registerFallback, fallbacks, visible]
  )
  const trackedRouter = useMemo<Router>(
    () => ({
      ...router,
      push: (...args) => startTransition(() => router.push(...args)),
      replace: (...args) => startTransition(() => router.replace(...args)),
      refresh: () => startTransition(() => router.refresh()),
      back: () => startTransition(() => router.back()),
      forward: () => startTransition(() => router.forward()),
    }),
    [router]
  )

  return (
    <NavigationContext.Provider value={trackedRouter}>
      <RouteLoadingContext.Provider value={loadingContext}>
        {children}
        {visible && !fallbacks.size && <LoadingScreen variant="navigation" />}
      </RouteLoadingContext.Provider>
    </NavigationContext.Provider>
  )
}

export function useRouter(): Router {
  const router = useNextRouter()
  const trackedRouter = useContext(NavigationContext)
  return trackedRouter ?? router
}
