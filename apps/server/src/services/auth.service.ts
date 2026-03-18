import {
	AUTH_CACHE_KEYS,
	AUTH_CONFIG,
	AUTH_TOPICS,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
} from "@aura/contracts";
import { type AuraDb, accounts, eq } from "@aura/db";
import type { EventBus, Redis, SecurityService } from "@aura/infra";

export class AuthService {
	constructor(
		private readonly db: AuraDb,
		private readonly security: SecurityService,
		private readonly events: EventBus,
		private readonly cache: Redis,
	) {}

	async register(email: string, password: string) {
		const existingAccount = await this.db.query.accounts.findFirst({
			where: eq(accounts.email, email),
		});

		if (existingAccount) {
			throw new ConflictError("Account already exists");
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
			throw new InternalServerError("Error registering account");
		}

		await this.events.publish(AUTH_TOPICS.ACCOUNT_REGISTERED, {
			id: account.id,
			email: account.email,
		});

		return account;
	}

	async verifyEmail(token: string) {
		const tokenKey = AUTH_CACHE_KEYS.VERIFY_TOKEN(token);

		const email = await this.cache.get(tokenKey);

		if (!email) {
			throw new BadRequestError("Invalid or expired verification link");
		}

		await this.db
			.update(accounts)
			.set({ isVerified: true })
			.where(eq(accounts.email, email));

		await this.cache.del(tokenKey);
	}

	async login(email: string, password: string) {
		const account = await this.db.query.accounts.findFirst({
			where: eq(accounts.email, email),
		});

		if (!account) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordValid = await this.security.verify(
			account.passwordHash,
			password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid email or password");
		}

		if (!account.isVerified) {
			throw new ForbiddenError("Please verify your email first");
		}

		const preAuthToken = this.security.generateToken();
		const otpCode = this.security.generateOTP();

		console.log("CODE: ", otpCode);

		await this.cache.set(
			AUTH_CACHE_KEYS.PRE_AUTH_TOKEN(preAuthToken),
			account.id,
			"EX",
			600,
		);

		await this.cache.set(
			AUTH_CACHE_KEYS.LOGIN_OTP(account.id),
			otpCode,
			"EX",
			300,
		);

		await this.events.publish(AUTH_TOPICS.LOGIN_OTP_REQUESTED, {
			email: account.email,
			code: otpCode,
		});

		return {
			preAuthToken,
		};
	}

	async verify2FA(preAuthToken: string, code: string) {
		const tokenKey = AUTH_CACHE_KEYS.PRE_AUTH_TOKEN(preAuthToken);
		const accountId = await this.cache.get(tokenKey);

		if (!accountId) {
			throw new UnauthorizedError("Pre-auth session expired or invalid");
		}

		const attempsKey = AUTH_CACHE_KEYS.LOGIN_ATTEMPTS(preAuthToken);
		const attempts = await this.cache.incr(attempsKey);

		await this.cache.expire(attempsKey, 600); // TTL 10 min

		if (attempts > 3) {
			await Promise.all([
				this.cache.del(tokenKey),
				this.cache.del(attempsKey),
				this.cache.del(AUTH_CACHE_KEYS.LOGIN_OTP(accountId)),
			]);

			throw new UnauthorizedError("Too many attempts. Please login again");
		}

		const otpKey = AUTH_CACHE_KEYS.LOGIN_OTP(accountId);
		const storedCode = await this.cache.get(otpKey);

		if (!storedCode || storedCode !== code) {
			throw new UnauthorizedError("Invalid 2FA code");
		}

		await Promise.all([this.cache.del(tokenKey), this.cache.del(otpKey)]);

		const sessionId = this.security.generateToken();

		await this.cache.set(
			AUTH_CACHE_KEYS.SESSION(sessionId),
			accountId,
			"EX",
			AUTH_CONFIG.SESSION_TTL,
		);

		return { sessionId, accountId };
	}

	async logout(sessionId: string) {
		const sessionKey = AUTH_CACHE_KEYS.SESSION(sessionId);

		const accountId = await this.cache.get(sessionKey);

		if (accountId) {
			await this.cache.del(accountId);
		}
	}

	async getSessionAccount(sessionId: string) {
		const accountId = await this.cache.get(AUTH_CACHE_KEYS.SESSION(sessionId));

		if (!accountId) {
			throw new UnauthorizedError("Session expired or invalid");
		}

		const account = await this.db.query.accounts.findFirst({
			where: eq(accounts.id, accountId),
		});

		if (!account) {
			throw new UnauthorizedError("Account not found");
		}

		await this.cache.expire(
			AUTH_CACHE_KEYS.SESSION(sessionId),
			AUTH_CONFIG.SESSION_TTL,
		);

		return account;
	}
}
