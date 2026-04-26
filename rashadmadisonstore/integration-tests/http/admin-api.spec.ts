import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {
    NODE_ENV: "test",
  },
  testSuite: ({ api }) => {
    describe("Admin Custom API", () => {
      describe("GET /admin/custom", () => {
        it("should return 200 OK", async () => {
          const response = await api.get("/admin/custom")
          expect(response.status).toBe(200)
        })

        it("should return valid JSON response", async () => {
          const response = await api.get("/admin/custom")
          expect(response.data).toBeDefined()
        })
      })

      describe("POST /admin/custom", () => {
        it("should return 404 for undefined POST endpoint", async () => {
          const response = await api.post("/admin/custom", {})
          expect(response.status).toBe(404)
        })
      })

      describe("PUT /admin/custom", () => {
        it("should return 404 for undefined PUT endpoint", async () => {
          const response = await api.put("/admin/custom", {})
          expect(response.status).toBe(404)
        })
      })

      describe("DELETE /admin/custom", () => {
        it("should return 404 for undefined DELETE endpoint", async () => {
          const response = await api.delete("/admin/custom")
          expect(response.status).toBe(404)
        })
      })
    })
  },
})