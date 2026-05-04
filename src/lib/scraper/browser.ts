import puppeteer, { type Browser, type Page } from "puppeteer";
import { scraperConfig } from "@/config/scraper.config";
import { ScraperError } from "@/lib/errors/custom";

function randomUserAgent(): string {
  const agents = scraperConfig.userAgents as readonly string[];
  return agents[Math.floor(Math.random() * agents.length)];
}

export function randomDelay(): Promise<void> {
  const { minDelayMs, maxDelayMs } = scraperConfig;
  const ms = Math.floor(Math.random() * (maxDelayMs - minDelayMs) + minDelayMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function launchBrowser(): Promise<Browser> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1366,768",
      ],
    });
    return browser;
  } catch (err) {
    throw new ScraperError(
      "BROWSER_ERROR",
      `No se pudo lanzar el navegador: ${String(err)}`,
      500
    );
  }
}

export async function openPage(browser: Browser, url: string): Promise<Page> {
  const page = await browser.newPage();

  await page.setUserAgent(randomUserAgent());
  await page.setViewport({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({
    "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  });

  // Bloquear recursos innecesarios para mayor velocidad
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["font", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: scraperConfig.timeoutMs,
    });
  } catch (err) {
    await page.close();
    const msg = String(err);
    if (msg.includes("timeout") || msg.includes("Timeout")) {
      throw new ScraperError(
        "TIMEOUT",
        `La navegación a la URL superó el tiempo límite`,
        504
      );
    }
    throw new ScraperError(
      "BROWSER_ERROR",
      `Error navegando a la URL: ${msg}`,
      500
    );
  }

  return page;
}
