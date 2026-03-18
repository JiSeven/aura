import { AUTH_CONFIG } from "@aura/contracts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export default async function (fastify: FastifyInstance) {
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.post(
		"/auth/register",
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

	app.get(
		"/auth/verify",
		{
			schema: {
				querystring: z.object({
					token: z.string().min(1),
				}),
			},
		},
		async (request, reply) => {
			const { token } = request.query;

			await fastify.auth.verifyEmail(token);

			return reply.status(200).send({ message: "Email verified" });
		},
	);

	app.post(
		"/auth/login",
		{
			schema: {
				body: z.object({
					email: z.email(),
					password: z.string(),
				}),
			},
		},
		async (request) => {
			return await app.auth.login(request.body.email, request.body.password);
		},
	);

	app.post(
		"/auth/login/verify",
		{
			schema: {
				body: z.object({
					preAuthToken: z.string(),
					code: z.string().length(6),
				}),
			},
		},
		async (request, reply) => {
			const { preAuthToken, code } = request.body;

			const { sessionId, accountId } = await app.auth.verify2FA(
				preAuthToken,
				code,
			);

			reply.setCookie("sessionId", sessionId, {
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: AUTH_CONFIG.SESSION_TTL,
			});

			return { accountId };
		},
	);

	app.post(
		"/auth/logout",
		{
			schema: {
				body: z.object({
					sessionId: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { sessionId } = request.cookies;

			if (sessionId) {
				await app.auth.logout(sessionId);
			}

			reply.clearCookie("sessionId", {
				path: "/",
				httpOnly: true,
			});

			return { message: "Logged out successfully" };
		},
	);
}
