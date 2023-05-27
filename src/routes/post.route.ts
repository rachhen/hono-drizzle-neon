import slugify from "slugify";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { Env } from "../types";
import { posts } from "../db/schema";
import { requiredAuth } from "../middleware/auth.middleware";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const post = new Hono<Env>();

post.get("/", async (c) => {
  const result = await c.get("db").select().from(posts);

  return c.json(result);
});

post.post(
  "/",
  zValidator("json", createPostSchema),
  requiredAuth(),
  async (c) => {
    const { title, content } = c.req.valid("json");
    const slug = slugify(title, { lower: true });
    const user = c.get("user");

    const result = await c
      .get("db")
      .insert(posts)
      .values({ title, content, slug, authorId: user.id })
      .returning();

    return c.json(result[0]);
  }
);

post.patch(
  "/:id",
  zValidator("json", updatePostSchema),
  requiredAuth(),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = +c.req.param("id");
    const { title, content } = c.req.valid("json");

    const result = await db.select().from(posts).where(eq(posts.id, id));

    if (result.length === 0) {
      throw new HTTPException(400, { message: "Post not found" });
    }

    if (user.id !== result[0].authorId) {
      throw new HTTPException(403, {
        message: "You are not authorized to update this post",
      });
    }

    const slug = title ? slugify(title, { lower: true }) : result[0].slug;

    const updateResult = await db
      .update(posts)
      .set({ title, slug, content })
      .where(eq(posts.id, id))
      .returning();

    console.log(updateResult[0]);

    return c.json({});
  }
);

export default post;
