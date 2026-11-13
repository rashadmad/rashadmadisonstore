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

## Production Redis on Railway

Create a Redis service in the same Railway project and environment as the
Medusa backend. In the backend's Variables tab, add `REDIS_URL` as a reference
to the Redis service's `REDIS_URL` (for a service named Redis,
`${{Redis.REDIS_URL}}`). Use Railway's private connection; do not expose Redis
publicly or put its credentials in the storefront or Git.

Deploy this configuration along with the variable. Production requires
`REDIS_URL`, including during the build and migrations. The URL configures
Redis-backed sessions, both Medusa cache interfaces, the event bus, workflow
engine, and the default locking provider. Local development and tests retain
Medusa's in-memory defaults when `REDIS_URL` is absent.

Configure persistent storage and backups for the Redis service, and use
`maxmemory-policy noeviction` because workflow and event queues must not be
evicted. This configuration shares one Redis instance between the services;
do not flush it as a way of clearing the cache. Any future Medusa worker
service must use the same database and Redis connection as the server.

After deploying, confirm that `/health` returns `OK` and inspect startup logs
for Redis connection errors. The fake Redis, local event bus, in-memory
default locking, and session MemoryStore warnings should no longer appear.
Do not rotate `JWT_SECRET` or `COOKIE_SECRET` as part of this change.

## S3 product media and one-time catalog migration

The production Medusa database is the source of truth after cutover. Deploying
code does not copy the local catalog. New Admin uploads can use private S3
storage with public image delivery through CloudFront. Existing local images
and database URLs are not moved just by enabling the provider.

### Configure AWS and Railway

Keep S3 **Block Public Access** enabled and use **Bucket owner enforced**
object ownership. Configure CloudFront with the S3 REST origin (not its website
endpoint), OAC, and signed origin requests. Restrict the CloudFront bucket-policy
read statement to these object resources:

```text
arn:aws:s3:::the-quintessential-shop-media/uploads/*
arn:aws:s3:::the-quintessential-shop-media/catalog/*
```

Use the CloudFront service principal and the distribution's exact `AWS:SourceArn`
condition from AWS's generated policy. Do not leave another CloudFront statement
granting `bucket/*` access: the provider stores private files, such as exports,
under `private/`, which must not be readable through the public distribution.
Private files are downloaded with S3 presigned URLs. Preserve unrelated policy
statements; an IAM upload identity and CloudFront OAC have separate permissions.

Give the **backend-only** IAM identity `s3:PutObject`, `s3:GetObject`, and
`s3:DeleteObject` on `uploads/*` and `private/*`, plus
`s3:AbortMultipartUpload` for stream-upload cleanup. The migration uploader needs
`s3:PutObject` and `s3:GetObject` on `catalog/*`. Do not grant account-wide S3 access.
These operations do not need object ACL permissions. If the bucket uses a
customer-managed KMS key, configure the corresponding IAM and CloudFront KMS
permissions separately before enabling uploads.

Set all five variables on the Railway **backend**, then deploy:

```dotenv
S3_BUCKET=the-quintessential-shop-media
S3_REGION=us-east-1
S3_FILE_URL=https://dqzi1n6psq03x.cloudfront.net
S3_ACCESS_KEY_ID=<backend-upload-access-key>
S3_SECRET_ACCESS_KEY=<backend-upload-secret>
```

Temporary AWS credentials also require `S3_SESSION_TOKEN`. Store credentials in
Railway variables or an approved local secret store, never Git or the storefront.
Partial S3 configuration fails explicitly; leaving all five unset preserves
local file storage. The private-S3 provider adapts Medusa 2.13's ACL-based uploader
to an ACL-disabled bucket, including ordinary uploads, multipart streams, and
presigned uploads. Public media gets `uploads/` keys and CloudFront URLs.

Set these variables on the Railway **storefront**, then rebuild:

```dotenv
MEDUSA_CLOUD_S3_HOSTNAME=dqzi1n6psq03x.cloudfront.net
MEDUSA_CLOUD_S3_PATHNAME=/**
```

Keep `MEDUSA_BACKEND_URL` pointed at Medusa, not S3 or CloudFront. Test a new
image upload in production Admin and open its returned CloudFront URL.

### Export and prepare images locally (read-only)

From the backend directory, with its environment pointing at the **local**
database, freeze local catalog edits and run:

```sh
npm run catalog:export -- ./catalog-bundle https://dqzi1n6psq03x.cloudfront.net
npm run catalog:media -- ./catalog-bundle plan
```

The export directory must not already exist. The script reads all pages of
products, variants, base prices (including quantity tiers and region rules),
inventory items/levels, categories and their parents, collections, tags,
shipping profiles, stock locations, and sales-channel relationships. Product
types and all product type assignments are intentionally omitted from the
snapshot; the local source catalog is not changed. A product with exactly one
variant and no options receives a synthetic `Title: Default` option in the
snapshot so Medusa can create it; this does not change the local product. The
export preserves variant-image associations and opaque metadata. Only referenced
inventory items are exported.
It does not export admin users, credentials, keys, customers,
orders, carts, reservations, promotions/price lists, translations, or custom
module records.

