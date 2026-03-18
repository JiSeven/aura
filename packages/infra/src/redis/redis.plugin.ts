import fp from "fastify-plugin";
import { Redis, type RedisOptions } from "ioredis";

export { Redis };

export interface RedisPluginOptions extends RedisOptions {
	url?: string;
}

export const redisPlugin = fp<RedisPluginOptions>(async (fastify, options) => {
	const { url, ...rest } = options;

	const redis = url ? new Redis(url, rest) : new Redis(rest);

	redis.on("error", (err) => {
		fastify.log.error({ err }, "Redis Connection Error");
	});

	fastify.decorate("redis", redis);

	fastify.addHook("onClose", async (instance) => {
		instance.log.info("🔌 Closing Redis connections...");
		await redis.quit();
	});
});

declare module "fastify" {
	interface FastifyInstance {
		redis: Redis;
	}
}
