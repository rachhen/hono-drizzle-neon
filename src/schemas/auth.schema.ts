import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../db/schema";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const registerSchema = createInsertSchema(users);
