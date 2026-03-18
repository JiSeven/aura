import { buildApp } from "./app";

const start = async () => {
	const app = await buildApp();

	["SIGTERM", "SIGINT"].forEach((signal) => {
		process.on(signal, async () => {
			app.log.info(`Received ${signal}, closing server...`);

			await app.close();

			app.log.info("Server closed gracefully");
			process.exit(0);
		});
	});

	await app.ready();

	app.log.info("🚀 Worker is scales and consuming events...");
};

start();
