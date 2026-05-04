import { type Page } from "puppeteer";
import { type ProductData } from "@/lib/types/product";
import { scraperConfig } from "@/config/scraper.config";
import { ScraperError } from "@/lib/errors/custom";
import {
  parsePrice,
  normalizeText,
  parseDiscountPercentage,
  normalizeImageUrls,
} from "./normalizers";

/** Prueba una lista de selectores CSS y devuelve el texto del primero que exista. */
async function firstText(
  page: Page,
  selectors: readonly string[]
): Promise<string | null> {
  for (const sel of selectors) {
    try {
      const text = await page.$eval(sel, (el) => (el as HTMLElement).innerText ?? el.textContent ?? "");
      const clean = text.trim();
      if (clean) return clean;
    } catch {
      // selector no encontrado, continuar
    }
  }
  return null;
}

/** Extrae todos los valores de un atributo de todos los elementos que coincidan. */
async function allAttr(
  page: Page,
  selectors: readonly string[],
  attr: string
): Promise<string[]> {
  for (const sel of selectors) {
    try {
      const values = await page.$$eval(
        sel,
        (els, attribute) =>
          els.map((el) => el.getAttribute(attribute) ?? "").filter(Boolean),
        attr
      );
      if (values.length > 0) return values as string[];
    } catch {
      // continuar
    }
  }
  return [];
}

export async function extractProduct(page: Page): Promise<ProductData> {
  const { selectors } = scraperConfig;

  // --- Título ---
  const rawTitle = await firstText(page, selectors.title);
  if (!rawTitle) {
    throw new ScraperError(
      "PARSE_ERROR",
      "No se pudo extraer el título del producto",
      422
    );
  }
  const title = normalizeText(rawTitle);

  // --- Precio principal (precio actual / precio con descuento) ---
  const rawPrice = await firstText(page, selectors.price);
  if (!rawPrice) {
    throw new ScraperError(
      "PARSE_ERROR",
      "No se pudo extraer el precio del producto",
      422
    );
  }
  const price = parsePrice(rawPrice);
  if (price === null) {
    throw new ScraperError("PARSE_ERROR", `Precio con formato inválido: "${rawPrice}"`, 422);
  }

  // --- Moneda ---
  const rawCurrency = await firstText(page, selectors.currency);
  const currency = rawCurrency ? normalizeText(rawCurrency) : "ARS";

  // --- Precio original (antes del descuento) ---
  const rawOriginalPrice = await firstText(page, selectors.originalPrice);
  let discountPrice: number | null = null;
  let finalPrice = price;

  if (rawOriginalPrice) {
    const originalPrice = parsePrice(rawOriginalPrice);
    if (originalPrice !== null && originalPrice > price) {
      // El precio tachado es el precio original; el precio actual ES el precio con descuento
      discountPrice = price;
      finalPrice = originalPrice;
    }
  }

  // --- Porcentaje de descuento ---
  const rawDiscount = await firstText(page, selectors.discountPercentage);
  const discountPercentage = rawDiscount
    ? parseDiscountPercentage(rawDiscount)
    : null;

  // --- Imágenes ---
  // Intentar src primero, luego data-src (lazy loading)
  let imageUrls = await allAttr(page, selectors.images, "src");
  if (imageUrls.length === 0) {
    imageUrls = await allAttr(page, selectors.images, "data-src");
  }
  // Fallback: buscar todas las imágenes con URLs de MercadoLibre CDN
  if (imageUrls.length === 0) {
    imageUrls = await page.$$eval("img", (imgs) =>
      imgs
        .map((img) => img.getAttribute("src") ?? img.getAttribute("data-src") ?? "")
        .filter((src) => src.includes("mlstatic") || src.includes("mla-s"))
    );
  }
  const images = normalizeImageUrls(imageUrls);

  // --- Descripción ---
  const rawDescription = await firstText(page, selectors.description);
  const description = rawDescription ? normalizeText(rawDescription) : "";

  return {
    title,
    images,
    description,
    price: finalPrice,
    currency,
    discountPrice,
    discountPercentage,
  };
}
