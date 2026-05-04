import { z } from "zod";
import { ScraperError } from "@/lib/errors/custom";
import { scraperConfig } from "@/config/scraper.config";

export const scrapeInputSchema = z.object({
  url: z.string().url({ message: "Se requiere una URL válida" }),
});

export const productOutputSchema = z.object({
  title: z.string().min(1),
  images: z.array(z.string().url()),
  description: z.string(),
  price: z.number().positive(),
  currency: z.string(),
  discountPrice: z.number().positive().nullable(),
  discountPercentage: z.number().nullable(),
});

export function validateInputUrl(rawUrl: unknown): string {
  const parsed = scrapeInputSchema.safeParse({ url: rawUrl });
  if (!parsed.success) {
    throw new ScraperError("INVALID_URL", "URL inválida o ausente", 400);
  }

  const { url } = parsed.data;
  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    throw new ScraperError("INVALID_URL", "URL inválida o ausente", 400);
  }

  const allowed = scraperConfig.allowedDomains.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );
  if (!allowed) {
    throw new ScraperError(
      "DOMAIN_NOT_ALLOWED",
      `Dominio no permitido: ${hostname}`,
      400
    );
  }

  return url;
}
