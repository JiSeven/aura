import fp from "fastify-plugin";
import Redis from "ioredis";

export default fp(async (fastify) => {
	const redis = new Redis();

	fastify.decorate("redis", redis);
});

declare module "fastify" {
	interface FastifyInstance {
		redis: Redis;
	}
}