Local `/static/` and `/uploads/` image files are copied automatically into the
bundle, deduplicated by SHA-256, and assigned immutable `catalog/<hash>.<extension>`
keys. Product/variant thumbnails, product/variant images, and inventory thumbnails
are rewritten in the snapshot, not in the source database. External HTTPS image
URLs remain unchanged and are not downloaded. If the local backend uses another
origin, pass it as the third export argument. Missing files, unsupported formats
(supported: JPEG, PNG, WebP, GIF, AVIF), files over 30 MiB, invalid references,
nonzero reservations, and unsupported price rules stop the export explicitly.
Products with no shipping profile preserve that absence; configure shipping
before making them purchasable.

Keep the bundle private and outside Git. It may contain business metadata and
stock-location addresses. It includes no database connection strings or admin
credentials. If an export fails, correct the reported problem and use a new
directory; do not treat a partial directory as a completed snapshot.

### Upload images (requires explicit approval)

On the local machine, supply `S3_BUCKET`, `S3_REGION`, and `S3_FILE_URL`, plus
either the S3 credential variables above or AWS SDK credentials from an approved
profile/default credential chain. Do not configure production database access
just to upload media.

```sh
CATALOG_MIGRATION_ALLOW_WRITE=true npm run catalog:media -- ./catalog-bundle apply
npm run catalog:media -- ./catalog-bundle verify
```

The uploader validates local checksums, retries transient AWS failures, skips
matching existing objects, and refuses to overwrite different objects. Both
apply and verify check actual CloudFront response bytes against every migrated
file's SHA-256, not merely HTTP 200. Cached CloudFront errors can temporarily
fail verification; correct the policy or wait for the error cache to expire,
then rerun the same bundle. Existing uploads are not duplicated.

### Dry-run, import, and verify on Railway

Back up production PostgreSQL before importing. Stop destination catalog edits,
inventory changes, and checkout during the migration; run only one importer.
The destination must have no unrelated products. Enable every source price
currency in production Admin. Region-scoped prices require exactly one production
region with matching currency and country set; missing dependencies stop the plan
instead of silently changing prices.

Deploy this code first. Copy **only** `catalog.json` to a private temporary
directory on the running backend (the importer does not need local image files).
For example, Railway supports authenticated SCP using the backend's domain:

```sh
scp ./catalog-bundle/catalog.json rashadmadisonstore-production.up.railway.app@ssh.railway.com:/tmp/catalog.json
```

In the Railway backend SSH shell:

```sh
export PATH="/mise/shims:$PATH"
mkdir -m 700 /tmp/catalog-bundle
mv /tmp/catalog.json /tmp/catalog-bundle/catalog.json
chmod 600 /tmp/catalog-bundle/catalog.json
cd /app
npm run catalog:import -- /tmp/catalog-bundle plan
# Only after reviewing the plan and approving production writes:
CATALOG_MIGRATION_ALLOW_WRITE=true npm run catalog:import -- /tmp/catalog-bundle apply
npm run catalog:import -- /tmp/catalog-bundle verify
```

Do not overwrite an existing temporary snapshot when resuming. Container files
are ephemeral; retain the original bundle locally and transfer it again after
a redeploy if necessary. The script uses Medusa workflows, maps new IDs, reuses
the existing production default sales channel and same-named default shipping profile, and
marks newly created records with source IDs and digests. Rerunning the **same
immutable snapshot** resumes committed work without duplicates. Changed
snapshots, conflicting destination records, or unexpected final data fail
explicitly. Admin users, authentication, and publishable API keys are untouched.
An unset default sales channel/location is initialized from the migrated catalog;
existing defaults are not overwritten.

Final verification compares catalog values and relationships, variant prices,
quantities, inventory kits, image URLs and variant-image associations. This is
a one-time initial import, **not** an ongoing synchronization or rollback tool.
Medusa displays images with no variant links on every variant. The importer
creates explicit links for images visible on only some variants and stops rather
than removing unexpected existing links.
Recover unexpected partial migrations from a reviewed backup rather than
manually deleting records indiscriminately.

Before opening the store, link the existing production publishable key to the
appropriate sales channels, configure production regions/taxes/payment providers,
and associate warehouse fulfillment providers/service zones. Shipping profiles
are copied, but shipping options and fulfillment configuration are not. Then run
the existing `setup:profile-shipping` command after reviewing its prerequisites,
verify shipping-profile rates, and test a cart, shipping calculation, stock
availability, and checkout using test payments. Once verified, stop maintaining
the local catalog and manage new products/images in production Admin.

### Targeted validation

```sh
npm run test:unit -- --runTestsByPath src/lib/__tests__/s3-config.unit.spec.ts src/modules/private-s3/__tests__/service.unit.spec.ts src/lib/catalog-migration/__tests__/migration.unit.spec.ts src/lib/catalog-migration/__tests__/media.unit.spec.ts
npm run test:integration:http -- --runTestsByPath integration-tests/http/catalog-migration.spec.ts
```

The integration test uses a uniquely named disposable database. Configure
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` for a **local/test**
PostgreSQL account that can create test databases; do not use the production
database. It verifies real Medusa relationships, repeat imports, and preservation
of users and publishable keys. Redis and AWS providers are disabled for this test.

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
