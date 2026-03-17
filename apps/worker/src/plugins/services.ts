import fp from "fastify-plugin";
import { env } from "../config/env";
import { EmailService } from "../services/email.service";

export default fp(async (fastify) => {
	const emailService = new EmailService(env.RESEND_API_KEY);

	fastify.decorate("email", emailService);
});

declare module "fastify" {
	interface FastifyInstance {
		email: EmailService;
	}
}
