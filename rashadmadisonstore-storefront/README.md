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
```

Start the storefront:

```shell
npm run dev
```

The application runs at [http://localhost:8000](http://localhost:8000). Requests without a country code are redirected to the configured Medusa region, such as `/us`.

## Environment Variables

| Variable                                      | Required | Purpose                                                                                   |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `MEDUSA_BACKEND_URL`                          | Yes      | URL of the Medusa backend. Local default: `http://localhost:9000`.                        |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`          | Yes      | Medusa publishable API key used by the storefront and middleware.                         |
| `NEXT_PUBLIC_DEFAULT_REGION`                  | No       | Region used when a visitor's country cannot be determined. Defaults to `us`.              |
| `NEXT_PUBLIC_BASE_URL`                        | No       | Public storefront URL used when constructing links. Defaults to `https://localhost:8000`. |
| `NEXT_PUBLIC_STRIPE_KEY`                      | No       | Stripe publishable key for Stripe checkout.                                               |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY` | No       | Alternative Medusa payment publishable key.                                               |
| `NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID`      | No       | Medusa payment account identifier.                                                        |
| `NEXT_PUBLIC_MASTODON_PROFILE_URL`            | No       | Public Mastodon profile URL shown with imported posts.                                    |
| `MASTODON_API_BASE_URL`                       | No       | Mastodon instance API URL. Defaults to `https://mastodon.social`.                         |
| `MASTODON_ACCOUNT_ACCT`                       | No       | Mastodon account handle to read. Defaults to `rashadmad`.                                 |
| `MASTODON_ACCESS_TOKEN`                       | No       | Server-only token required to publish a post to Mastodon.                                 |
| `BLOG_CROSSPOST_KEY`                          | No       | Server-only shared secret protecting the Mastodon cross-post endpoint.                    |

Never commit `.env.local` or any access tokens.

## Scripts

```shell
npm run dev            # Start the local server on port 8000
npm run build          # Create a production build
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
  Medusa Next.js Starter Template
</h1>

<p align="center">
Combine Medusa's modules for your commerce backend with the newest Next.js 15 features for a performant storefront.</p>

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

To use the [Next.js Starter Template](https://medusajs.com/nextjs-commerce/), you should have a Medusa server running locally on port 9000.
For a quick setup, run:

```shell
npx create-medusa-app@latest
```

Check out [create-medusa-app docs](https://docs.medusajs.com/learn/installation) for more details and troubleshooting.

# Overview

The Medusa Next.js Starter is built with:

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

Navigate into your projects directory and get your environment variables ready:

```shell
cd nextjs-starter-medusa/
mv .env.template .env.local
```

### Install dependencies

Use Yarn to install all dependencies.

```shell
yarn
```

### Start developing

You are now ready to start up your project.

```shell
yarn dev
```

### Open the code and start customizing

Your site is now running at http://localhost:8000!

# Payment integrations

By default this starter supports the following payment integrations

- [Stripe](https://stripe.com/)

To enable the integrations you need to add the following to your `.env.local` file:

```shell
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-public-key>
```

You'll also need to setup the integrations in your Medusa server. See the [Medusa documentation](https://docs.medusajs.com) for more information on how to configure [Stripe](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe#main).

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
