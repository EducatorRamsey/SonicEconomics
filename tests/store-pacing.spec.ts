import { test, expect } from "@playwright/test";
import { start, state } from "./helpers";

test("meet the tumbleweed and earn currency before reaching the first store", async ({
  page,
}) => {
  await start(page);
  await expect(page.locator("#shop-open")).toBeHidden();
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await state(page)).hearts, { timeout: 15000 })
    .toBeLessThan(3);
  await expect(page.locator("#shop-open")).toBeHidden();
  expect((await state(page)).purchases).toEqual([]);
  await expect(page.locator("#shop-open")).toBeVisible({ timeout: 20000 });
  await page.keyboard.press("e");
  await page.keyboard.up("ArrowRight");
  expect((await state(page)).tokens).toBeGreaterThanOrEqual(10);
  await expect(page.locator("#store-controls")).toBeVisible();
  await page.locator("#store-browse").click();
  await expect(page.locator("#buy-shield")).toBeEnabled();
  await expect(page.locator("#buy-boost")).toBeEnabled();
});
