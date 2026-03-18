import { createDb } from "@aura/db";
import fp from "fastify-plugin";
import { env } from "../config/env.config";

export default fp(async (fastify) => {
	const db = createDb(env.DATABASE_URL);

	fastify.decorate("db", db);
});

declare module "fastify" {
	interface FastifyInstance {
		db: ReturnType<typeof createDb>;
	}
}
