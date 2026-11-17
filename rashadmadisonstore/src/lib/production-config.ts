const requiredProductionVariables = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "COOKIE_SECRET",
  "STORE_CORS",
  "ADMIN_CORS",
  "AUTH_CORS",
] as const

export const assertProductionEnvironment = (
  env: NodeJS.ProcessEnv
): void => {
  if (env.NODE_ENV !== "production") {
    return
  }

  const missingVariables = requiredProductionVariables.filter(
    (name) => !env[name]?.trim()
  )

  if (missingVariables.length) {
    throw new Error(
      `Missing required production environment variables: ${missingVariables.join(", ")}`
    )
  }

  const jwtSecret = env.JWT_SECRET?.trim() ?? ""
  const cookieSecret = env.COOKIE_SECRET?.trim() ?? ""
  const shortSecrets = [
    ...(jwtSecret.length < 32 ? ["JWT_SECRET"] : []),
    ...(cookieSecret.length < 32 ? ["COOKIE_SECRET"] : []),
  ]

  if (shortSecrets.length) {
    throw new Error(
      `Production secrets must be at least 32 characters: ${shortSecrets.join(", ")}`
    )
  }

  if (jwtSecret === cookieSecret) {
    throw new Error("JWT_SECRET and COOKIE_SECRET must be different values.")
  }
}
