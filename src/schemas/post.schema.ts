import { createInsertSchema } from "drizzle-zod";
import { posts } from "../db/schema";

const postsDefaultSchema = createInsertSchema(posts);
export const createPostSchema = postsDefaultSchema.pick({
  title: true,
  content: true,
});

export const updatePostSchema = createPostSchema.partial();
