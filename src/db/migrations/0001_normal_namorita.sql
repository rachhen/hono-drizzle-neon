CREATE TABLE IF NOT EXISTS "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"content" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"author_id" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts" ("author_id");
CREATE INDEX IF NOT EXISTS "posts_title_idx" ON "posts" ("title");
CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" ("slug");
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
