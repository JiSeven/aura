import { UnauthorizedError } from "@aura/contracts";
import { AppError } from "@aura/contracts/src/errors/base.error";
import fastifyAutoload from "@fastify/autoload";
import cookie from "@fastify/cookie";
import fastify from "fastify";
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import path from "node:path";

export const buildApp = async () => {
	const app = fastify({
		logger: {
			transport: {
				target: "pino-pretty",
			},
		},
	}).withTypeProvider<ZodTypeProvider>();

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	app.setErrorHandler((error, request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send({
				code: error.statusCode,
				message: error.message,
			});
		}

		if (hasZodFastifySchemaValidationErrors(error)) {
			return reply.status(400).send({
				code: "VALIDATION_ERROR",
				message: "Validation error",
				details: error.validation.map((v) => ({
					path: v.instancePath,
					message: v.message,
				})),
			});
		}

		request.log.error(error);

		return reply.status(500).send({
			code: "INTERNAL_SERVER_ERROR",
			message: "Something went wrong",
		});
	});

	await app.register(cookie, {
		secret: "my-secret-key",
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "plugins"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "routes"),
		routeParams: true,
		options: { prefix: "/api/v1" },
	});

	app.addHook("preHandler", async (request) => {
		if (request.routeOptions.config.isPublic) return;

		const { sessionId } = request.cookies;
		if (!sessionId) throw new UnauthorizedError("Authentication required");

		const account = await app.auth.getSessionAccount(sessionId);

		request.account = { id: account.id, email: account.email };
	});

	return app;
};

declare module "fastify" {
	interface FastifyContextConfig {
		isPublic?: boolean;
	}

	interface FastifyRequest {
		account: { id: string; email: string };
	}
}
