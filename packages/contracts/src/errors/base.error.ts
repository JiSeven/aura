export abstract class AppError extends Error {
	constructor(
		public readonly code: string,
		public readonly message: string,
		public readonly statusCode: number = 400,
		public readonly details?: unknown,
	) {
		super(message);

		Object.setPrototypeOf(this, new.target.prototype);
		Error.captureStackTrace(this, this.constructor);
	}
}
