import { Context, Next } from "hono";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Env } from "../types";

export const dbMiddleware = async (c: Context<Env, never, {}>, next: Next) => {
  const pool = new Pool({ connectionString: c.env.DATABASE_URL });
  const db = drizzle(pool);

  c.set("db", db);

  await next();

  c.executionCtx.waitUntil(pool.end());
};
