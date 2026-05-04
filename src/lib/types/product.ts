export interface ProductData {
  title: string;
  images: string[];
  description: string;
  price: number;
  currency: string;
  discountPrice: number | null;
  discountPercentage: number | null;
}

export interface ScrapeSuccess {
  success: true;
  data: ProductData;
  duration_ms: number;
}

export interface ScrapeError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
  duration_ms: number;
}

export type ScrapeResponse = ScrapeSuccess | ScrapeError;

export type ErrorCode =
  | "INVALID_URL"
  | "DOMAIN_NOT_ALLOWED"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "BROWSER_ERROR"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";
