"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import {
  updateCustomerPassword,
  type PasswordUpdateState,
} from "@lib/data/customer"

const initialState: PasswordUpdateState = { success: false, error: null }

const ProfilePassword = () => {
  const [successState, setSuccessState] = React.useState(false)
  const [state, formAction] = useActionState(
    updateCustomerPassword,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state.success])

  return (
    <form
      action={formAction}
      onReset={() => clearState()}
      className="w-full"
    >
      <AccountInfo
        label="Password"
        currentInfo={<span>Change your account password</span>}
        isSuccess={successState}
        isError={Boolean(state.error)}
        errorMessage={state.error ?? undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Old password"
            name="old_password"
            required
            type="password"
            autoComplete="current-password"
            data-testid="old-password-input"
          />
          <Input
            label="New password"
            type="password"
            name="new_password"
            required
            minLength={8}
            autoComplete="new-password"
            data-testid="new-password-input"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm_password"
            required
            minLength={8}
            autoComplete="new-password"
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
