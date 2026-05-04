export const scraperConfig = {
  timeoutMs: Number(process.env.SCRAPER_TIMEOUT_MS) || 30_000,
  minDelayMs: Number(process.env.SCRAPER_MIN_DELAY_MS) || 1_000,
  maxDelayMs: Number(process.env.SCRAPER_MAX_DELAY_MS) || 3_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 10,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,

  allowedDomains: [
    "mercadolibre.com",
    "mercadolibre.com.ar",
    "mercadolibre.com.mx",
    "mercadolibre.com.co",
    "mercadolibre.com.cl",
    "mercadolibre.com.pe",
    "mercadolibre.com.uy",
    "mercadolibre.com.ve",
    "mercadolibre.com.bo",
    "mercadolibre.com.ec",
    "mercadolibre.com.py",
    "mercadolibre.com.cr",
    "mercadolibre.com.do",
    "mercadolivre.com",
    "mercadolivre.com.br",
  ],

  userAgents: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  ],

  selectors: {
    title: [
      "h1.ui-pdp-title",
      "h1[class*='pdp-title']",
      ".ui-pdp-header__title-container h1",
      "h1",
    ],
    price: [
      ".ui-pdp-price__second-line .andes-money-amount__fraction",
      ".ui-pdp-price .andes-money-amount__fraction",
      "[data-testid='price-component'] .andes-money-amount__fraction",
      ".price-tag-fraction",
    ],
    originalPrice: [
      ".ui-pdp-price__original-value .andes-money-amount__fraction",
      ".ui-pdp-price__second-line .ui-pdp-price__original-value .andes-money-amount__fraction",
      ".andes-money-amount--previous .andes-money-amount__fraction",
      ".price-tag-amount-strike .price-tag-fraction",
    ],
    currency: [
      ".ui-pdp-price__second-line .andes-money-amount__currency-symbol",
      ".andes-money-amount__currency-symbol",
      ".price-tag-symbol",
    ],
    discountPercentage: [
      ".ui-pdp-price__second-line .andes-money-amount__discount",
      ".ui-pdp-price__discount",
      "[data-testid='price-discount']",
    ],
    images: [
      ".ui-pdp-gallery figure img",
      ".ui-pdp-image.ui-pdp-gallery__figure__image",
      ".gallery-image",
      "figure.ui-pdp-gallery__figure img",
    ],
    description: [
      ".ui-pdp-description__content",
      "p.ui-pdp-description__content",
      "[data-testid='description-content']",
      ".item-description__text",
    ],
  },
} as const;
