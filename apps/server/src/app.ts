import fastifyAutoload from "@fastify/autoload";
import fastify from "fastify";
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import path from "node:path";
import { AppError } from "./utils/errors.util";

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

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "plugins"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "routes"),
		routeParams: true,
	});

	return app;
};
