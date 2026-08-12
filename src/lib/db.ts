import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Phase 1 uses SQLite via the better-sqlite3 driver adapter, pointed at
// DATABASE_URL (see .env / .env.example). Swapping to Postgres for Phase 2
// means swapping this adapter for @prisma/adapter-pg and changing the
// datasource provider in prisma/schema.prisma, nothing else in the app
// depends on which database is behind it.
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });

// Reuse a single PrismaClient across hot reloads in dev, Next.js otherwise
// re-imports this module on every change and exhausts SQLite's connection.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
