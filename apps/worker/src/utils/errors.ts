export class AppError extends Error {
	constructor(
		readonly code: string,
		readonly message: string,
		readonly statusCode: number = 400,
	) {
		super(message);
	}
}
