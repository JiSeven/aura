import { AccountRegisteredPayloadSchema, AUTH_TOPICS } from "@aura/contracts";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
	await fastify.events.subscribe(
		"aura-worker-group",
		AUTH_TOPICS.ACCOUNT_REGISTERED,
		async (rawPayload) => {
			try {
				const payload = AccountRegisteredPayloadSchema.parse(rawPayload);

				const otpCode = fastify.security.generateOTP();

				await fastify.redis.set(`otp:${payload.email}`, otpCode, "EX", 300);

				await fastify.mail.send({
					to: payload.email,
					subject: "Твой код подтверждения Aura",
					html: `<h1>Добро пожаловать!</h1><p>Твой код: <b>${otpCode}</b></p>`,
				});

				fastify.log.info({ email: payload.email }, "✅ OTP успешно доставлен");
			} catch (error) {
				fastify.log.error({ error }, "❌ Ошибка обработки события");
			}
		},
	);
});
