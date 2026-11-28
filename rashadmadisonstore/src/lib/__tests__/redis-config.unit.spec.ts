jest.mock("@medusajs/framework/utils", () => ({
  loadEnv: jest.fn(),
  defineConfig: jest.fn((config) => config),
}))

import { defineConfig } from "@medusajs/framework/utils"

const redisUrl = "redis://localhost:6379"

function setProductionEnvironment() {
  process.env.DATABASE_URL = "postgres://localhost:5432/store"
  process.env.JWT_SECRET = "a".repeat(32)
  process.env.COOKIE_SECRET = "b".repeat(32)
  process.env.STORE_CORS = "https://store.example"
  process.env.ADMIN_CORS = "https://admin.example"
  process.env.AUTH_CORS = "https://store.example,https://admin.example"
}

function loadConfig() {
  jest.isolateModules(() => {
    require("../../../medusa-config")
  })
}

describe("Redis configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.replaceProperty(process, "env", { NODE_ENV: "test" })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("preserves in-memory development defaults without Redis", () => {
    loadConfig()

    expect(defineConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projectConfig: expect.objectContaining({ redisUrl: undefined }),
        modules: expect.not.arrayContaining([
          expect.objectContaining({
            resolve: "@medusajs/medusa/event-bus-redis",
          }),
        ]),
      })
    )
  })

  it("rejects production configuration without Redis", () => {
    process.env.NODE_ENV = "production"
    process.env.REDIS_URL = " "

    expect(loadConfig).toThrow(
      "Missing required production environment variables: DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, STORE_CORS, ADMIN_CORS, AUTH_CORS"
    )
    expect(defineConfig).not.toHaveBeenCalled()
  })

  it("uses the same Redis connection for sessions, caches, events, workflows, and locks", () => {
    process.env.NODE_ENV = "production"
    setProductionEnvironment()
    process.env.REDIS_URL = ` ${redisUrl} `
    loadConfig()

    expect(defineConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projectConfig: expect.objectContaining({ redisUrl }),
        modules: expect.arrayContaining([
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: { redisUrl },
          },
          {
            resolve: "@medusajs/medusa/caching",
            options: {
              providers: [{
                resolve: "@medusajs/medusa/caching-redis",
                id: "caching-redis",
                is_default: true,
                options: { redisUrl },
              }],
            },
          },
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { redisUrl } },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [{
                resolve: "@medusajs/medusa/locking-redis",
                id: "locking-redis",
                is_default: true,
                options: { redisUrl },
              }],
            },
          },
        ]),
      })
    )
  })
})
