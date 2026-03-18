export const AUTH_TOPICS = {
	ACCOUNT_REGISTERED: "auth.account.registered",
	ACCOUNT_VERIFIED: "auth.account.verified",
	LOGIN_OTP_REQUESTED: "auth.account.verified",
} as const;

export const AUTH_CACHE_KEYS = {
	VERIFY_TOKEN: (token: string) => `auth:verify_token:${token}`,
	SESSION: (sessionId: string) => `auth:session:${sessionId}`,
	LOGIN_OTP: (email: string) => `auth:session:${email}`,
	PRE_AUTH_TOKEN: (token: string) => `auth:pre_auth:${token}`,
	LOGIN_ATTEMPTS: (preAuthToken: string) =>
		`auth:login_attempts:${preAuthToken}`,
} as const;

export const AUTH_GROUPS = {
	EMAIL_WORKER: "auth.email-worker.group",
} as const;

export const AUTH_CONFIG = {
	VERIFY_TOKEN_TTL: 3600, // 1 hour in seconds
	SESSION_TTL: 604800,
} as const;
