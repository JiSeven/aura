import { buildApp } from "./app";

const start = async () => {
	const app = await buildApp();

	await app.ready();

	app.log.info("🚀 Worker is scales and consuming events...");
};

start();
