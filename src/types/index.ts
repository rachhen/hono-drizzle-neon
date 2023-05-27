import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { User } from "../db/schema";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET_KET: string;
};

type Variables = {
  db: NeonDatabase<Record<string, never>>;
  user: User;
};

export type Env = { Bindings: Bindings; Variables: Variables };
