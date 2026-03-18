import {
	eventBusPlugin,
	kafkaPlugin,
	redisPlugin,
	securityPlugin,
} from "@aura/infra";
import fp from "fastify-plugin";
import { env } from "../config/env.config";

export default fp(async (fastify) => {
	await fastify.register(kafkaPlugin, {
		clientId: "aura-app",
		brokers: env.KAFKA_BROKERS.split(","),
	});

	await fastify.register(redisPlugin, { url: env.REDIS_URL });

	await fastify.after();

	await fastify.register(eventBusPlugin);
	await fastify.register(securityPlugin);
});
