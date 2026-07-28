"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type LoginTemplateProps = {
  initialView?: LOGIN_VIEW
}

const LoginTemplate = ({ initialView = LOGIN_VIEW.SIGN_IN }: LoginTemplateProps) => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(initialView)

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-6 py-10">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
