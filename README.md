# Casego

Online store for Casego, built on Next.js and backed by the
[dukonline.uz](https://dukonline.uz) ERP. Products, prices, stock, categories
and banners are all managed in the ERP; this app is a read-only storefront over
that data plus an order-submission path.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the storefront key
npm run dev
```

### The storefront key

Every dukonline storefront talks to the **same** API host. There is no
per-store API URL — the tenant is selected entirely by the `X-Storefront-Key`
request header:

```ini
DUKONLINE_API_URL=https://api.dukonline.uz/api
DUKONLINE_STOREFRONT_KEY=<per-store key>
```

Get the key from the **ERP SuperAdmin panel → organization → Online Store**.
The key is never sent to the browser: it is read server-side only.

Without a valid key the site still builds and serves; every page renders a
notice explaining what is missing instead of failing.

## The API

The storefront API exposes exactly six endpoints. There is **no** per-product
endpoint, **no** category endpoint, **no** pagination and **no** server-side
search — everything else is derived from the one catalog call.

| Endpoint | Purpose |
| --- | --- |
| `GET /storefront/info/` | Store name, display currency, banners |
| `GET /storefront/products/` | The entire catalog in one response |
| `GET /storefront/top-products/?limit=` | Best-seller IDs only |
| `POST /storefront/login/` | Customer code → customer record |
| `GET /storefront/customer/?code=` | Debt, balance, purchase history |
| `POST /storefront/orders/` | Place an order |

Passing `?customer_code=` to the catalog applies that customer's price tier,
which makes the response personal and therefore uncacheable.

`top-products` and the banner list are both driven by ERP state: best sellers
come from recorded sales, banners from **Online do'kon → Bannerlar**. Both are
empty for this store today, so the home page hides the best-seller strip and
shows a typographic hero in place of the carousel. Neither needs a code change
once the ERP has data.

## Architecture

```text
src/
  app/
    page.tsx              Home — banners, categories, best sellers, new arrivals
    catalog/              Search + category filtering (server-side, over the cached catalog)
    product/[id]/         Product detail; pre-rendered per product via generateStaticParams
    cart/ checkout/ account/
    api/                  Server-side proxies for login, customer and orders
  components/             UI, split between server and client components
  lib/
    storefront/           API client, types, catalog derivation, currency, display helpers
    cart/ customer/       localStorage-backed state read via useSyncExternalStore
```

Key decisions:

- **The key stays on the server.** All catalog reads happen in server
  components and all writes go through `/api/*` route handlers, so the key
  never reaches the browser bundle. (It is a publishable key — the API sends
  `Access-Control-Allow-Origin: *` — but keeping it server-side is what lets
  the catalog be cached and statically rendered.)
- **Every product gets a real URL.** `generateStaticParams` pre-renders a page
  per product with its own `<title>`, description and Open Graph tags. The
  catalog is fetched once and cached for 60 seconds (ISR).
- **Categories are derived, not fetched.** The API returns no tree; it is
  rebuilt from each product's `category_id` / `category_parent_id`.
- **Search and filtering run over the cached catalog** on the server, because
  the API offers neither.
- **Prices are multi-currency and never converted client-side.** A product's
  currency may be empty, meaning "the store's base currency"; the store reports
  its currency as a symbol while products use codes. Cart totals are summed per
  currency and shown side by side (`$52 + 300 000 so'm`).
- **Several ways into the cart** — a plain unit or a variant, each with its
  own cart-line identity, so one product can appear as several lines. The
  client also models individual phones (IMEI) and phone spec buckets, which the
  ERP supports but this catalog does not currently use.
- **Images are merchant-supplied and unvalidated.** Any host is permitted in
  `next.config.ts`, and `SafeImage` falls back to a placeholder rather than
  letting one malformed URL throw during render and 500 the page.

## Commands

```bash
npm run dev     # development server
npm run build   # production build (pre-renders every product page)
npm start       # serve the production build
npm run lint    # eslint
```

## Deployment

Deploys to Vercel. Set `DUKONLINE_API_URL` and `DUKONLINE_STOREFRONT_KEY` as
environment variables on the project — they are read at request/build time, not
baked into the client.
