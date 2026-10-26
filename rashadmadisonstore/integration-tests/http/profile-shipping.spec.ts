import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  addShippingMethodToCartWorkflow, createCartWorkflow, createProductsWorkflow,
  createRegionsWorkflow, createSalesChannelsWorkflow, createStockLocationsWorkflow,
  listShippingOptionsForCartWithPricingWorkflow, updateCartWorkflow,
  updateLineItemInCartWorkflow, updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import setupChicagoShipping from "../../src/scripts/setup-chicago-shipping"
import setupProfileShipping from "../../src/scripts/setup-profile-shipping"
import { PROFILE_SHIPPING_PROVIDER } from "../../src/lib/profile-shipping"

jest.setTimeout(120_000)

medusaIntegrationTestRunner({
  inApp: true,
  testSuite: ({ getContainer }) => {
    it("persists per-profile charges, recalculates quantities, and preserves Chicago free shipping", async () => {
      const container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const { result: [channel] } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Automatic shipping test" }] },
      })
      const [store] = await container.resolve(Modules.STORE).listStores()
      await updateStoresWorkflow(container).run({
        input: { selector: { id: store.id }, update: { default_sales_channel_id: channel.id } },
      })
      const { result: [region] } = await createRegionsWorkflow(container).run({
        input: { regions: [{
          name: "US", currency_code: "usd", countries: ["us"],
          payment_providers: ["pp_system_default"],
        }] },
      })
      await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: "Test warehouse", address: { address_1: "123 Test Street", country_code: "us" } }] },
      })
      const profiles = await fulfillment.createShippingProfiles([
        { name: "Risograph print", type: "default" },
        { name: "Small Bag", type: "custom" },
      ])
      await setupChicagoShipping({ container, args: [] })
      await setupProfileShipping({ container, args: [] })
      await setupProfileShipping({ container, args: [] })
      const configured = await fulfillment.listShippingOptions({}, { take: null })
      expect(configured.filter((option) => option.provider_id === PROFILE_SHIPPING_PROVIDER)).toHaveLength(2)
      const { result: products } = await createProductsWorkflow(container).run({
        input: { products: profiles.map((profile, index) => ({
          title: `Shipping test ${index}`, handle: `shipping-test-${index}`,
          status: "published",
          shipping_profile_id: profile.id,
          options: [{ title: "Size", values: ["One"] }],
          variants: [{
            title: "One", manage_inventory: false, options: { Size: "One" },
            prices: [{ currency_code: "usd", amount: 25 }],
          }],
          sales_channels: [{ id: channel.id }],
        })) },
      })
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: region.id, sales_channel_id: channel.id, currency_code: "usd",
          items: products.map((product) => ({ variant_id: product.variants[0].id, quantity: 1 })),
          shipping_address: {
            address_1: "123 Test Street", city: "New York", province: "NY",
            postal_code: "10001", country_code: "us",
          },
        },
      })
      const { result: options } = await listShippingOptionsForCartWithPricingWorkflow(container).run({
        input: { cart_id: cart.id },
      })
      const automatic = options.filter((option) => option.provider_id === PROFILE_SHIPPING_PROVIDER)
      expect(automatic.map((option) => option.amount).sort((a, b) => Number(a) - Number(b))).toEqual([3.13, 9.5])
      await addShippingMethodToCartWorkflow(container).run({
        input: { cart_id: cart.id, options: automatic.map((option) => ({ id: option.id })) },
      })
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const read = async () => {
        const { data } = await query.graph({
          entity: "cart", filters: { id: cart.id },
          fields: ["items.id", "items.variant_id", "shipping_subtotal", "shipping_methods.*"],
        })
        return data[0]
      }
      const shippingTotal = async () =>
        (await read()).shipping_methods.reduce(
          (sum, method) => sum + Math.round(Number(method?.amount ?? 0) * 100), 0
        ) / 100
      expect(await shippingTotal()).toBe(12.63)
      const tubeItem = (await read()).items.find((item) => item?.variant_id === products[0].variants[0].id)!
      await updateLineItemInCartWorkflow(container).run({
        input: { cart_id: cart.id, item_id: tubeItem.id, update: { quantity: 3 } },
      })
      // Three tubes cost 9.50 + 4.75 + 0; the apparel item restarts at full rate.
      expect(await shippingTotal()).toBe(20.5)
      await updateCartWorkflow(container).run({
        input: {
          id: cart.id,
          shipping_address: { city: "Chicago", province: "IL", postal_code: "60614", country_code: "us" },
        },
      })
      expect(await shippingTotal()).toBe(0)
      await updateCartWorkflow(container).run({
        input: {
          id: cart.id,
          shipping_address: { city: "New York", province: "NY", postal_code: "10001", country_code: "us" },
        },
      })
      expect(await shippingTotal()).toBe(20.5)
    })
  },
})
