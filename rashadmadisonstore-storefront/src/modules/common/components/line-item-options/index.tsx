import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block text-sm text-neutral-600 font-medium w-full overflow-hidden text-ellipsis mt-0.5 group-[.cart-dropdown]:text-yellow-500"
    >
      Variant: {variant?.title}
    </Text>
  )
}

export default LineItemOptions
