import type { Consumer, Kafka, Producer } from "kafkajs";

export class EventBus {
	private producer: Producer;
	private consumers: Consumer[] = [];

	constructor(private readonly kafka: Kafka) {
		this.producer = kafka.producer();
	}

	async connect() {
		await this.producer.connect();
	}

	async disconnect() {
		await this.producer.disconnect();

		for (const consumer of this.consumers) await consumer.disconnect();
	}

	async publish(topic: string, payload: unknown) {
		await this.producer.send({
			topic,
			messages: [{ value: JSON.stringify(payload) }],
		});
	}

	async subscribe<T>(
		groupId: string,
		topic: string,
		handler: (payload: T) => Promise<void>,
	) {
		const consumer = this.kafka.consumer({ groupId });
		await consumer.connect();
		await consumer.subscribe({ topic, fromBeginning: true });

		await consumer.run({
			eachMessage: async ({ message }) => {
				const payload = JSON.parse(message.value?.toString() || "{}");
				await handler(payload);
			},
		});

		this.consumers.push(consumer);
	}
}
