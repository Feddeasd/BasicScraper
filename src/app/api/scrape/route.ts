import { NextRequest, NextResponse } from "next/server";
import { scrapeProduct } from "@/lib/scraper";
import { toHttpStatus } from "@/lib/errors/custom";
import { type ScrapeError } from "@/lib/types/product";

// Almacenamiento simple en memoria para rate limiting por IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitMax(): number {
  return Number(process.env.RATE_LIMIT_MAX) || 10;
}
function getRateLimitWindowMs(): number {
  return Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = getRateLimitWindowMs();
  const max = getRateLimitMax();

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  if (!checkRateLimit(ip)) {
    const errorResponse: ScrapeError = {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Demasiadas solicitudes. Intenta más tarde.",
      },
      duration_ms: 0,
    };
    return NextResponse.json(errorResponse, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const errorResponse: ScrapeError = {
      success: false,
      error: { code: "INVALID_URL", message: "El cuerpo de la solicitud no es JSON válido." },
      duration_ms: 0,
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const url = (body as Record<string, unknown>)?.url;
  const result = await scrapeProduct(url);

  if (!result.success) {
    const status = toHttpStatus(result.error.code);
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
