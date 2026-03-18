import { BaseError } from "./base.error.js";

export class BadRequestError extends BaseError {
	constructor(message = "Некорректный запрос", details?: unknown) {
		super("BAD_REQUEST", message, 400, details);
	}
}

export class ConflictError extends BaseError {
	constructor(message = "Ресурс уже существует") {
		super("CONFLICT", message, 409);
	}
}

export class UnauthorizedError extends BaseError {
	constructor(message = "Не авторизован") {
		super("UNAUTHORIZED", message, 401);
	}
}

export class NotFoundError extends BaseError {
	constructor(message: string, details?: unknown) {
		super("NOT_FOUND", message, 404, details);
	}
}

export class InternalServerError extends BaseError {
	constructor(message: string, details?: unknown) {
		super("INTERNAL_ERROR", message, 500, details);
	}
}
