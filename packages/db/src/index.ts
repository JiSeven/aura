import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schema/auth";

export const schema = { ...authSchema };

export type AuraDb = ReturnType<typeof createDb>;

export const createDb = (connectionString: string) => {
	const client = postgres(connectionString);
	return drizzle(client, { schema });
};

export * from "drizzle-orm";
export * from "./schema/auth";
