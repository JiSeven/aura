import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
