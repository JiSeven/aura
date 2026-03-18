import {
	AccountRegisteredPayloadSchema,
	AUTH_CACHE_KEYS,
	AUTH_CONFIG,
	AUTH_GROUPS,
	AUTH_TOPICS,
} from "@aura/contracts";
import fp from "fastify-plugin";
import { env } from "../config/env.config";

export default fp(async (fastify) => {
	await fastify.events.subscribe(
		AUTH_GROUPS.EMAIL_WORKER,
		AUTH_TOPICS.ACCOUNT_REGISTERED,
		async (rawPayload) => {
			try {
				const payload = AccountRegisteredPayloadSchema.parse(rawPayload);

				const token = fastify.security.generateToken();
				const tokenCacheKey = AUTH_CACHE_KEYS.VERIFY_TOKEN(token);

				await fastify.redis.set(
					tokenCacheKey,
					payload.email,
					"EX",
					AUTH_CONFIG.VERIFY_TOKEN_TTL,
				);

				const verifyUrl = `${env.API_URL}/api/v1/auth/verify?token=${token}`;

				await fastify.mail.send({
					to: payload.email,
					subject: "Verify your Aura account",
					html: `<h1>Welcome!</h1><p>Please verify your email by clicking: <a href="${verifyUrl}">Confirm Registration</a></p>`,
				});

				fastify.log.info(
					{ email: payload.email },
					"✅ Verification email sucessfully sent",
				);
			} catch (error) {
				fastify.log.error({ error }, "❌ Ошибка обработки события");
			}
		},
	);
});
