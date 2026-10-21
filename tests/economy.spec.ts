import { test, expect } from "@playwright/test";
import { coinPositions, levels } from "../src/course";
import { start, state, teleport, enterStore } from "./helpers";

test("finite coins force a choice; purchased stock stays sold out and spring gear improves jumps", async ({
  page,
}) => {
  await start(page);
  for (const level of levels)
    expect(
      coinPositions.filter((p) => p.x >= level.left && p.x < level.right),
    ).toHaveLength(50);
  for (const c of coinPositions.filter((c) => c.x < levels[0].shop))
    await teleport(page, c.x, c.y);
  expect((await state(page)).tokens).toBe(26);
  await enterStore(page);
  await page.locator("#store-browse").click();
  await page.locator("#buy-boost").click();
  expect((await state(page)).tokens).toBe(1);
  await expect(page.locator("#buy-boost")).toBeDisabled();
  await expect(page.locator("#buy-boost")).toContainText("Sold out");
  await expect(page.locator("#buy-shield")).toBeDisabled();
  await page.locator("#leave-shop").click();
  await page.locator("#store-exit").click();
  await teleport(page, 15000);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  const y = (await state(page)).y;
  await page.keyboard.press("Space");
  await expect
    .poll(async () => (await state(page)).y, { intervals: [30] })
    .toBeLessThan(y - 125);
  await page.reload();
  await page.locator("#continue-save").click();
  expect((await state(page)).tokens).toBe(1);
  await enterStore(page);
  await page.locator("#store-browse").click();
  await expect(page.locator("#buy-boost")).toBeDisabled();
  await expect(page.locator("#buy-boost")).toContainText("Sold out");
  expect((await state(page)).purchases).toEqual(["boost"]);
});
