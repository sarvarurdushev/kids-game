import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  var __gkQueryClient: postgres.Sql | undefined;
}

function createQueryClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // pgbouncer transaction-mode pooling (Supabase's pooled connection) does
  // not support prepared statements.
  return postgres(connectionString, { prepare: false });
}

const queryClient = global.__gkQueryClient ?? createQueryClient();
if (process.env.NODE_ENV !== "production") {
  global.__gkQueryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
