import { Resend } from "resend";

export class EmailService {
	private resend: Resend;

	constructor(apiKey: string) {
		this.resend = new Resend(apiKey);
	}

	async sendOTP(email: string, code: string) {
		const { data, error } = await this.resend.emails.send({
			from: "Aura <onboarding@resend.dev>",
			to: [email],
			subject: "Aura registration verification",
			html: `<strong>Your code: ${code}</strong>. It lasts for 5 minutes.`,
		});

		if (error) {
			throw new Error(`Resend error: ${error.message}`);
		}

		return data;
	}
}
