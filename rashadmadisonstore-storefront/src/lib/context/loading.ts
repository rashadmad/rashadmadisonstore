"use client"

import { createContext } from "react"

export const RouteLoadingContext = createContext<{
  register: (id: string) => () => void
  activeId?: string
  visible: boolean
} | null>(null)
