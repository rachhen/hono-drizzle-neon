require("dotenv").config();
const path = require("path");
const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be define!");
}

async function main() {
  const client = postgres(DATABASE_URL, {
    max: 1,
    ssl: "require",
  });

  const db = drizzle(client);

  await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

  console.log("Migration completed");
  process.exit(0);
}

main();
