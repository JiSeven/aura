import argon2 from "argon2";
import { randomBytes } from "node:crypto";

export class SecurityService {
	async hash(data: string) {
		return argon2.hash(data);
	}

	async verify(hash: string, data: string) {
		return argon2.verify(hash, data);
	}

	generateOTP() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	generateToken() {
		return randomBytes(32).toString("hex");
	}
}
