import { EventBus, SecurityService } from "@aura/infra";
import fp from "fastify-plugin";
import { AuthService } from "../services/auth.service";

export default fp(async (fastify) => {
	const events = new EventBus(fastify.kafka);
	await events.connect();

	const securityService = new SecurityService();

	const authService = new AuthService(
		fastify.db,
		securityService,
		events,
		fastify.redis,
	);

	fastify.decorate("auth", authService);

	fastify.addHook("onClose", async () => {
		await events.disconnect();
	});
});

declare module "fastify" {
	interface FastifyInstance {
		auth: AuthService;
	}
}
