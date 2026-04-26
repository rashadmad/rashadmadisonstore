import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {
    NODE_ENV: "test",
  },
  testSuite: ({ api }) => {
    describe("Store Custom API", () => {
      describe("GET /store/custom", () => {
        it("should return 200 OK", async () => {
          const response = await api.get("/store/custom")
          expect(response.status).toBe(200)
        })

        it("should return valid JSON response", async () => {
          const response = await api.get("/store/custom")
          expect(response.data).toBeDefined()
        })
      })

      describe("POST /store/custom", () => {
        it("should return 404 for undefined POST endpoint", async () => {
          const response = await api.post("/store/custom", {})
          expect(response.status).toBe(404)
        })
      })

      describe("PUT /store/custom", () => {
        it("should return 404 for undefined PUT endpoint", async () => {
          const response = await api.put("/store/custom", {})
          expect(response.status).toBe(404)
        })
      })

      describe("DELETE /store/custom", () => {
        it("should return 404 for undefined DELETE endpoint", async () => {
          const response = await api.delete("/store/custom")
          expect(response.status).toBe(404)
        })
      })
    })
  },
})