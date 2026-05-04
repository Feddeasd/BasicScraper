import { type ProductData, type ScrapeResponse } from "@/lib/types/product";
import { ScraperError } from "@/lib/errors/custom";
import { validateInputUrl } from "./validators";
import { launchBrowser, openPage, randomDelay } from "./browser";
import { extractProduct } from "./extractor";

export async function scrapeProduct(rawUrl: unknown): Promise<ScrapeResponse> {
  const start = Date.now();

  let url: string;
  try {
    url = validateInputUrl(rawUrl);
  } catch (err) {
    const se = err as ScraperError;
    return {
      success: false,
      error: { code: se.code, message: se.message },
      duration_ms: Date.now() - start,
    };
  }

  let browser = null;
  try {
    await randomDelay();
    browser = await launchBrowser();
    const page = await openPage(browser, url);

    let data: ProductData;
    try {
      data = await extractProduct(page);
    } finally {
      await page.close();
    }

    return {
      success: true,
      data,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    if (err instanceof ScraperError) {
      return {
        success: false,
        error: { code: err.code, message: err.message },
        duration_ms: Date.now() - start,
      };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: { code: "UNKNOWN_ERROR", message: msg },
      duration_ms: Date.now() - start,
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignorar errores al cerrar
      }
    }
  }
}
