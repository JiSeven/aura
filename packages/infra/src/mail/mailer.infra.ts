import { Resend } from "resend";

export interface MailOptions {
	from?: string;
	to: string | string[];
	subject: string;
	html: string;
}

export class Mailer {
	private readonly client: Resend;

	constructor(
		apiKey: string,
		private readonly defaultFrom = "onboarding@resend.dev",
	) {
		this.client = new Resend(apiKey);
	}

	async send(options: MailOptions) {
		const { data, error } = await this.client.emails.send({
			from: options.from || this.defaultFrom,
			to: options.to,
			subject: options.subject,
			html: options.html,
		});

		if (error) {
			throw new Error(`[Mailer] Failed to send email: ${error.message}`);
		}

		return data;
	}
}
