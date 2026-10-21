import { expect, Page } from "@playwright/test";
import { levels } from "../src/course";
export async function state(page: Page) {
  return page.evaluate(() => {
    const r = (window as any).rr;
    return {
      ...r.progress,
      x: r.scene.player.x,
      y: r.scene.player.y,
      ground: r.scene.player.body.blocked.down,
      active: r.scene.activePlay,
      screen: r.screen,
    };
  });
}
export async function teleport(page: Page, x: number, y = 430) {
  await page.evaluate(({ x, y }) => (window as any).rr.teleport(x, y), {
    x,
    y,
  });
  await page.waitForTimeout(160);
}
export async function start(page: Page) {
  await page.goto("/?test=1");
  await page.locator("#start").click();
  await expect.poll(async () => (await state(page)).active).toBe(true);
  await page.waitForTimeout(300);
}
export async function visitGate(page: Page, id: number) {
  expect((await state(page)).level).toBe(id);
  await teleport(page, levels[id].end + 100);
  await expect(page.locator('[data-answer="0"]')).toBeVisible();
  expect((await state(page)).screen).toBe("question");
}
export async function answer(page: Page, id: number, advance = true) {
  await page.locator(`[data-answer="${[0, 1, 1][id]}"]`).click();
  await page.locator("#question-continue").click();
  if (id < 2 && advance) {
    await page.locator("#next-level").click();
    await expect.poll(async () => (await state(page)).level).toBe(id + 1);
    await expect.poll(async () => (await state(page)).active).toBe(true);
    await page.waitForTimeout(200);
  }
}
export async function advanceTo(page: Page, id: number) {
  for (let i = (await state(page)).level; i < id; i++) {
    await visitGate(page, i);
    await answer(page, i);
  }
}
export async function enterStore(page: Page) {
  const level = (await state(page)).level;
  await teleport(page, levels[level].shop);
  await page.locator("#shop-open").click();
  await expect(page.locator("#store-controls")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.store.player?.active))
    .toBe(true);
}
