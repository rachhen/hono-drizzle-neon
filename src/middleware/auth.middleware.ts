import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import jwt from "@tsndr/cloudflare-worker-jwt";

import { Env } from "../types";
import { User, users } from "../db/schema";
import { eq } from "drizzle-orm";

export const requiredAuth = () => async (c: Context<Env>, next: Next) => {
  const credentials = c.req.headers.get("Authorization");
  let token;
  if (credentials) {
    const parts = credentials.split(/\s+/);
    if (parts.length !== 2) {
      const res = new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_request",error_description="invalid credentials structure"`,
        },
      });
      throw new HTTPException(401, { res });
    } else {
      token = parts[1];
    }

    if (!token) {
      const res = new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_request",error_description="no authorization included in request"`,
        },
      });
      throw new HTTPException(401, { res });
    }

    try {
      if (await jwt.verify(token, c.env.JWT_SECRET_KET)) {
        const { payload } = jwt.decode(token); // payload: { id: number; iat: number }
        const result = await c
          .get("db")
          .select()
          .from(users)
          .where(eq(users.id, payload.id));

        if (result.length === 0) {
          const res = new Response("Unauthorized", {
            status: 401,
            headers: {
              "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_token",error_description="token verification failure"`,
            },
          });
          throw new HTTPException(401, { res });
        }

        const user: User = Object.assign(result[0], { password: undefined });
        c.set("user", user);
      }
    } catch (error) {
      const res = new Response("Unauthorized", {
        status: 401,
        statusText: `${error}`,
        headers: {
          "WWW-Authenticate": `Bearer realm="${c.req.url}",error="invalid_token",error_description="token verification failure"`,
        },
      });
      throw new HTTPException(401, { res });
    }
  }

  await next();
};
