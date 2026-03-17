import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.string().transform(Number).default(3001),
		DATABASE_URL: z.url(),
		REDIS_URL: z.url().default("redis://localhost:6379"),
		KAFKA_BROKERS: z.string().min(1),
		RESEND_API_KEY: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
