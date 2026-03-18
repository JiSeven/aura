import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = createEnv({
	server: {
		SERVER_PORT: z.string().transform(Number),
		DATABASE_URL: z.url(),
		REDIS_URL: z.url(),
		KAFKA_BROKERS: z.string().min(1),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
