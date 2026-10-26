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
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## Newsletter subscribers

The `newsletter` module stores newsletter signups separately from customer
accounts. From this backend directory run `npx medusa db:migrate`, then restart
Medusa after deploying. The migration creates `newsletter_subscriber` with a
unique email, first/last names, subscription status, signup source, consent
timestamp, and creation/update timestamps.

`POST /store/newsletter` accepts `firstName`, `lastName`, `email`, and
`consent: true` using the storefront's existing Medusa publishable key. The
backend trims names, normalizes email to lowercase, validates lengths and email
format, and records consent. Duplicate signups return the same generic success
without changing existing data or reactivating unsubscribed records.

Authenticated administrators can read subscribers at
`GET /admin/newsletter?limit=50&offset=0`. The response contains `subscribers`,
`count`, `offset`, and `limit`; limit is capped at 100. This is an API endpoint,
not a new Admin dashboard screen. Public signups never return subscriber data.

This feature stores signups only. It does not send newsletters, verify email
ownership, or implement automated unsubscribe links. Before sending campaigns,
connect a mailing platform and provide unsubscribe handling; honor opt-out
requests by updating the subscriber status to `unsubscribed`.

## Chicago-area free shipping

### Automatic USPS checkout shipping

The storefront now assigns shipping automatically rather than asking customers
to select a carrier or service. Register the profile-shipping provider by
restarting the backend after deployment, then run `npm run setup:profile-shipping`.
The setup command is safe to rerun and creates one calculated USPS option per
existing shipping profile in the single configured US shipping service zone.
It does not modify products or delete existing options.

Base USD packaging rates are configured in `src/lib/profile-shipping.ts`:

| Shipping profile | Base rate |
| --- | ---: |
| Risograph print | $9.50 |
| Risograph Print tabloid | $9.50 |
| ScreenPrint stretched | $22.00 |
| ScreenPrint framed | $26.50 |
| Risograph Print Framed | $14.00 |
| Small Bag | $6.25 |
| bag | $5.75 |

Each purchased unit counts separately. Units are sorted by base shipping rate,
highest first, and charged at full price, half price, then free, repeating from
the fourth unit. Half-price charges round to the nearest cent, with half cents
rounded up. Three $9.50-profile prints therefore ship for $14.25; four ship for
$23.75. Equal-rate ties use profile and line-item IDs for stable allocation.
Eligible Chicago-area addresses receive $0 shipping for every profile.

The backend computes and persists a separate method for each required profile;
checkout displays their combined charge. Cart changes refresh calculated method
prices, and completion rejects missing or stale charges. A newly added profile
must have a rate configured here and an option created by the setup command.
Missing rates or ambiguous options block shipping with an explicit error rather
than silently offering free shipping. Changes to old flat-rate options in Admin
do not alter these calculated rates.

These are store-defined shipping charges, not live USPS quotes. The provider
does not purchase postage, generate labels, or provide delivery guarantees.
Fulfillment and USPS labels remain handled by the store.

The older local-only setup below can bootstrap a new store's location/channel
links before running the automatic shipping setup.

After deploying the backend, run `npm run setup:chicago-shipping` from this
directory against the store database, then restart the backend. The command
creates a **Free Local Shipping - Eligible Chicago-Area ZIP Codes** option at
USD 0 for each existing US manual-shipping service-zone/shipping-profile
combination. It is safe to
rerun and leaves paid shipping, express shipping, pickup, and returns unchanged.
For stores with no shipping options, the command creates a US service zone and
free options for all existing shipping profiles, using the single existing stock
location. It links that location to the manual fulfillment provider and the
default sales channel (or the only sales channel). No paid rate is invented.
Stores with multiple stock locations must first configure a US manual-shipping
option for the intended location. Existing shipping configurations are reused.
Cart delivery options are fetched without caching so newly configured options
and changes to address eligibility appear immediately on checkout refresh.

Customers select the free option during checkout; no coupon or minimum purchase
is required. Eligibility uses the **shipping** address, not the billing address:
US addresses with a ZIP code associated with Cook, DuPage, Kane, Lake, McHenry,
or Will county in Illinois qualify. ZIP+4 is supported. An omitted state is
allowed because the ZIP identifies Illinois; a conflicting state is rejected.
The backend checks eligibility both when listing options and when selecting or
refreshing a shipping method. Changing to an ineligible address removes the
selected free option and requires choosing another delivery method.

The ZIP allowlist in [chicago-shipping.ts](src/lib/chicago-shipping.ts) is derived
from [GeoNames US postal data](https://download.geonames.org/export/zip/US.zip),
retrieved October 20, 2026, under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit:
[GeoNames](https://www.geonames.org/). It uses Illinois county codes 031, 043,
089, 097, 111, and 197. This is a ZIP-based service area, not street-level county
verification: ZIP boundaries may cross county lines. Review the allowlist when
postal boundaries change. No customer address is sent to an external lookup
service.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Build with AI Agents

### Claude Code Plugin

If you use AI agents like Claude Code, check out the [medusa-dev Claude Code plugin](https://github.com/medusajs/medusa-claude-plugins).

### Other Agents

If you use AI agents other than Claude Code, copy the [skills directory](https://github.com/medusajs/medusa-claude-plugins/tree/main/plugins/medusa-dev/skills) into your agent's relevant `skills` directory.

### MCP Server

You can also add the MCP server `https://docs.medusajs.com/mcp` to your AI agents to answer questions related to Medusa. The `medusa-dev` Claude Code plugin includes this MCP server by default.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
