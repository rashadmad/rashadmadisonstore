# Rashad Madison Store

Full-stack ecommerce project for Rashad Madison's art, prints, and related products.

The project is organized as two sibling applications:

| Directory | Purpose | Main technology | Local port |
| --- | --- | --- | --- |
| `rashadmadisonstore/` | Commerce backend, admin APIs, payments, and custom commerce modules | Medusa 2, TypeScript, PostgreSQL | `9000` |
| `rashadmadisonstore-storefront/` | Customer-facing storefront, catalog, cart, checkout, accounts, blog, and content | Next.js 15, React 19, TypeScript, Tailwind CSS | `8000` |

The storefront communicates with the Medusa backend through the Medusa JavaScript SDK. Stripe is supported for payments, and the storefront includes Mastodon blog synchronization and cross-posting support.

## Project Layout

```text
rashadmadisonstore/
├── rashadmadisonstore/                    # Medusa backend
│   ├── src/modules/blog/                  # Custom blog module
│   ├── src/scripts/                       # Data and setup scripts
│   ├── integration-tests/                 # Backend integration tests
│   ├── medusa-config.ts                   # Backend, CORS, database, and payment config
│   └── .env.template                       # Backend environment variable template
└── rashadmadisonstore-storefront/         # Next.js storefront
    ├── src/app/                            # App Router routes and API routes
    ├── src/modules/                        # Storefront feature modules and UI
    ├── src/lib/                            # SDK, data access, utilities, and shared logic
    ├── content/blog/                       # Markdown blog content
    ├── public/images/                      # Static image assets
    └── src/styles/                         # Global styles
```

## Prerequisites

- Node.js 20 or newer
- npm 11 or newer
- PostgreSQL
- Redis, if required by the local Medusa setup
- Stripe test credentials for payment flows

## Initial Setup

### 1. Configure the backend

```shell
cd rashadmadisonstore
npm install
cp .env.template .env
```

Update `.env` with a PostgreSQL connection string and valid local secrets. The [backend environment template](rashadmadisonstore/.env.template) includes settings for CORS, database access, Redis, JWT and cookie secrets, and Stripe.

### 2. Configure the storefront

```shell
cd ../rashadmadisonstore-storefront
npm install
```

Create `.env.local` and set the backend URL and public Medusa key as needed:

```dotenv
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-medusa-publishable-key>
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-publishable-key>
```

The storefront also supports optional Cloudinary or Medusa Cloud image settings. Mastodon integration variables are documented in the storefront [README](rashadmadisonstore-storefront/README.md).

## Running Locally

Start the backend first:

```shell
cd rashadmadisonstore
npm run dev
```

In a second terminal, start the storefront:

```shell
cd rashadmadisonstore-storefront
npm run dev
```

Then open:

- Storefront: <http://localhost:8000>
- Medusa backend: <http://localhost:9000>

The storefront defaults to `http://localhost:9000` when `MEDUSA_BACKEND_URL` is not set.

## Common Commands

### Backend

```shell
npm run build                 # Build the Medusa backend
npm run start                 # Start the built backend
npm run seed                  # Seed development data
npm run test:unit             # Run unit tests
npm run test:integration:http # Run HTTP integration tests
npm run test:integration:modules
```

### Storefront

```shell
npm run build          # Build the Next.js storefront
npm run start          # Start the production server on port 8000
npm test               # Run Jest tests
npm run test:coverage  # Run tests with coverage
```

## Environment and Security

- Keep `.env` and `.env.local` out of version control.
- Use test-mode Stripe keys for local development.
- Replace the default JWT and cookie secrets before deploying.
- Configure backend CORS values to match the deployed storefront and admin URLs.
- Never expose server-only secrets, including Stripe secret keys, Mastodon access tokens, or cross-post keys, to the browser.

## Further Documentation

- [Backend README](rashadmadisonstore/README.md)
- [Storefront README](rashadmadisonstore-storefront/README.md)
- [Medusa documentation](https://docs.medusajs.com/)
- [Next.js documentation](https://nextjs.org/docs)