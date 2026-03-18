import fp from "fastify-plugin";
import { Mailer } from "./mailer.infra.js";

export interface MailerPluginOptions {
	apiKey: string;
	defaultFrom?: string;
}

export const mailerPlugin = fp<MailerPluginOptions>(
	async (fastify, options) => {
		const mailer = new Mailer(options.apiKey, options.defaultFrom);

		fastify.decorate("mail", mailer);

		fastify.log.info("📧 Mailer plugin registered");
	},
);

declare module "fastify" {
	interface FastifyInstance {
		mail: Mailer;
	}
}
