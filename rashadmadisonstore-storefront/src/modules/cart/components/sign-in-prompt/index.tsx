import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200 flex items-center justify-between gap-4">
      <div>
        <Heading level="h2" className="text-lg font-bold text-neutral-900">
          Already have an account?
        </Heading>
        <Text className="text-sm font-medium text-neutral-700 mt-1">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button className="h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
