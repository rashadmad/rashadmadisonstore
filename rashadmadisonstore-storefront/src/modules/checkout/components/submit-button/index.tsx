"use client"

import { Button } from "@medusajs/ui"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  const variantClasses =
    variant === "secondary"
      ? "border-green-700 bg-green-500 hover:border-green-500 hover:bg-green-400"
      : "border-green-800 bg-green-600 hover:border-green-600 hover:bg-green-500"

  const defaultClasses = `rounded border-b-4 font-bold text-white transition hover:text-yellow-300 disabled:opacity-50 disabled:pointer-events-none ${variantClasses}`
  const combinedClassName = className ? `${defaultClasses} ${className}` : defaultClasses

  return (
    <Button
      size="large"
      className={combinedClassName}
      type="submit"
      isLoading={pending}
      variant={variant || "primary"}
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}
