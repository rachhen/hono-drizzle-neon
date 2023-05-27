import { Hono } from "hono";
import { InferModel, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import jwt from "@tsndr/cloudflare-worker-jwt";
import bcrypt from "bcryptjs";

import { Env } from "../types";
import { users } from "../db/schema";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const auth = new Hono<Env>();

type User = InferModel<typeof users, "select">;

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const input = c.req.valid("json");
  const result = await c
    .get("db")
    .select()
    .from(users)
    .where(eq(users.email, input.email));

  if (result.length === 0) {
    throw new HTTPException(400, { message: "Invalid credentials" });
  }

  const isMatch = bcrypt.compare(input.password, result[0].password);
  if (!isMatch) {
    throw new HTTPException(400, { message: "Invalid credentials" });
  }

  const token = await jwt.sign({ id: result[0].id }, c.env.JWT_SECRET_KET);

  const user: User = Object.assign(result[0], { password: undefined });

  return c.json({ accessToken: token, user });
});

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const input = c.req.valid("json");
  const db = c.get("db");

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));

  if (result.length !== 0) {
    throw new HTTPException(400, { message: "Email already taken" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(input.password, salt);

  const newUser = await db
    .insert(users)
    .values({ ...input, password: hashPassword })
    .returning();

  const token = await jwt.sign({ id: newUser[0].id }, c.env.JWT_SECRET_KET);
  const user: User = Object.assign(newUser[0], { password: undefined });

  return c.json({ accessToken: token, user });
});

export default auth;
