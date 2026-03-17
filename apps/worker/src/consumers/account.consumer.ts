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
				const { email, id } = JSON.parse(message.value?.toString() || "{}");

				const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

				await fastify.redis.set(`otp:${email}`, otpCode, "EX", 300);

				await fastify.email.sendOTP(email, otpCode);

				fastify.log.info({ email }, "✅ OTP отправлен успешно");
			},
		})
		.catch((err) => {
			fastify.log.error(err, "Kafka Consumer Error");
		});

	fastify.addHook("onClose", async () => {
		await consumer.disconnect();
	});
});
