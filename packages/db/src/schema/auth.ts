import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { uuidv7 } from "uuidv7";

export const accounts = pgTable("accounts", {
	id: uuid("id")
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	email: varchar("email", { length: 255 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
