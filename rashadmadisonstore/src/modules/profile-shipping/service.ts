import { container } from "@medusajs/framework"
import { AbstractFulfillmentProviderService, ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { CalculateShippingOptionPriceContext } from "@medusajs/framework/types"
import { getProfileShippingQuote } from "../../lib/profile-shipping"

export default class ProfileShippingService extends AbstractFulfillmentProviderService {
  static identifier = "profile-shipping"

  async getFulfillmentOptions() {
    return [{ id: "automatic-usps" }]
  }

  async canCalculate() { return true }

  async validateOption(data: Record<string, unknown>) {
    return typeof data.shipping_profile_id === "string"
  }

  async validateFulfillmentData() {
    return {}
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: CalculateShippingOptionPriceContext
  ) {
    // Fulfillment providers have a module-scoped container; Query lives in the app container.
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { charges } = await getProfileShippingQuote(query, context.id)
    const id = optionData.shipping_profile_id
    if (typeof id !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing shipping profile on USPS option.")
    }
    return {
      calculated_amount: (charges[id] ?? 0) / 100,
      is_calculated_price_tax_inclusive: false,
    }
  }

  async createFulfillment() { return { data: {}, labels: [] } }
  async cancelFulfillment() { return {} }
  async createReturnFulfillment() { return { data: {}, labels: [] } }
}
