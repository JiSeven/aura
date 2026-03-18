import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		REDIS_URL: z.url().default("redis://localhost:6379"),
		KAFKA_BROKERS: z.string().min(1),
		RESEND_API_KEY: z.string(),
		API_URL: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
