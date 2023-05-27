import { Hono } from "hono";

import { Env } from "./types";
import { dbMiddleware } from "./middleware/db.middleware";
import post from "./routes/post.route";
import auth from "./routes/auth.route";

const app = new Hono<Env>();

app.use(dbMiddleware);
app.route("/api/v1/auth", auth);
app.route("/api/v1/posts", post);

export default app;
