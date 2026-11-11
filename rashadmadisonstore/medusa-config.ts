import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { s3FileModule } from './src/lib/s3-config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL?.trim()

if (process.env.NODE_ENV === 'production' && !redisUrl) {
  throw new Error('REDIS_URL is required in production. Reference the Railway Redis service URL in the backend variables.')
}

const stripeProvider = process.env.STRIPE_API_KEY
  ? [
      {
        resolve: '@medusajs/payment-stripe',
        id: 'stripe',
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
      },
    ]
  : []

const googleAuthProvider =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
    ? [
        {
          resolve: '@medusajs/medusa/auth-google',
          id: 'google',
          options: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL,
          },
        },
      ]
    : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    ...s3FileModule(process.env),
    ...(redisUrl
      ? [
          {
            resolve: '@medusajs/medusa/cache-redis',
            options: { redisUrl },
          },
          {
            resolve: '@medusajs/medusa/caching',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/caching-redis',
                  id: 'caching-redis',
                  is_default: true,
                  options: { redisUrl },
                },
              ],
            },
          },
          {
            resolve: '@medusajs/medusa/event-bus-redis',
            options: { redisUrl },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: { redis: { redisUrl } },
          },
          {
            resolve: '@medusajs/medusa/locking',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/locking-redis',
                  id: 'locking-redis',
                  is_default: true,
                  options: { redisUrl },
                },
              ],
            },
          },
        ]
      : []),
    {
      resolve: './src/modules/newsletter',
    },
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          { resolve: '@medusajs/medusa/fulfillment-manual', id: 'manual' },
          { resolve: './src/modules/profile-shipping', id: 'profile-shipping' },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/auth',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
          },
          ...googleAuthProvider,
        ],
      },
    },
    {
      resolve: '@medusajs/payment',
      options: {
        providers: stripeProvider,
      },
    },
    {
      resolve: './src/modules/blog',
    },
  ],
})
