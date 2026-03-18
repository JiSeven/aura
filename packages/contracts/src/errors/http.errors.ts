import { AppError } from "./base.error.js";

export class BadRequestError extends AppError {
	constructor(message = "Некорректный запрос", details?: unknown) {
		super("BAD_REQUEST", message, 400, details);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Ресурс уже существует") {
		super("CONFLICT", message, 409);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Не авторизован") {
		super("UNAUTHORIZED", message, 401);
	}
}

export class ForbiddenError extends AppError {
	constructor(
		message = "Access denied: identity verified but permission lacking",
	) {
		super("FORBIDDEN", message, 403);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string, details?: unknown) {
		super("NOT_FOUND", message, 404, details);
	}
}

export class InternalServerError extends AppError {
	constructor(message: string, details?: unknown) {
		super("INTERNAL_ERROR", message, 500, details);
	}
}
