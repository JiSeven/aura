import fp from "fastify-plugin";
import { SecurityService } from "./security.infra.js";

export const securityPlugin = fp(async (fastify) => {
	const security = new SecurityService();

	fastify.decorate("security", security);
});

declare module "fastify" {
	interface FastifyInstance {
		security: SecurityService;
	}
}
