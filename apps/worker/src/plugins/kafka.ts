import fp from "fastify-plugin";
import { Kafka } from "kafkajs";
import { env } from "../config/env";

export default fp(async (fastify) => {
	const kafka = new Kafka({
		clientId: "aura-api",
		brokers: env.KAFKA_BROKERS.split(","),
	});

	fastify.decorate("kafka", kafka);
});

declare module "fastify" {
	interface FastifyInstance {
		kafka: Kafka;
	}
}
