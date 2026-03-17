import { type AuraDb, accounts, eq } from "@aura/db";
import argon2 from "argon2";
import type Redis from "ioredis";

export class AuthService {
	constructor(
		private readonly db: AuraDb,
		private readonly redis: Redis,
	) {}

	async register(email: string, password: string) {
		const existingAccount = await this.db.query.accounts.findFirst({
			where: eq(accounts.email, email),
		});

		if (existingAccount) {
			throw new Error("Account already exists");
		}

		const passwordHash = await argon2.hash(password);

		const [newAccount] = await this.db
			.insert(accounts)
			.values({
				email,
				passwordHash,
			})
			.returning();

		return newAccount;
	}

	async generateOTP(accountId: string) {
		const code = Math.floor(100000 + Math.random() * 900000).toString();

		await this.redis.set(`otp:${accountId}`, code, `EX`, 300);

		return code;
	}
}
