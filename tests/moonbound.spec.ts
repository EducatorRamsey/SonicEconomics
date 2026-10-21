import { levels } from "../src/course";
import { test, expect } from "@playwright/test";
import {
  start,
  state,
  advanceTo,
  enterStore,
  teleport,
  visitGate,
  answer,
} from "./helpers";

test("destinations replace scenery, collectibles, gravity and store equipment; rocket lands on the Moon", async ({
  page,
}) => {
  await start(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const world = () =>
    page.evaluate(() => {
      const r = (window as any).rr,
        s = r.scene;
      return {
        gravity: s.physics.world.gravity.y,
        textures: [
          ...new Set(s.tokens.getChildren().map((t: any) => t.texture.key)),
        ],
        labels: s.children.list
          .filter((c: any) => c.type === "Text")
          .map((c: any) => c.text),
        hazards: s.hazards.getChildren().map((h: any) => h.texture.key),
      };
    });
  expect((await world()).textures).toEqual(["token"]);
  expect((await world()).labels.join(" ")).toContain("ALBUQUERQUE");
  await advanceTo(page, 1);
  expect((await world()).textures).toEqual(["token"]);
  expect((await world()).hazards).toEqual(Array(8).fill("barrier"));
  expect((await world()).labels.join(" ")).toContain("AUSTIN LAUNCH WORKS");
  expect((await world()).labels.join(" ")).not.toContain("ALBUQUERQUE");
  await page.evaluate(() => {
    (window as any).rr.progress.tokens = 50;
  });
  await enterStore(page);
  await page.locator("#store-browse").click();
  await expect(page.locator("#buy-shield")).toHaveCount(0);
  await page.locator("#buy-magnet").click();
  await page.locator("#buy-boots").click();
  expect((await state(page)).tokens).toBe(23);
  const paused = (await state(page)).magnet;
  await page.waitForTimeout(300);
  expect((await state(page)).magnet).toBe(paused);
  await page.locator("#leave-shop").click();
  await page.locator("#store-exit").click();
  const coins = (await state(page)).tokens;
  await teleport(page, levels[1].left + 11000, 300);
  await expect
    .poll(async () => (await state(page)).tokens)
    .toBeGreaterThan(coins);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).rr.scene.player.body.velocity.x),
    )
    .toBeGreaterThan(650);
  await page.keyboard.up("ArrowRight");
  await visitGate(page, 1);
  await answer(page, 1, false);
  await page.locator("#next-level").click();
  await expect(page.locator("#land-now")).toBeVisible();
  expect((await state(page)).level).toBe(1);
  expect((await state(page)).active).toBe(false);
  await page.locator("#land-now").click();
  await expect.poll(async () => (await state(page)).level).toBe(2);
  expect((await world()).gravity).toBe(650);
  expect((await world()).textures).toEqual(["token"]);
  expect((await world()).hazards).toContain("energy");
  expect((await world()).labels.join(" ")).toContain("THE MOON");
  expect((await world()).labels.join(" ")).not.toContain("AUSTIN");
  // Fund the effects-only fixture; the scarcity budget is covered separately.
  await page.evaluate(() => {
    (window as any).rr.progress.tokens = 100;
  });
  await enterStore(page);
  await page.locator("#store-browse").click();
  await expect(page.locator("#buy-magnet")).toHaveCount(0);
  const shield = (await state(page)).shield;
  await page.locator("#buy-armor").click();
  await page.locator("#buy-jets").click();
  expect((await state(page)).shield).toBe(shield + 5);
  expect((await state(page)).jets).toBe(8);
  await page.locator("#leave-shop").click();
  await page.locator("#store-exit").click();
  await teleport(page, levels[2].left + 4000);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  await page.keyboard.press("Space");
  await page.waitForTimeout(250);
  await page.keyboard.press("Space");
  await expect.poll(async () => (await state(page)).jets).toBe(7);
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.body.velocity.y),
  ).toBeLessThan(-300);
  expect(errors).toEqual([]);
});
