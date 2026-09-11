import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import GoogleAuthButton from "@modules/account/components/google-auth-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  redirectTo?: string
}

const Login = ({ setCurrentView, redirectTo }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <div className="mb-5 w-full">
        <GoogleAuthButton title="Google login is not configured yet.">
          Login with Google
        </GoogleAuthButton>
      </div>
      <p>Or sign in with your email</p>
      <br></br>
      <form className="w-full" action={formAction}>
        {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-white hover:text-yellow-300 font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
        >
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Sign up
        </button>
        .
      </span>
    </div>
  )
}

export default Login
