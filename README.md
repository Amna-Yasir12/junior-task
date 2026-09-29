# Junior Developer Task — Medusa Store (Reference Solution)

A small headless-commerce project built for the junior assessment. It has two apps in one
workspace:

- **`apps/backend`** — a Medusa v2 server (commerce engine + Admin + Store API), backed by PostgreSQL.
- **`apps/storefront`** — a Next.js page that fetches products from the backend's Store API and displays them.

```
junior-medusa-task/
├─ apps/
│  ├─ backend/       # Medusa v2 server, migrations, seed script, custom API route
│  └─ storefront/    # Next.js app: product list + product detail
├─ package.json      # npm workspaces root
└─ README.md
```

---

## Prerequisites

- **Node.js 20+**
- **PostgreSQL** running locally (create an empty database, e.g. `medusa_junior`)
- npm 10+

---

## 1. Install

From the repo root (installs both apps via workspaces):

```bash
npm install
```

---

## 2. Configure environment variables

### Backend
```bash
cd apps/backend
cp .env.example .env
```
Edit `.env` and set your `DATABASE_URL`, e.g.:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa_junior
```

### Storefront
```bash
cd apps/storefront
cp .env.example .env.local
```
Leave the defaults unless your backend runs on a different port.

---

## 3. Run migrations + seed sample data

From the repo root:

```bash
# create the database tables
npm run build:backend
cd apps/backend
npx medusa db:migrate

# seed sample products, region and currency
npm run seed
```

Or from the root shortcut once migrated:
```bash
npm run seed
```

This creates a region (US / USD), a sales channel, a publishable API key, and a handful of
sample products with prices and images.

> After seeding, the console prints a **publishable API key**. Copy it into the storefront's
> `.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (see step 5).

---

## 4. Start the backend

```bash
npm run dev:backend
```

- Store API: `http://localhost:9000`
- Admin: `http://localhost:9000/app`

Create your admin user if prompted:
```bash
cd apps/backend
npx medusa user -e admin@example.com -p supersecret
```

---

## 5. Start the storefront

In a second terminal, put the publishable key from step 3 into `apps/storefront/.env.local`:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...   # from the seed output
```

Then:
```bash
npm run dev:storefront
```

Open **http://localhost:8000** — you should see the product grid, loaded live from the backend.
Click a product to open its detail page.

---

## What this project demonstrates

| Requirement | Where |
|---|---|
| Medusa v2 backend on PostgreSQL | `apps/backend/medusa-config.ts` |
| Migrations create the schema | `npx medusa db:migrate` |
| Sample products + region/currency seeded | `apps/backend/src/scripts/seed.ts` |
| Admin usable | `http://localhost:9000/app` |
| Custom API route (goes beyond defaults) | `apps/backend/src/api/store/custom-greeting/route.ts` |
| Frontend fetches from the Store API (not hard-coded) | `apps/storefront/lib/medusa.ts`, `app/products/page.tsx` |
| Loading + empty + error states | `app/products/page.tsx` |
| Product detail view (optional extra) | `app/products/[handle]/page.tsx` |
| Env vars, no secrets committed | `.env.example` files |
| TypeScript throughout | all `.ts` / `.tsx` files |

---

## Notes / decisions

- The storefront reads products through the official `@medusajs/js-sdk`, using a publishable
  API key — the frontend never touches the database directly.
- Prices, currency and images all come from Medusa, so changing them in the Admin updates the
  storefront with no code change.
- Styling is intentionally simple (a responsive CSS grid) to keep focus on the data flow.
