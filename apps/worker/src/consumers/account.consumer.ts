import fp from "fastify-plugin";

export default fp(async (fastify) => {
	const consumer = fastify.kafka.consumer({
		groupId: "email-worker-group",
	});

	await consumer.connect();
	await consumer.subscribe({
		topic: "account.registered",
		fromBeginning: true,
	});

	consumer
		.run({
			eachMessage: async ({ message }) => {
				const payload = JSON.parse(message.value?.toString() || "{}");
				fastify.log.info({ payload }, "📧 Sending OTP email to user");
			},
		})
		.catch((err) => {
			fastify.log.error(err, "Kafka Consumer Error");
		});

	fastify.addHook("onClose", async () => {
		await consumer.disconnect();
	});
});
