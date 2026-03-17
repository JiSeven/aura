import fastifyAutoload from "@fastify/autoload";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import path from "node:path";

export const buildApp = async () => {
	const app = fastify({ logger: true });

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "routes"),
		routeParams: true,
	});

	return app;
};
