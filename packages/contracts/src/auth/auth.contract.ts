import { z } from "zod";

export const AUTH_TOPICS = {
	ACCOUNT_REGISTERED: "auth.account.registered",
	ACCOUNT_VERIFIED: "auth.account.verified",
} as const;

export const AccountRegisteredPayloadSchema = z.object({
	id: z.uuid(),
	email: z.email(),
});

export type AccountRegisteredPayload = z.infer<
	typeof AccountRegisteredPayloadSchema
>;
