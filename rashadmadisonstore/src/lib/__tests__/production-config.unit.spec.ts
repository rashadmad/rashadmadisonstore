import { assertProductionEnvironment } from "../production-config"

const validEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://localhost:5432/store",
  REDIS_URL: "redis://localhost:6379",
  JWT_SECRET: "a".repeat(32),
  COOKIE_SECRET: "b".repeat(32),
  STORE_CORS: "https://store.example",
  ADMIN_CORS: "https://admin.example",
  AUTH_CORS: "https://store.example,https://admin.example",
}

describe("production environment validation", () => {
  it("accepts complete production settings with separate strong secrets", () => {
    expect(() => assertProductionEnvironment(validEnvironment)).not.toThrow()
  })

  it("requires production connection, CORS, and secret variables", () => {
    expect(() =>
      assertProductionEnvironment({
        NODE_ENV: "production",
      })
    ).toThrow(
      "Missing required production environment variables: DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, STORE_CORS, ADMIN_CORS, AUTH_CORS"
    )
  })

  it("rejects short or reused production secrets", () => {
    expect(() =>
      assertProductionEnvironment({
        ...validEnvironment,
        JWT_SECRET: "short",
      })
    ).toThrow("Production secrets must be at least 32 characters: JWT_SECRET")

    expect(() =>
      assertProductionEnvironment({
        ...validEnvironment,
        COOKIE_SECRET: validEnvironment.JWT_SECRET,
      })
    ).toThrow("JWT_SECRET and COOKIE_SECRET must be different values.")
  })

  it("does not require production settings in development", () => {
    expect(() => assertProductionEnvironment({ NODE_ENV: "development" })).not.toThrow()
  })
})
