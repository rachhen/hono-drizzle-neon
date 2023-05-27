import { InferModel } from "drizzle-orm";
import {
  AnyPgColumn,
  index,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export type User = InferModel<typeof users, "select">;

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name").notNull(),
    email: varchar("email").notNull(),
    password: varchar("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    fullNameIdx: index("users_full_name_idx").on(table.fullName),
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    slug: varchar("slug").notNull(),
    content: text("content"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    authorIdIdx: index("posts_author_id_idx").on(table.authorId),
    titleIdx: index("posts_title_idx").on(table.title),
    slugIdx: index("posts_slug_idx").on(table.slug),
  })
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    published: smallint("published").notNull().default(0),
    publishedAt: timestamp("published_at"),
    parentId: integer("parent_id").references((): AnyPgColumn => comments.id),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
  },
  (table) => ({
    postIdIdx: index("comments_post_idx").on(table.postId),
  })
);
