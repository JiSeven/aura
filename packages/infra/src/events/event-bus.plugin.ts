import fp from "fastify-plugin";
import { EventBus } from "./event-bus.infra.js";

export const eventBusPlugin = fp(async (fastify) => {
	if (!fastify.kafka) {
		throw new Error(
			"@aura/infra: kafkaPlugin must be registered before eventBusPlugin",
		);
	}

	const eventBus = new EventBus(fastify.kafka);

	await eventBus.connect();

	fastify.decorate("events", eventBus);

	fastify.addHook("onClose", async () => {
		fastify.log.info("🔌 Disconnecting EventBus...");
		await eventBus.disconnect();
	});
});

declare module "fastify" {
	interface FastifyInstance {
		events: EventBus;
	}
}
