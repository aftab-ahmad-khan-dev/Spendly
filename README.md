# Spendly

A quiet expense ledger built on MERN MongoDB, Express, React (Vite), Node with Clerk for auth and Groq for the AI assistant.

## Project layout

```
spendly-project/
├── server/            Node + Express + Mongoose API
│   └── src/
│       ├── config/    db + env
│       ├── models/    *.model.js (User, Category, Expense, Budget, Alert)
│       ├── routes/    *.route.js
│       ├── controllers/  *.controller.js
│       ├── services/     groq.service.js, budget.service.js, seed.service.js
│       ├── middlewares/  auth.middleware.js, error.middleware.js
│       ├── utils/        logger, asyncHandler, ApiError, dates
│       ├── app.js
│       └── server.js
└── client/            Vite + React + Tailwind + Clerk
    └── src/
        ├── api/        axios + react-query hooks
        ├── components/ layout, dashboard, expenses, ai, ui (shadcn)
        ├── pages/      Landing, Dashboard, Expenses, Categories, Budgets, Alerts
        ├── hooks/
        ├── lib/
        ├── App.tsx
        └── main.tsx
```

## Setup

### 1. Server

```bash
cd server
npm install
# .env already has MongoDB URI + Groq key + Clerk publishable key.
# Add your Clerk secret key (sk_test_…) to .env
npm run dev
```

Runs on `http://localhost:4000`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Environment variables

### server/.env

| Var                     | Required     | Notes                                 |
| ----------------------- | ------------ | ------------------------------------- |
| `PORT`                  |              | default `4000`                        |
| `CLIENT_ORIGIN`         |              | default `http://localhost:5173`       |
| `DATABASE`              | yes          | MongoDB connection string             |
| `CLERK_SECRET_KEY`      | yes          | Backend verifies Clerk session tokens |
| `CLERK_PUBLISHABLE_KEY` |              | optional, mirrors the client          |
| `GROQ_API_KEY`          | yes (for AI) | Groq API key for chat completions     |
| `GROQ_MODEL`            |              | default `llama-3.3-70b-versatile`     |

### client/.env

| Var                          | Required | Notes                               |
| ---------------------------- | -------- | ----------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | yes      | `pk_test_...`                       |
| `VITE_API_URL`               |          | default `http://localhost:4000/api` |

## API surface

| Method                   | Path                     | Purpose                              |
| ------------------------ | ------------------------ | ------------------------------------ |
| GET                      | `/api/health`            | Liveness check                       |
| GET/POST/PATCH/DELETE    | `/api/categories`        | CRUD on categories                   |
| GET/POST/PATCH/DELETE    | `/api/expenses`          | CRUD on expenses                     |
| GET/POST/DELETE          | `/api/budgets`           | List, upsert, delete monthly budgets |
| GET + POST read/read-all | `/api/alerts`            | Alert feed + mark-read               |
| GET                      | `/api/dashboard/summary` | Aggregated overview                  |
| POST                     | `/api/ai/parse-expense`  | Groq: log an expense from plain text |
| POST                     | `/api/ai/advisor`        | Groq: answer a spending question     |

All routes behind `/api` (except `/api/health`) require a Clerk session token.

## Deploying to Vercel

Deploy as **two separate Vercel projects** — one from the `server/` folder, one from `client/`. Vite itself handles the client build (`vite build`); there's no `build.mjs`.

### Server project

1. On Vercel, **Add New Project** → import this repo → set **Root Directory** to `server`.
2. Framework Preset: `Other` (Vercel picks it up from `server/vercel.json`).
3. **Environment Variables** (Production, Preview, Development):
   | Key | Value |
   | --- | --- |
   | `DATABASE` | your MongoDB Atlas URI |
   | `CLERK_SECRET_KEY` | `sk_live_...` (or `sk_test_...`) |
   | `CLERK_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...`) |
   | `GROQ_API_KEY` | your Groq key |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` |
   | `CLIENT_ORIGIN` | your client URL(s), comma-separated — e.g. `https://spendly-client.vercel.app` |
4. Deploy. Test `https://<server-url>/api/health` → `{ "status": "ok" }`.

The Express app is exposed as a single serverless function at `server/api/index.js`. All paths are rewritten to it via `server/vercel.json`. Mongoose uses a global connection cache so warm lambdas reuse the socket.

### Client project

1. **Add New Project** → import repo → set **Root Directory** to `client`.
2. Framework Preset: Vite (auto-detected; `client/vercel.json` locks it in).
3. **Environment Variables**:
   | Key | Value |
   | --- | --- |
   | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
   | `VITE_API_URL` | your deployed server URL + `/api` (e.g. `https://spendly-server.vercel.app/api`) |
4. Deploy.

### MongoDB Atlas — required network setting

Vercel serverless IPs are dynamic. In Atlas → **Network Access**, add `0.0.0.0/0` (or Atlas's "Allow access from anywhere"). The Mongo URI in `DATABASE` already scopes the user's permissions, so this is safe.

### Clerk — production setup

When you move from `pk_test_...` to `pk_live_...`, add your Vercel domains to Clerk's **Allowed Origins** in the Clerk Dashboard (under Domains). Without this, tokens from the client won't validate.
