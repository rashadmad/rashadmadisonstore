import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {
    NODE_ENV: "test",
  },
  testSuite: ({ api }) => {
    describe("Admin Custom Route", () => {
      it("should return 200 for GET /admin/custom", async () => {
        const response = await api.get('/admin/custom')
        expect(response.status).toEqual(200)
      })
    })
  },
})