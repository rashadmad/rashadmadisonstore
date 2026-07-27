import { Metadata } from "next"
import { getHasLoggedInBefore } from "@lib/data/cookies"

import LoginTemplate, { LOGIN_VIEW } from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Quintessential Store account.",
}

export default async function Login(props: {
  searchParams?: Promise<{ view?: string }>
}) {
  const hasLoggedInBefore = await getHasLoggedInBefore()
  const searchParams = await props.searchParams
  const requestedView = searchParams?.view

  const initialView =
    requestedView === LOGIN_VIEW.REGISTER || requestedView === LOGIN_VIEW.SIGN_IN
      ? requestedView
      : hasLoggedInBefore
        ? LOGIN_VIEW.SIGN_IN
        : LOGIN_VIEW.REGISTER

  return (
    <LoginTemplate initialView={initialView} />
  )
}
