/**
 * Parsea un string de precio (ej: "1.299", "1,299", "1299") a número.
 */
export function parsePrice(raw: string): number | null {
  if (!raw) return null;
  // Eliminar separadores de miles (puntos o comas seguidos de 3 dígitos al final)
  // y convertir coma decimal a punto
  const cleaned = raw
    .replace(/[^\d,.-]/g, "") // solo dígitos, coma, punto, guión
    .replace(/\.(?=\d{3}(?:[,.]|$))/g, "") // quitar puntos de miles
    .replace(",", "."); // coma decimal → punto
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Limpia texto: quita whitespace innecesario y caracteres de control.
 */
export function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Extrae el porcentaje numérico de un string como "% OFF 25" o "25% OFF"
 */
export function parseDiscountPercentage(raw: string): number | null {
  const match = raw.match(/(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return isNaN(n) ? null : n;
}

/**
 * Filtra y deduplica URLs de imágenes, convirtiendo thumbnails a versiones full.
 */
export function normalizeImageUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls
    .map((u) => {
      try {
        // MercadoLibre usa sufijos como -O.jpg, -I.jpg, -F.jpg; queremos -O (original)
        return u
          .replace(/-[A-Z]\.jpg(\?.*)?$/, "-O.jpg")
          .replace(/-[A-Z]\.webp(\?.*)?$/, "-O.webp")
          .split("?")[0]; // quitar query strings
      } catch {
        return u;
      }
    })
    .filter((u) => {
      if (!u || seen.has(u)) return false;
      // Descartar placeholders y data URIs
      if (u.startsWith("data:")) return false;
      seen.add(u);
      return true;
    });
}
