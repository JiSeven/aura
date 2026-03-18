import fp from "fastify-plugin";
import { Kafka, type KafkaConfig } from "kafkajs";

export { Kafka };

export interface KafkaPluginOptions extends KafkaConfig {}

export const kafkaPlugin = fp<KafkaPluginOptions>(async (fastify, options) => {
	const kafka = new Kafka(options);

	fastify.decorate("kafka", kafka);

	fastify.addHook("onClose", async () => {
		fastify.log.info("🔌 Closing Kafka connections...");
	});
});

declare module "fastify" {
	interface FastifyInstance {
		kafka: Kafka;
	}
}
