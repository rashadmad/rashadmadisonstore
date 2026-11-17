<p align="center">
  <img src="public/images/philosopher_symbol.svg" alt="The Quintessential philosopher symbol" width="160" />
</p>

# The Quintessential Storefront

The ecommerce storefront for The Quintessential, Rashad Madison's collection of original artwork, limited-edition prints, apparel, and studio writing. It is a Next.js application connected to the Medusa backend in the sibling `rashadmadisonstore` project.

## Stack

- Next.js 15 and React 19
- Medusa JS SDK for products, carts, customers, checkout, and regions
- Tailwind CSS and Medusa UI
- Stripe checkout support
- Markdown-powered studio journal
- Optional Mastodon publishing and feed integration

## Local Development

### Prerequisites

- A running Medusa backend with at least one region configured
- A Medusa publishable API key
- npm 11 or later

### Install and Run

```shell
npm install
```

Create `.env.local` in this directory:

```shell
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-medusa-publishable-key>
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GA_MEASUREMENT_ID=<your-ga4-measurement-id>
```

Start the storefront:

```shell
npm run dev
```

The application runs at [http://localhost:8000](http://localhost:8000). Requests without a country code are redirected to the configured Medusa region, such as `/us`.

## Page transition loading

Checkout fetches available payment providers without caching so changes made
under Medusa Admin's region payment settings appear on checkout refresh.

Navigation lasting at least two seconds displays a non-blocking top progress
indicator, keeping the current content and keyboard controls available. When a
route has no usable content and shows a loading boundary, the gallery loading
artwork is shown in the document flow instead of a full-screen overlay.
One shared timer coordinates both states, including nested route fallbacks.
Faster transitions do not flash an indicator or receive an artificial delay.
Loading is announced through an accessible status; animation respects reduced
motion preferences.

Route loading boundaries cover server-rendered pages. The root navigation
provider also tracks localized links and programmatic navigation, including
checkout query-string steps, pagination, sorting, and refreshes. Use
`LocalizedClientLink` for internal storefront links and `useRouter` from
`@lib/context/navigation` for programmatic navigation so new features participate.
Modified clicks and links opening new tabs retain Next.js link behavior.
Tracked router back/forward calls participate; browser history buttons are
covered when they trigger route loading boundaries, not by a global browser
navigation event. Arbitrary server actions and external/full-document navigation
are not tracked. Existing button-level progress indicators remain unchanged;
navigation loading does not indicate that a payment has succeeded.

## Address state selection

Checkout shipping and billing forms, saved-address forms, and signup use a
shared US state dropdown with all 50 states, DC, and five US territories.
Selections submit two-letter codes. Existing full state names and `US-XX`
codes are recognized; other saved province values are preserved for editing.
This list does not enable new shipping destinations or change shipping rates.
Country fields are hidden and submit `us` while the store serves only the United
States. Restore country selectors before expanding internationally (see the TODO
in `USCountryInput`). Signup addresses remain optional.

## Automatic checkout shipping

Delivery automatically applies backend-calculated USPS shipping with no service
selection. Each unit uses its product shipping profile's base rate, sorted from
highest rate to lowest. The repeating charge is full price, half price, free.
Eligible Chicago-area ZIP codes receive free shipping for the whole order.
The Delivery step explains the policy and shows the combined charge before
payment. Failed calculations block continuation and offer a retry; before a
shipping method is applied, the summary labels shipping as calculated at the
delivery step rather than implying it is free.

The backend must have the profile-shipping provider and calculated options
configured; see its `npm run setup:profile-shipping` command and README.

## Environment Variables

| Variable                                      | Required | Purpose                                                                                   |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `MEDUSA_BACKEND_URL`                          | Yes      | URL of the Medusa backend. Local default: `http://localhost:9000`.                        |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`          | Yes      | Medusa publishable API key used by the storefront and middleware.                         |
| `NEXT_PUBLIC_DEFAULT_REGION`                  | No       | Region used when a visitor's country cannot be determined. Defaults to `us`.              |
| `NEXT_PUBLIC_BASE_URL`                        | No       | Public storefront origin used for metadata and sitemap URLs. Defaults to `http://localhost:8000` locally; set the deployed HTTPS origin in production. |
| `NEXT_PUBLIC_STRIPE_KEY`                      | No       | Stripe publishable key for Stripe checkout.                                               |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY` | No       | Alternative Medusa payment publishable key.                                               |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID`      | No       | Medusa payment account identifier.                                                        |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`               | No       | GA4 Measurement ID (for example, `G-XXXXXXXXXX`) used by the storefront for analytics.    |
| `NEXT_PUBLIC_MASTODON_PROFILE_URL`            | No       | Public Mastodon profile URL shown with imported posts.                                    |
| `MASTODON_API_BASE_URL`                       | No       | Mastodon instance API URL. Defaults to `https://mastodon.social`.                         |
| `MASTODON_ACCOUNT_ACCT`                       | No       | Mastodon account handle to read. Defaults to `rashadmad`.                                 |
| `MASTODON_ACCESS_TOKEN`                       | No       | Server-only token required to publish a post to Mastodon.                                 |
| `BLOG_CROSSPOST_KEY`                          | No       | Server-only shared secret protecting the Mastodon cross-post endpoint.                    |

Google Analytics runs in the Next.js storefront, so configure
`NEXT_PUBLIC_GA_MEASUREMENT_ID` in the storefront's local environment and
deployment/build environment, not only in the Medusa backend. With a measurement
ID configured, the storefront tracks product views, add-to-cart, checkout starts,
and completed purchases.

## Google Customer Authentication

Google sign-in starts in the storefront and is completed by the Medusa backend. Add these variables to the backend app environment:

```shell
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
```

In Google Cloud Console, add this authorized redirect URI to the OAuth client:

```text
http://localhost:8000/api/auth/google/callback
```

For production, set `GOOGLE_CALLBACK_URL` to your public storefront callback URL, such as `https://your-domain.com/api/auth/google/callback`, and add that same URI in Google Cloud Console.

Never commit `.env.local` or any access tokens.

## Scripts

```shell
npm run dev            # Start the local server on port 8000
npm run build          # Create a production build
npx tsc --noEmit       # Type-check application source
npm run start          # Serve the production build on port 8000
npm run lint           # Run Next.js linting
npm test               # Run the Jest suite
npm run test:watch     # Run Jest in watch mode
npm run test:coverage  # Run Jest with coverage
npm run analyze        # Build with bundle analysis enabled
```

## Managing the Studio Journal

Blog posts live in [`content/blog`](content/blog). Each published post is a Markdown file; its filename becomes the post slug. For example, `my-new-post.md` is available at `/blog/my-new-post` within a country-prefixed route.

Start each post with frontmatter:

```yaml
---
title: My post title
category: Process
excerpt: A short description shown on blog cards.
publishedAt: 2026-09-03
image: /images/my-post-image.jpg
imageAlt: A concise description of the image
---
```

Place local images in [`public/images`](public/images). Posts are sorted newest first. Add `draft: true` to hide an unfinished post; files whose names start with `_` are ignored. More authoring details are in [`content/blog/_README.md`](content/blog/_README.md).

Individual post pages include desktop-only advertising sidebars. Ad integrations can target the empty elements marked `data-ad-slot="blog-sidebar-left"` and `data-ad-slot="blog-sidebar-right"` in [`src/app/[countryCode]/(main)/blog/[slug]/page.tsx`](<src/app/%5BcountryCode%5D/(main)/blog/%5Bslug%5D/page.tsx>). The slots are intentionally hidden on smaller screens.

## Mastodon Integration

The blog page can read recent public posts from the configured Mastodon account. It can also publish site-originated posts through the protected endpoint below. Reading posts works with the public account configuration; publishing additionally requires both `MASTODON_ACCESS_TOKEN` and `BLOG_CROSSPOST_KEY`.

```text
POST /api/mastodon/cross-post
```

```shell
curl -X POST http://localhost:8000/api/mastodon/cross-post \
  -H "Content-Type: application/json" \
  -H "x-crosspost-key: $BLOG_CROSSPOST_KEY" \
  -d '{
    "title": "Studio Update",
    "content": "A new blog update just went live.",
    "canonicalUrl": "https://example.com/us/blog/my-post",
    "visibility": "public"
  }'
```

## Project Layout

```text
src/app/            Routes and API handlers
src/modules/        Feature-focused storefront components
src/lib/            Medusa client, data access, and shared utilities
content/blog/       Markdown studio journal posts
public/images/      Local images used by posts and the storefront
```

## Related Project

The Medusa backend, including catalog, regions, orders, and the blog module, lives in the sibling `rashadmadisonstore` directory. Start and configure it before running this storefront locally.

## Search indexing

The app serves localized `robots.txt` and `sitemap.xml` routes. The sitemap
includes published storefront pages, blog posts, product categories,
collections, and all published product pages for configured country codes.
Set `NEXT_PUBLIC_BASE_URL` to the canonical production HTTPS origin before
deployment. Account, checkout, and API routes are excluded from crawling.

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>

<h1 align="center">
  The Quintessential Storefront
</h1>

<p align="center">
The customer storefront for Rashad Madison's artwork, prints, apparel, and studio journal.</p>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

### Prerequisites

Run the sibling Medusa backend locally on port 9000 and configure the storefront
environment variables described above before starting this application.

# Overview

The Quintessential storefront is built with:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Medusa](https://medusajs.com/)

Features include:

- Full ecommerce support:
  - Product Detail Page
  - Product Overview Page
  - Product Collections
  - Cart
  - Checkout with Stripe
  - User Accounts
  - Order Details
- Full Next.js 15 support:
  - App Router
  - Next fetching/caching
  - Server Components
  - Server Actions
  - Streaming
  - Static Pre-Rendering

# Quickstart

### Setting up the environment variables

Use the `.env.local` values described in the Local Development section:

```shell
cd rashadmadisonstore-storefront/
```

### Install dependencies

Install the project's npm dependencies.

```shell
npm install
```

### Start developing

You are now ready to start up your project.

```shell
npm run dev
```

### Open the code and start customizing

The storefront runs at http://localhost:8000.

# Payment integrations

The storefront supports Stripe when configured in both the backend and storefront.

- [Stripe](https://stripe.com/)

Set `NEXT_PUBLIC_STRIPE_KEY` in the storefront environment and configure the
backend Stripe provider and webhook secret. See the environment table above and
the backend README for deployment details.

# Resources

## Learn more about Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentation](https://docs.medusajs.com/)

## Learn more about Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)

# Mastodon Cross-Posting

This storefront now supports Mastodon blog sync in two directions:

- Mastodon -> Site: the Blog page automatically pulls recent public posts from your Mastodon profile.
- Site -> Mastodon: a secure API endpoint can publish site-originated posts to Mastodon.

## Gallery display

The gallery excludes clothing using the same apparel detection as product
image galleries: category ID/name/handle, wearable collections, and clothing
titles/handles. Products are not deleted or removed from the apparel page.
Within each artwork category/collection, the five-tile bento layout repeats
for additional products. A final group of fewer than five uses the existing
smaller-group layout without duplicating artwork.
Artwork tiles use fixed responsive heights so source image dimensions cannot
stretch the grid. Full bento groups are capped at 400px tall on desktop;
smaller groups are 320px tall on desktop (280px for four-product rows).

## Required environment variables

Add these to your `.env.local`:

```shell
NEXT_PUBLIC_MASTODON_PROFILE_URL=https://mastodon.social/@rashadmad
MASTODON_API_BASE_URL=https://mastodon.social
MASTODON_ACCOUNT_ACCT=rashadmad

# Required for site -> Mastodon cross-post publishing
MASTODON_ACCESS_TOKEN=<your-mastodon-access-token>
BLOG_CROSSPOST_KEY=<a-long-random-secret>

```

## Newsletter signup endpoint

The storefront accepts newsletter signups at `POST /api/newsletter` and saves
them through the configured Medusa SDK at `POST /store/newsletter`:

```json
{
  "email": "person@example.com",
  "firstName": "First",
  "lastName": "Last",
  "consent": true
}
```

First name, last name, a validly formatted email, and explicit consent are
required. Only a successful save replaces the newsletter section with the
thank-you message. Failures leave the form available to retry.

Use the existing `MEDUSA_BACKEND_URL` and
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; the old `NEWSLETTER_SIGNUP_URL` and
`NEWSLETTER_SIGNUP_KEY` variables are no longer used. Apply the backend's
newsletter migration before accepting signups. Subscriber data is stored in
Medusa, separately from customer accounts; see the backend README for access.
This integration stores signups only; it does not send emails, verify email
ownership, or provide an automated unsubscribe service. Set up your mailing
platform and unsubscribe handling before sending campaigns.

## Cross-post endpoint

Endpoint:

```text
POST /api/mastodon/cross-post
```

Headers:

```text
Content-Type: application/json
x-crosspost-key: <BLOG_CROSSPOST_KEY>
```

Body:

```json
{
  "title": "New post title",
  "content": "Post body text",
  "canonicalUrl": "https://your-site/blog/slug",
  "visibility": "public"
}
```

Example:

```shell
curl -X POST http://localhost:8000/api/mastodon/cross-post \
  -H "Content-Type: application/json" \
  -H "x-crosspost-key: $BLOG_CROSSPOST_KEY" \
  -d '{
    "title": "Studio Update",
    "content": "A new blog update just went live.",
    "canonicalUrl": "https://example.com/us/blog",
    "visibility": "public"
  }'
```
