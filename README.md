<img src="rashadmadisonstore-storefront/public/images/philosopher_symbol.svg" alt="Philosopher symbol" width="33%">

# Rashad Madison Store

The Quintessential is Rashad Madison's online art store. This repository contains
the customer storefront and the commerce backend that power the catalog, shopping
cart, checkout, customer accounts, and store administration. It also includes
custom studio-journal, newsletter, shipping, and catalog tooling.

The project is organized as two sibling applications:

| Directory | Purpose | Main technology | Local port |
| --- | --- | --- | --- |
| `rashadmadisonstore/` | Commerce backend, admin APIs, payments, and custom commerce modules | Medusa 2, TypeScript, PostgreSQL | `9000` |
| `rashadmadisonstore-storefront/` | Customer-facing storefront, catalog, cart, checkout, accounts, blog, and content | Next.js 15, React 19, TypeScript, Tailwind CSS | `8000` |

The storefront communicates with the Medusa backend through the Medusa JavaScript
SDK. Stripe payments and Google Analytics 4 are optional integrations configured
in the storefront environment. The studio journal is Markdown-powered, with
optional Mastodon feed and publishing support.

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

- Node.js 20 or newer and npm 11 or newer
- PostgreSQL for the Medusa backend, with a local database created
- Redis for production; local development can use Medusa's in-memory defaults
- Stripe test credentials only if you want to test Stripe checkout

## Installation and Local Setup

Install and configure the backend first:

```shell
cd rashadmadisonstore
npm install
cp .env.template .env
```

Edit `rashadmadisonstore/.env` for your local setup. At minimum, configure
`DATABASE_URL` for your PostgreSQL database, the storefront/admin/auth CORS
origins, and unique `JWT_SECRET` and `COOKIE_SECRET` values. Do not use example
or production secrets in a local or shared environment. The template lists
additional optional settings, including Redis, Stripe, Google sign-in, and media
storage.

Install the storefront and create its local environment file:

```shell
cd ../rashadmadisonstore-storefront
npm install
```

Create `rashadmadisonstore-storefront/.env.local`:

```dotenv
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-medusa-publishable-key>
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-publishable-key>
NEXT_PUBLIC_GA_MEASUREMENT_ID=<your-ga4-measurement-id>
```

The Medusa publishable key is created in Medusa Admin and is required by the
storefront. The Stripe and GA4 values are optional; leave them unset if you are
not configuring those integrations. `NEXT_PUBLIC_*` values are included in the
browser bundle, so only use them for public identifiers and keys. Never put
server secrets in the storefront environment. Optional image and Mastodon
settings are documented in the [storefront README](rashadmadisonstore-storefront/README.md).

## Run the Applications

Use separate terminals. Start the backend first:

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
- Medusa Admin: <http://localhost:9000/app>

Before testing a purchase, configure a store region, sales channel, products,
shipping options, and payment provider in Medusa Admin. The storefront defaults
to `http://localhost:9000` when `MEDUSA_BACKEND_URL` is not set, but the
publishable key still needs to be configured.

## Common Commands

### Backend

Run these commands from `rashadmadisonstore/`:

```shell
npm run build                 # Build the Medusa backend
npm run start                 # Start the built backend
npm run seed                  # Seed development data
npm run setup:profile-shipping # Configure profile-based shipping
npm run test:unit             # Run unit tests
npm run test:integration:http # Run HTTP integration tests
npm run test:integration:modules
```

### Storefront

Run these commands from `rashadmadisonstore-storefront/`:

```shell
npm run build          # Build the Next.js storefront
npm run start          # Start the production server on port 8000
npm test               # Run Jest tests
npm run test:coverage  # Run tests with coverage
```

## Project Areas

- **Backend (`rashadmadisonstore/`)**: Medusa commerce APIs, admin, database
  modules, payment and fulfillment providers, newsletter, and catalog scripts.
- **Storefront (`rashadmadisonstore-storefront/src/app/`)**: localized shop,
  product pages, cart, checkout, account, and studio content routes.
- **Storefront modules (`rashadmadisonstore-storefront/src/modules/`)**:
  feature UI and interactions; shared API and business helpers live in
  `src/lib/`.
- **Content and assets**: studio journal Markdown is in
  `rashadmadisonstore-storefront/content/blog/`; static storefront assets are in
  `rashadmadisonstore-storefront/public/`.

## Environment and Security

- Keep `.env` and `.env.local` out of version control.
- Use test-mode Stripe keys for local development.
- Replace the default JWT and cookie secrets before deploying.
- Configure backend CORS values to match the deployed storefront and admin URLs.
- Never expose server-only secrets, including Stripe secret keys, Mastodon access tokens, or cross-post keys, to the browser.
- Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` on the storefront service, not just
  on the backend. Since it is a public build-time variable, rebuild the
  storefront after changing it.
- Production backend deployments require Redis. See the backend README for
  Railway Redis and production media-storage setup.

## Further Documentation

- [Backend README](rashadmadisonstore/README.md)
- [Storefront README](rashadmadisonstore-storefront/README.md)
- [Medusa documentation](https://docs.medusajs.com/)
- [Next.js documentation](https://nextjs.org/docs)