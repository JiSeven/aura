import fastifyAutoload from "@fastify/autoload";
import fastify from "fastify";
import {
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

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "plugins"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "routes"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "services"),
		routeParams: true,
	});

	return app;
};
