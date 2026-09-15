import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-24 sm:py-32 px-4 flex flex-col justify-center items-center text-center max-w-lg mx-auto bg-white rounded-2xl border border-neutral-200/80 shadow-sm" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="text-3xl font-bold text-neutral-900 tracking-tight"
      >
        Cart
      </Heading>
      <Text className="text-base text-neutral-700 font-medium mt-3 mb-8 leading-relaxed">
        You don&apos;t have anything in your cart right now. Explore our collections and find original fine art, limited prints, or wearable artwork.
      </Text>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
