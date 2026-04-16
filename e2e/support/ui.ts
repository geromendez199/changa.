import type { Locator } from "@playwright/test";

export async function resolveVisibleLocator(candidates: Locator[]) {
  for (const candidate of candidates) {
    const first = candidate.first();
    const count = await candidate.count().catch(() => 0);
    if (!count) continue;
    if (await first.isVisible().catch(() => false)) return first;
  }

  return null;
}

export async function clickFirstVisible(candidates: Locator[], label: string) {
  const locator = await resolveVisibleLocator(candidates);
  if (!locator) throw new Error(`Could not find a visible control for: ${label}`);
  await locator.click();
  return locator;
}

export async function fillFirstVisible(candidates: Locator[], value: string, label: string) {
  const locator = await resolveVisibleLocator(candidates);
  if (!locator) throw new Error(`Could not find an input for: ${label}`);
  await locator.fill(value);
  return locator;
}
