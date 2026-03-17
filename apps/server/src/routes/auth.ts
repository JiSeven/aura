import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export default async function (fastify: FastifyInstance) {
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.post(
		"/register",
		{
			schema: {
				body: z.object({
					email: z.email(),
					password: z.string().min(8),
				}),
				response: {
					201: z.object({
						id: z.uuid(),
						email: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const account = await app.auth.register(email, password);

			return reply.status(201).send({
				id: account.id,
				email: account.email,
			});
		},
	);
}
