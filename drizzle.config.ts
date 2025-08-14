import { defineConfig } from "drizzle-kit";
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'bingo.db');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
