# Workplace Support Passport

A workplace adjustments passport tool: employees complete a diagnosis-free questionnaire about what helps them work well, and can choose to share the result with their manager, HR, or Occupational Health. Licensed to organisations, each running their own single-tenant instance. See `CLAUDE.md` for the full product spec, data model and build order.

## Status

Phase 1, build step 1 complete: Next.js app scaffolded, database schema in place (SQLite for now, see `CLAUDE.md`), Prisma wired up end to end. No UI beyond a scaffold-verification home page yet, that's build step 2.

## Getting started

```bash
npm install          # also runs `prisma generate` via postinstall
cp .env.example .env # DATABASE_URL defaults to a local SQLite file
npm run db:migrate    # creates/updates dev.db from prisma/schema.prisma
npm run dev
```

Visit `http://localhost:3000`, it should report the app is connected to the database.

## Scripts

- `npm run dev` / `build` / `start` / `lint`, standard Next.js scripts.
- `npm run db:migrate`, runs `prisma migrate dev` (creates a new migration if the schema changed, applies pending ones).
- `npm run db:studio`, opens Prisma Studio to browse the local database.

## Database

Schema lives in `prisma/schema.prisma`, mirrors the data model documented in `CLAUDE.md`. Phase 1 runs on SQLite via the `@prisma/adapter-better-sqlite3` driver adapter (see `src/lib/db.ts`). Switching to Postgres for Phase 2 means changing the `datasource` provider in the schema and swapping the driver adapter, the rest of the app talks to Prisma Client either way.
