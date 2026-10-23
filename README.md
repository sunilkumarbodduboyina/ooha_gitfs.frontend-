# Ooha Gifts

Full-stack e-commerce app for personalised gifts: a React/Vite storefront with an
admin dashboard, backed by an Express REST API and MySQL.

| Part | Stack | Local URL | Production |
| --- | --- | --- | --- |
| Frontend | React 18, Vite 5, React Router, Framer Motion | http://localhost:5173 | https://ooha-gitfs-frontend.vercel.app |
| Backend | Node.js, Express 4, MySQL (`mysql2`), JWT | http://localhost:5000 | https://ooha-gifts-backend.onrender.com |
| Database | MySQL 8 | XAMPP on port 3306 | Hosted MySQL (see [Render](#render-backend)) |

## Repository layout

```
.
├── frontend/            # Vite + React storefront and admin UI
│   ├── src/
│   ├── public/
│   ├── .env             # local API URL (not committed)
│   └── .env.production  # public production API URL (committed)
├── backend/             # Express API
│   ├── config/db.js     # MySQL pool (DB_* or DATABASE_URL, TLS support)
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── setup/init.js    # schema + seed data
│   ├── test/            # node:test suites
│   └── uploads/         # runtime image uploads (git-ignored)
├── .github/workflows/   # CI: backend tests + frontend build
├── render.yaml          # Render Blueprint for the API
└── vercel.json          # Vercel build config
```

## Local development

Prerequisites:

- Node.js 20 or newer
- MySQL 8 (XAMPP, Docker, or a local server) on `localhost:3306`

### 1. Database

Start MySQL (with XAMPP: `C:\xampp\mysql_start.bat`) and make sure the `root`
account is reachable. The backend can also use a hosted MySQL instead — see the
environment variables below.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env with your DB credentials and a strong JWT_SECRET
npm run setup               # creates the schema and seeds demo data
npm run dev                 # http://localhost:5000
```

`npm run setup` is safe to re-run: tables use `CREATE TABLE IF NOT EXISTS` and
seeding is skipped once products exist. To re-seed from scratch, drop the
`ooha_gifts` database first.

The initial admin account is configurable through `ADMIN_NAME`, `ADMIN_EMAIL`,
and `ADMIN_PASSWORD` when running `npm run setup`. If they are not set, the demo
account is `admin@oohagifts.com` / `admin123` — always override this in
production.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

`frontend/.env` points the app at the local API:

```dotenv
VITE_API_URL=http://localhost:5000
```

Vite also proxies `/api` and `/uploads` to `VITE_API_TARGET` (falling back to
`VITE_API_URL`), so relative requests work in development.

### 4. Verify

- API health: http://localhost:5000/api/health → `{"success":true,"db":"up",...}`
- Storefront: http://localhost:5173

### Tests

```bash
cd backend
npm test
```

CI (`.github/workflows/ci.yml`) runs these tests and a production frontend build
on every push and pull request.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5000`. |
| `CORS_ORIGIN` | No | Comma-separated allowed origins, or `*`. |
| `DB_HOST` / `DB_PORT` | Yes* | MySQL host and port. |
| `DB_USER` / `DB_PASSWORD` | Yes* | MySQL credentials. |
| `DB_NAME` | No | Database name. Defaults to `ooha_gifts`. |
| `DATABASE_URL` | Alternative* | `mysql://user:pass@host:3306/db`. Used when `DB_*` values are unset. |
| `DB_SSL` | No | `true`/`false`. Defaults to on for remote hosts, off for localhost. |
| `DB_SSL_CA` | No | PEM text or path to a CA file. |
| `DB_SSL_REJECT_UNAUTHORIZED` | No | Set `true` to verify the server certificate. |
| `JWT_SECRET` | Yes | Long random string used to sign auth tokens. |
| `JWT_EXPIRES` | No | Token lifetime. Defaults to `7d`. |
| `FRONTEND_URL` | No | Public frontend URL used in links/emails. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | No | Payments. Without keys, checkout runs in simulated test mode. |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Transactional email. |
| `WHATSAPP_NUMBER` | No | Support number, country code without `+`. |
| `GROQ_API_KEY` | No | Reserved for the bundled Groq SDK; not used by the current API. |
| `GROWW_ACCESS_TOKEN` | No | Groww market-data integration. |

\* Provide either the discrete `DB_*` values or `DATABASE_URL`.

Never commit `backend/.env` — it is git-ignored.

### Frontend

| File | Variable | Description |
| --- | --- | --- |
| `frontend/.env` | `VITE_API_URL` | Local API base URL. Not committed. |
| `frontend/.env.production` | `VITE_API_URL` | Production API base URL. Committed; contains no secrets. |

After changing the production API URL, redeploy the frontend so Vite rebuilds
with the new value.

## Deployment

### GitHub

`main` is the deploy branch. Push to it and Vercel builds automatically; Render
deploys from the blueprint below once you have applied it.

### Vercel (frontend)

`vercel.json` builds only the frontend:

- Install: `cd frontend && npm ci`
- Build: `cd frontend && npm run build`
- Output: `frontend/dist`

Production URL: https://ooha-gitfs-frontend.vercel.app

No environment variables are required in Vercel unless you override the API URL
from `frontend/.env.production`.

### Render (backend)

`render.yaml` is a Render Blueprint for the API (Node runtime, root directory
`backend`, free plan, Singapore region, health check `/api/health`).

1. Render Dashboard → **New + → Blueprint** → select this repository.
2. Fill in the prompted values: `DB_HOST`, `DB_USER`, `DB_PASSWORD` (and
   `DB_PORT` if it is not `3306`). `JWT_SECRET` is generated automatically.
3. Optional integrations (`RAZORPAY_*`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `WHATSAPP_NUMBER`, `GROQ_API_KEY`, `GROWW_ACCESS_TOKEN`) can be left blank
   and added later under the service's **Environment** tab.
4. Wait for the deploy, then confirm
   `https://<service>.onrender.com/api/health` returns `"db":"up"`.

Set `CORS_ORIGIN` and `FRONTEND_URL` to your real frontend origin (the blueprint
defaults to the Vercel URL above). If you use a custom domain, update both.

If the service name `ooha-gifts-backend` is already taken by an older service,
delete or rename that service first. Renaming changes the public URL, so also
update `frontend/.env.production`, `vite.config.js`, and `CORS_ORIGIN`.

### Preparing the production database

Use any hosted MySQL provider (for example Aiven, Railway, or TiDB Serverless).
Create an empty database, then seed it once from your machine:

```powershell
cd backend
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/ooha_gifts"
$env:DB_SSL="true"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="use-a-strong-password"
node setup/init.js
```

Discrete `DB_*` variables work as well. The script enables TLS for remote hosts
by default, and falls back to the existing database when the plan does not allow
`CREATE DATABASE`.

Then set the same connection values on Render and redeploy so the API can reach
the database.

### Operational notes

- **Free Render services sleep** after inactivity; the first request after a
  nap can take up to a minute.
- **Uploads are ephemeral** on the free plan. Admin-uploaded images live in
  `backend/uploads`, which is wiped on redeploy. Attach a persistent disk (paid
  plan) or move uploads to object storage before relying on them in production.
- **Payments** run in simulated mode unless Razorpay keys are configured.
- The API sets `Cache-Control` revalidation headers for public `GET` routes and
  gzips JSON responses; private routes (auth, cart, wishlist, orders, admin)
  are never shared-cached.

## Common commands

| Command | Location | Purpose |
| --- | --- | --- |
| `npm run dev` | `backend/` | Start the API with Node. |
| `npm run setup` | `backend/` | Create schema and seed data. |
| `npm test` | `backend/` | Run the backend test suite. |
| `npm run dev` | `frontend/` | Start the Vite dev server. |
| `npm run build` | `frontend/` | Production build into `frontend/dist`. |
| `npm run preview` | `frontend/` | Preview the production build locally. |

## License

Private project. All rights reserved.
