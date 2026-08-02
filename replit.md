# SplitTab

A bill-splitting web app for groups of friends. Create groups, add members, log shared expenses with flexible split modes (equal, by amount, or by shares), track who paid what, and see exactly who owes whom with one-click settlement suggestions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/splits run dev` — run the frontend (uses PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run after schema/codegen changes)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, React Query, Wouter, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v3 via catalog, `zod/v4` in db schema), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM table definitions (groups, members, expenses, payments)
- `artifacts/api-server/src/routes/` — Express route handlers (groups, members, expenses, payments, balances)
- `artifacts/splits/src/pages/` — React pages (groups list, group dashboard, expense form, expense detail)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not hand-edit)
- `lib/api-zod/src/generated/` — generated Zod validators used by the server (do not hand-edit)

## Architecture decisions

- OpenAPI-first: all API contracts defined in `openapi.yaml`, then codegen produces typed hooks and Zod validators
- `type: integer` fields are written as `type: number` in the OpenAPI spec — Orval v8 generates `zod.int()` for integers but zod v3 (catalog version) does not have that method
- Query params on list endpoints can cause `ListXxxParams` TS2308 collisions; date filtering is done client-side
- Balances computed on-the-fly from expenses + payments (no materialized balance table) — greedy debt-simplification algorithm for settlement suggestions
- Toast component uses lucide-react `X` icon instead of `@radix-ui/react-icons` (not installed)

## Product

- Groups: create/rename/delete groups, set currency
- Members: add/remove members from a group
- Expenses: log an expense with title, amount, date, payer, optional product size, and a split (equal / by amount / by shares)
- Payments: record a cash/transfer settlement between two members
- Balances: see each member's net balance (positive = gets money back, negative = owes)
- Settlements: suggested minimal transactions to clear all debts in the group
- Group summary: total spent, member count, expense count, recent activity

## User preferences

_Populate as needed._

## Gotchas

- After any `lib/*` schema or codegen change, run `pnpm run typecheck:libs` before checking artifact packages — stale lib declarations cause false `@workspace/db` export errors
- `pnpm --filter @workspace/db run push` only affects dev; production schema is managed by Replit Publish flow
- `toast.tsx` in the splits artifact uses `lucide-react X` — do not reintroduce `@radix-ui/react-icons`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
