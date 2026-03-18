import fp from "fastify-plugin";

type Event = {
	email: string;
};

export default fp(async (fastify) => {
	await fastify.events.subscribe<Event>(
		"aura-worker-group",
		"account.registered",
		async (payload) => {
			try {
				const otpCode = fastify.security.generateOTP();

				await fastify.redis.set(`otp:${payload.email}`, otpCode, "EX", 300);

				await fastify.mail.send({
					to: payload.email,
					subject: "Твой код подтверждения Aura",
					html: `<h1>Добро пожаловать!</h1><p>Твой код: <b>${otpCode}</b></p>`,
				});

				fastify.log.info({ email: payload.email }, "✅ OTP успешно доставлен");
			} catch (error) {
				fastify.log.error(
					{ error, email: payload.email },
					"❌ Ошибка обработки события",
				);
			}
		},
	);
});
