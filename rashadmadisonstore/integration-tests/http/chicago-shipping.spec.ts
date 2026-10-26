import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  listShippingOptionsForCartWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
  updateCartWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { CHICAGO_FREE_SHIPPING_CODE } from "../../src/lib/chicago-shipping"
import setupChicagoShipping from "../../src/scripts/setup-chicago-shipping"

jest.setTimeout(120_000)

medusaIntegrationTestRunner({
  inApp: true,
  testSuite: ({ getContainer }) => {
    describe("Chicago free shipping", () => {
      it("initializes a store with no delivery setup and allows continuing to payment", async () => {
        const container = getContainer()
        const fulfillment = container.resolve(Modules.FULFILLMENT)
        const {
          result: [channel],
        } = await createSalesChannelsWorkflow(container).run({
          input: { salesChannelsData: [{ name: "Storefront" }] },
        })
        const [store] = await container.resolve(Modules.STORE).listStores()
        await updateStoresWorkflow(container).run({
          input: {
            selector: { id: store.id },
            update: { default_sales_channel_id: channel.id },
          },
        })
        await createStockLocationsWorkflow(container).run({
          input: {
            locations: [
              {
                name: "Existing warehouse",
                address: { address_1: "123 Test Street", country_code: "us" },
              },
            ],
          },
        })
        const profiles = await fulfillment.createShippingProfiles([
          { name: "Prints", type: "default" },
          { name: "Framed prints", type: "custom" },
        ])
        const {
          result: [region],
        } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              {
                name: "United States",
                countries: ["us"],
                currency_code: "usd",
                payment_providers: ["pp_system_default"],
              },
            ],
          },
        })
        await setupChicagoShipping({ container, args: [] })
        await setupChicagoShipping({ container, args: [] })
        const options = await fulfillment.listShippingOptions()
        expect(options).toHaveLength(2)
        expect(
          options.map((option) => option.shipping_profile_id).sort()
        ).toEqual(profiles.map((profile) => profile.id).sort())
        const { result: cart } = await createCartWorkflow(container).run({
          input: {
            region_id: region.id,
            sales_channel_id: channel.id,
            currency_code: "usd",
            email: "local-shipping@example.com",
            items: [{ title: "Print", quantity: 1, unit_price: 25 }],
            shipping_address: {
              address_1: "123 Test Street",
              city: "Chicago",
              province: "IL",
              country_code: "us",
              postal_code: "60614",
            },
          },
        })
        const { result: available } = await listShippingOptionsForCartWorkflow(
          container
        ).run({
          input: { cart_id: cart.id },
        })
        expect(available).toHaveLength(2)
        expect(available).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              amount: 0,
              insufficient_inventory: false,
            }),
          ])
        )
        await addShippingMethodToCartWorkflow(container).run({
          input: { cart_id: cart.id, options: [{ id: options[0].id }] },
        })
        const saved = await container
          .resolve(Modules.CART)
          .retrieveCart(cart.id, {
            relations: ["shipping_methods"],
          })
        expect(saved.shipping_methods).toEqual([
          expect.objectContaining({
            shipping_option_id: options[0].id,
            amount: 0,
          }),
        ])
      })

      it("enforces local eligibility through listing, selection, and address changes", async () => {
        const container = getContainer()
        const fulfillment = container.resolve(Modules.FULFILLMENT)
        const link = container.resolve(ContainerRegistrationKeys.LINK)
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        await expect(
          setupChicagoShipping({ container, args: [] })
        ).rejects.toThrow("requires exactly one stock location")
        const {
          result: [channel],
        } = await createSalesChannelsWorkflow(container).run({
          input: { salesChannelsData: [{ name: "Chicago shipping test" }] },
        })
        const {
          result: [region],
        } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              {
                name: "US",
                currency_code: "usd",
                countries: ["us"],
                payment_providers: ["pp_system_default"],
              },
            ],
          },
        })
        const {
          result: [location],
        } = await createStockLocationsWorkflow(container).run({
          input: {
            locations: [
              {
                name: "Chicago warehouse",
                address: {
                  address_1: "123 Test Street",
                  country_code: "us",
                  city: "Chicago",
                },
              },
            ],
          },
        })
        const profile = await fulfillment.createShippingProfiles({
          name: "Default",
          type: "default",
        })
        const set = await fulfillment.createFulfillmentSets({
          name: "US shipping",
          type: "shipping",
          service_zones: [
            {
              name: "US",
              geo_zones: [{ type: "country", country_code: "us" }],
            },
          ],
        })
        await link.create([
          {
            [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
            [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
          },
          {
            [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
            [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
          },
        ])
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: { id: location.id, add: [channel.id] },
        })
        const {
          result: [paid],
        } = await createShippingOptionsWorkflow(container).run({
          input: [
            {
              name: "Standard",
              price_type: "flat",
              service_zone_id: set.service_zones[0].id,
              shipping_profile_id: profile.id,
              provider_id: "manual_manual",
              type: {
                label: "Standard",
                description: "Standard delivery",
                code: "standard",
              },
              prices: [{ currency_code: "usd", amount: 10 }],
              rules: [
                {
                  attribute: "enabled_in_store",
                  operator: "eq",
                  value: "true",
                },
                { attribute: "is_return", operator: "eq", value: "false" },
              ],
            },
          ],
        })

        await setupChicagoShipping({ container, args: [] })
        await setupChicagoShipping({ container, args: [] })
        const configured = await fulfillment.listShippingOptions(
          {},
          { relations: ["type"] }
        )
        const freeOptions = configured.filter(
          (option) => option.type.code === CHICAGO_FREE_SHIPPING_CODE
        )
        expect(freeOptions).toHaveLength(1)
        const free = freeOptions[0]
        const { result: cart } = await createCartWorkflow(container).run({
          input: {
            region_id: region.id,
            sales_channel_id: channel.id,
            currency_code: "usd",
            email: "shipping-test@example.com",
            items: [
              {
                title: "Art print",
                quantity: 1,
                unit_price: 25,
                requires_shipping: true,
              },
            ],
            shipping_address: {
              address_1: "123 Test Street",
              city: "Chicago",
              country_code: "us",
              province: "il",
              postal_code: "60615-1234",
            },
          },
        })

        const list = async () =>
          (
            await listShippingOptionsForCartWorkflow(container).run({
              input: { cart_id: cart.id },
            })
          ).result
        const methods = async () => {
          const {
            data: [current],
          } = await query.graph({
            entity: "cart",
            fields: ["shipping_methods.*", "shipping_total"],
            filters: { id: cart.id },
          })
          if (!("shipping_total" in current)) {
            throw new Error("Cart query did not return shipping_total")
          }
          return {
            shipping_total: Number(current.shipping_total),
            shipping_methods: current.shipping_methods.map((method) => {
              if (!method) {
                throw new Error("Cart query returned a null shipping method")
              }
              return {
                shipping_option_id: method.shipping_option_id,
                amount: Number(method.amount),
              }
            }),
          }
        }

        expect(await list()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: free.id, amount: 0 }),
            expect.objectContaining({ id: paid.id, amount: 10 }),
          ])
        )
        await addShippingMethodToCartWorkflow(container).run({
          input: { cart_id: cart.id, options: [{ id: free.id }] },
        })
        expect((await methods()).shipping_total).toBe(0)
        expect((await methods()).shipping_methods).toEqual([
          expect.objectContaining({ shipping_option_id: free.id, amount: 0 }),
        ])

        await updateCartWorkflow(container).run({
          input: {
            id: cart.id,
            shipping_address: {
              country_code: "us",
              province: "il",
              city: "DeKalb",
              postal_code: "60115",
            },
          },
        })
        expect(await list()).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ id: free.id })])
        )
        expect((await methods()).shipping_methods).toHaveLength(0)
        const { result: forbiddenPrices } =
          await listShippingOptionsForCartWithPricingWorkflow(container).run({
            input: { cart_id: cart.id, options: [{ id: free.id }] },
          })
        expect(forbiddenPrices).toHaveLength(0)
        await expect(
          addShippingMethodToCartWorkflow(container).run({
            input: { cart_id: cart.id, options: [{ id: free.id }] },
          })
        ).rejects.toMatchObject({
          message: "Shipping Options are invalid for cart.",
        })
        expect((await methods()).shipping_methods).toHaveLength(0)
        await addShippingMethodToCartWorkflow(container).run({
          input: { cart_id: cart.id, options: [{ id: paid.id }] },
        })
        expect((await methods()).shipping_total).toBe(10)
        expect((await methods()).shipping_methods).toEqual([
          expect.objectContaining({ shipping_option_id: paid.id, amount: 10 }),
        ])

        await updateCartWorkflow(container).run({
          input: {
            id: cart.id,
            shipping_address: {
              country_code: "us",
              province: "il",
              city: "Wheaton",
              postal_code: "60187",
            },
          },
        })
        expect(await list()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: free.id, amount: 0 }),
          ])
        )
        const { result: returnOptions } =
          await listShippingOptionsForCartWorkflow(container).run({
            input: { cart_id: cart.id, is_return: true },
          })
        expect(returnOptions).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ id: free.id })])
        )
      })
    })
  },
})
