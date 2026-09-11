"use client"

import { useEffect, useState } from "react"

import { appCopy } from "@lib/copy"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type LoginTemplateProps = {
  initialView?: LOGIN_VIEW
  redirectTo?: string
}

const LoginTemplate = ({ initialView = LOGIN_VIEW.SIGN_IN, redirectTo }: LoginTemplateProps) => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(initialView)

  useEffect(() => {
    setCurrentView(initialView)
  }, [initialView])

  return (
    <div className="w-full min-h-[60vh] px-6 py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-8 rounded-[2rem] border border-black/10 bg-white/60 p-4 shadow-[0_20px_60px_rgba(23,18,13,0.08)] backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
        <div className="relative hidden min-h-[640px] overflow-hidden rounded-[1.5rem] lg:block lg:self-start">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/princeImageBackground.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,18,0.18),rgba(17,24,18,0.42))]" />
          <div className="relative flex h-full items-end p-8">
            <div className="max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-200 [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]">
                {appCopy.auth.artwork.label}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.9)]">
                {appCopy.auth.artwork.heading}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-center">
          {currentView === "sign-in" ? (
            <Login setCurrentView={setCurrentView} redirectTo={redirectTo} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
