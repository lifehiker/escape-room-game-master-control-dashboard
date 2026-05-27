import path from "path";

import { PrismaClient } from "@prisma/client";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
declare global {
  var prisma: PrismaClient | undefined;
}

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return `file:${path.join(process.cwd(), "prisma/dev.db")}`;
  }

  if (databaseUrl.startsWith("file:./")) {
    return `file:${path.join(process.cwd(), "prisma", databaseUrl.replace("file:./", ""))}`;
  }

  return databaseUrl;
}

export const db =
  global.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
    datasources: {
      db: {
        url: getRuntimeDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
