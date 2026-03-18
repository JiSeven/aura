import { z } from "zod";

export const AccountRegisteredPayloadSchema = z.object({
	id: z.uuid(),
	email: z.email(),
});

export type AccountRegisteredPayload = z.infer<
	typeof AccountRegisteredPayloadSchema
>;
