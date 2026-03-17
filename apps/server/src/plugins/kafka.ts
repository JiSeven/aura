import fp from "fastify-plugin";
import { Kafka, type Producer } from "kafkajs";
import { env } from "../config/env";

export default fp(async (fastify) => {
	const kafka = new Kafka({
		clientId: "aura-api",
		brokers: env.KAFKA_BROKERS.split(","),
	});

	const producer = kafka.producer();
	await producer.connect();

	fastify.decorate("queue", producer);

	fastify.addHook("onClose", async () => {
		await producer.disconnect();
	});
});

declare module "fastify" {
	interface FastifyInstance {
		queue: Producer;
	}
}
