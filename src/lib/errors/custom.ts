import { type ErrorCode } from "@/lib/types/product";

export class ScraperError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "ScraperError";
  }
}

export function toHttpStatus(code: ErrorCode): number {
  const map: Record<ErrorCode, number> = {
    INVALID_URL: 400,
    DOMAIN_NOT_ALLOWED: 400,
    TIMEOUT: 504,
    PARSE_ERROR: 422,
    BROWSER_ERROR: 500,
    RATE_LIMITED: 429,
    UNKNOWN_ERROR: 500,
  };
  return map[code];
}
