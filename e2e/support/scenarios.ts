import type { Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { PedidosPage } from "../pages/PedidosPage";
import { resolveVisibleLocator } from "./ui";

export function uniqueValue(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export async function ensurePublishedJob(page: Page, titlePrefix = "QA Playwright") {
  const title = uniqueValue(titlePrefix);

  await page.goto("/publish", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);

  await page.getByRole("button", { name: /^Otros$/i }).click();
  await page.getByRole("button", { name: /continuar/i }).click();
  await page.locator('input[placeholder*="Arreglar" i]').fill(title);
  await page.locator("textarea").fill(
    "Publicación creada automáticamente por Playwright para validar el flujo real de Changa.",
  );
  await page.getByRole("button", { name: /continuar/i }).click();
  await page.locator('input[placeholder*="Ubicación" i]').fill("Rafaela, Santa Fe");
  await page.locator('input[type="number"]').fill("15000");
  await page.locator('input[placeholder*="Cuándo" i]').fill("Mañana por la tarde");
  await page.getByRole("button", { name: /continuar/i }).click();
  await page.getByRole("button", { name: /publicar changa/i }).click();
  await page.waitForLoadState("networkidle").catch(() => undefined);

  return title;
}

export async function openMyJobs(page: Page) {
  await page.goto("/my-jobs", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

export async function attemptCreateOrderFromHome(page: Page) {
  const home = new HomePage(page);
  await home.goto();

  const cardCount = await home.getServiceCards().count();
  if (!cardCount) {
    return { created: false, reason: "No hay tarjetas disponibles en /home.", serviceTitle: null };
  }

  const firstCard = home.getServiceCards().first();
  const serviceTitle = ((await firstCard.locator("h3").first().textContent()) ?? "").trim() || null;

  await firstCard.click();
  await page.waitForLoadState("networkidle").catch(() => undefined);

  const cta = await resolveVisibleLocator([
    page.getByRole("button", { name: /contratar|solicitar|enviar postulación|postularme/i }),
    page.locator('button:has-text("Enviar postulación")'),
    page.locator('button:has-text("Contratar")'),
  ]);

  if (!cta) {
    return {
      created: false,
      reason: "La pantalla de detalle no expone un CTA de contratación/postulación verificable.",
      serviceTitle,
    };
  }

  const messageField = await resolveVisibleLocator([
    page.locator("textarea"),
    page.locator('textarea[placeholder*="Contá" i]'),
  ]);
  if (messageField) {
    await messageField.fill("Tengo disponibilidad y puedo avanzar con esta tarea hoy mismo.");
  }

  const amountField = await resolveVisibleLocator([
    page.locator('input[type="number"]'),
    page.locator('input[placeholder*="monto" i]'),
    page.locator('input[placeholder*="precio" i]'),
  ]);
  if (amountField) {
    await amountField.fill("15000");
  }

  await cta.click();
  await page.waitForLoadState("networkidle").catch(() => undefined);

  const success = await resolveVisibleLocator([
    page.locator("text=/pedido creado|solicitud enviada|postulación enviada|éxito|confirmado/i"),
  ]);
  const redirectedToOrders = /\/pedidos(?:\?|$)|\/my-jobs(?:\?|$)|\/chat(?:\?|$)/.test(page.url());

  return {
    created: Boolean(success || redirectedToOrders),
    reason: success || redirectedToOrders ? null : "No apareció confirmación ni navegación posterior al envío.",
    serviceTitle,
  };
}

export async function openOrdersAndGetCount(page: Page) {
  const pedidosPage = new PedidosPage(page);
  await pedidosPage.goto();
  return pedidosPage.getOrderCards().count();
}
