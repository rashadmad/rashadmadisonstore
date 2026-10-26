"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useContext } from "react"
import { NavigationContext } from "@lib/context/navigation"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  onNavigate,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()
  const router = useContext(NavigationContext)

  return (
    <Link
      href={`/${countryCode}${href}`}
      {...props}
      onNavigate={(event) => {
        let prevented = false
        onNavigate?.({
          preventDefault: () => {
            prevented = true
            event.preventDefault()
          },
        })
        if (router && !prevented) {
          event.preventDefault()
          const navigate = props.replace ? router.replace : router.push
          navigate(`/${countryCode}${href}`, { scroll: props.scroll })
        }
      }}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
