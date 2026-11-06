jest.mock("@medusajs/framework/utils", () => ({
  loadEnv: jest.fn(),
  defineConfig: jest.fn((config) => config),
}))

import { defineConfig } from "@medusajs/framework/utils"

const redisUrl = "redis://localhost:6379"

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

    expect(loadConfig).toThrow("REDIS_URL is required in production")
    expect(defineConfig).not.toHaveBeenCalled()
  })

  it("uses the same Redis connection for sessions, caches, events, workflows, and locks", () => {
    process.env.NODE_ENV = "production"
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
