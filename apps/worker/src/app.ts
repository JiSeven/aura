import fastifyAutoload from "@fastify/autoload";
import fastify from "fastify";
import path from "node:path";

export const buildApp = async () => {
	const app = fastify({
		logger: {
			transport: {
				target: "pino-pretty",
			},
		},
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "plugins"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "services"),
		routeParams: true,
	});

	await app.register(fastifyAutoload, {
		dir: path.join(__dirname, "consumers"),
		routeParams: true,
	});

	return app;
};
