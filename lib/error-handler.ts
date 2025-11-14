// Centralized error handling

import { logger } from "./logger"

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleError(error: unknown, context?: Record<string, any>) {
  if (error instanceof AppError) {
    logger.error(error.message, error, { code: error.code, ...context })
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    logger.error(error.message, error, context)
    return {
      success: false,
      error: error.message,
      code: "INTERNAL_ERROR",
      statusCode: 500,
    }
  }

  logger.critical("Unknown error occurred", undefined, { error, ...context })
  return {
    success: false,
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  }
}

export function createError(code: string, statusCode: number, message: string, context?: Record<string, any>) {
  return new AppError(code, statusCode, message, context)
}
