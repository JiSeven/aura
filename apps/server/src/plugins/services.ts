import fp from "fastify-plugin";
import { AuthService } from "../services/auth.service";

export default fp(async (fastify) => {
	const authService = new AuthService(fastify.db, fastify.redis, fastify.queue);

	fastify.decorate("auth", authService);
});

declare module "fastify" {
	interface FastifyInstance {
		auth: AuthService;
	}
}
