import { randomUUID } from "crypto";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  googleId: text("google_id"),
  githubId: text("github_id")
})