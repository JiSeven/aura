import { AUTH_TOPICS } from "@aura/contracts";
import { type AuraDb, accounts, eq } from "@aura/db";
import type { EventBus, SecurityService } from "@aura/infra";

export class AuthService {
	constructor(
		private readonly db: AuraDb,
		private readonly security: SecurityService,
		private readonly events: EventBus,
	) {}

	async register(email: string, password: string) {
		const existingAccount = await this.db.query.accounts.findFirst({
			where: eq(accounts.email, email),
		});

		if (existingAccount) {
			throw new Error("Account already exists");
		}

		const passwordHash = await this.security.hash(password);

		const [account] = await this.db
			.insert(accounts)
			.values({
				email,
				passwordHash,
			})
			.returning();

		if (!account) {
			throw new Error("Error registering account");
		}

		await this.events.publish(AUTH_TOPICS.ACCOUNT_REGISTERED, {
			id: account.id,
			email: account.email,
		});

		return account;
	}
}
