import path from "path";
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";

// Module-level cache so we reuse the same connection
// across hot-reloads in dev (Next.js caches modules in dev mode)
let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await open({
    // Resolves to <project-root>/database.sqlite
    filename: path.join(process.cwd(), "database.sqlite"),
    driver: sqlite3.Database,
  });

  // Enable foreign-key enforcement (SQLite disables it by default)
  await db.run("PRAGMA foreign_keys = ON");

  return db;
}