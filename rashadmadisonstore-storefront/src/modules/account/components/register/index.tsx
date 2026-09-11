"use client"

import { useActionState, useState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GoogleAuthButton from "@modules/account/components/google-auth-button"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type SignupStep = "choice" | "email"

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [signupStep, setSignupStep] = useState<SignupStep>("choice")

  return (
    <div
      className="w-full min-h-[640px] max-w-3xl flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mt-5 mb-3">
        Become a Quintessential Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mt-8 mb-16">
        Create your Quintessential Store Member account, and get access to order info
      </p>

      {signupStep === "choice" ? (
        <div className="grid w-full max-w-sm gap-3" data-testid="signup-choice-actions">
          <button
            type="button"
            onClick={() => setSignupStep("email")}
            className="inline-flex w-full items-center justify-center rounded border-b-4 border-green-700 bg-green-500 px-4 py-3 font-bold text-white hover:border-green-500 hover:bg-green-400 hover:text-yellow-300"
            data-testid="signup-email-button"
          >
            Sign up with your email
          </button>
          <p className="text-center text-base-regular text-ui-fg-base">
            or
          </p>
          <GoogleAuthButton title="Google account signup is not configured yet.">
            Sign up with Google
          </GoogleAuthButton>
        </div>
      ) : (
        <form className="w-full flex flex-col" action={formAction}>
          <button
            type="button"
            onClick={() => setSignupStep("choice")}
            className="mb-4 self-start text-small-regular text-ui-fg-base underline"
          >
            Back
          </button>
          <div className="grid w-full gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="First name"
                name="first_name"
                required
                autoComplete="given-name"
                data-testid="first-name-input"
              />
              <Input
                label="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                data-testid="last-name-input"
              />
              <Input
                label="Email"
                name="email"
                required
                type="email"
                autoComplete="email"
                data-testid="email-input"
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                data-testid="phone-input"
              />
              <Input
                label="Password"
                name="password"
                required
                type="password"
                autoComplete="new-password"
                data-testid="password-input"
              />
              <Input
                label="Confirm password"
                name="confirm_password"
                required
                type="password"
                autoComplete="new-password"
                data-testid="confirm-password-input"
              />
            </div>

            <fieldset className="grid gap-3 rounded-lg border border-ui-border-base bg-white/70 p-4">
              <legend className="px-1 text-small-semi uppercase text-ui-fg-base">
                Shipping address optional
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Shipping company" name="shipping_address.company" autoComplete="organization" />
                <Input label="Shipping address" name="shipping_address.address_1" autoComplete="shipping address-line1" />
                <Input label="Apartment, suite, etc." name="shipping_address.address_2" autoComplete="shipping address-line2" />
                <Input label="Shipping city" name="shipping_address.city" autoComplete="shipping address-level2" />
                <Input label="Shipping state" name="shipping_address.province" autoComplete="shipping address-level1" />
                <Input label="Shipping postal code" name="shipping_address.postal_code" autoComplete="shipping postal-code" />
                <Input label="Shipping country code" name="shipping_address.country_code" autoComplete="shipping country" maxLength={2} />
              </div>
              <div className="flex flex-col gap-2 text-small-regular text-ui-fg-base sm:flex-row sm:items-center sm:gap-5">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="billing_same_as_shipping"
                    value="yes"
                    defaultChecked
                  />
                  Is your billing address the same as your shipping address?
                </label>
              </div>
            </fieldset>
          </div>
          <ErrorMessage error={message} data-testid="register-error" />
          <span className="text-center text-ui-fg-base text-small-regular mt-6">
            By creating an account, you agree to The Quintessential{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="underline"
            >
              Privacy Policy
            </LocalizedClientLink>{" "}
            and{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="underline"
            >
              Terms of Use
            </LocalizedClientLink>
            .
          </span>
          <SubmitButton
            className="w-full mt-6 inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-white hover:text-yellow-300 font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
            data-testid="register-button"
          >
            Join
          </SubmitButton>
        </form>
      )}
      <span className="mt-auto pt-6 text-center text-ui-fg-base text-small-regular" data-testid="register-sign-in-prompt">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
