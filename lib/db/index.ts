import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

const dbPath = process.env.DATABASE_URL || "./local.db";
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
