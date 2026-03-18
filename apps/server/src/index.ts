import { buildApp } from "./app";
import { env } from "./config/env.config";

const start = async () => {
	try {
		const app = await buildApp();

		await app.listen({
			port: env.SERVER_PORT,
			host: "0.0.0.0",
		});

		console.log(
			`🚀 Aura API is running on http://localhost:${env.SERVER_PORT}`,
		);
	} catch (err) {
		console.error("❌ Error starting server:", err);
		process.exit(1);
	}
};

start();
