import { test, expect, Page } from "@playwright/test";
import { start, state, visitGate, answer, advanceTo } from "./helpers";

async function choose(page: Page, correct = true) {
  const value = await page.evaluate(() => (window as any).rr.quizAnswer);
  await page
    .locator(`[data-answer="${correct ? value : (value + 1) % 3}"]`)
    .click();
  await page.locator("#question-continue").click();
}
test("three randomized questions preview a wearable prize; fresh retries, saved answers, narration and rewards persist", async ({
  page,
}) => {
  test.setTimeout(90000);
  await start(page);
  await visitGate(page, 0);
  await expect(page.locator(".prize-preview")).toContainText(
    "Desert dash shoes",
  );
  const first = (await state(page)).attempt.ids;
  const before = (await state(page)).elapsed;
  await page.waitForTimeout(250);
  expect((await state(page)).elapsed).toBe(before);
  await page.evaluate(() => {
    (window as any).__speech = [];
    speechSynthesis.speak = (u) => (window as any).__speech.push(u.text);
  });
  await page.locator("#listen").click();
  expect(await page.evaluate(() => (window as any).__speech[0])).toMatch(
    /Answer A\..*Answer B\..*Answer C\./,
  );
  await choose(page, false);
  await choose(page);
  await choose(page);
  await expect(page.locator("#dialog-title")).toHaveText("2 out of three");
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([]);
  await page.locator("#quiz-retry").click();
  expect(
    (await state(page)).attempt.ids.some((id: number) => first.includes(id)),
  ).toBe(false);
  for (let i = 0; i < 3; i++) await choose(page);
  await expect(page.locator("#dialog-title")).toHaveText("Three out of three!");
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([0]);
  await page.reload();
  await page.locator("#continue-save").click();
  await expect(page.locator("#dialog-title")).toHaveText("Three out of three!");
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([0]);
  await page.locator("#result-settings").click();
  await page.locator("#settings-done").click();
  await page.locator("#question-continue").click();
  await page.locator("#next-level").click();
  await expect.poll(async () => (await state(page)).level).toBe(1);
  await visitGate(page, 1);
  await answer(page, 1);
  await visitGate(page, 2);
  await answer(page, 2);
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([
    0, 1, 2,
  ]);
  expect((await state(page)).scores).toEqual([3, 3, 3]);
  expect((await state(page)).jets).toBe(4);
  expect((await state(page)).shield).toBe(2);
  expect(
    await page.evaluate(
      () => (window as any).rr.scene.player.outfit.commandBuffer.length,
    ),
  ).toBeGreaterThan(0);
  await expect(page.locator("#dialog-title")).toHaveText(
    "A trail well traveled.",
  );
});

test("students may complete three questions and continue without a prize", async ({
  page,
}) => {
  await start(page);
  await visitGate(page, 0);
  for (let i = 0; i < 3; i++) await choose(page, false);
  await expect(page.locator("#quiz-retry")).toBeVisible();
  await page.locator("#question-continue").click();
  expect((await state(page)).completedLevels).toEqual([0]);
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([]);
  await expect(page.locator("#next-level")).toBeVisible();
});

test("three lost hearts produce X eyes, a fall-over animation, descending sound and a saved game over requiring a fresh start", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    (window as any).__tones = [];
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      createOscillator() {
        const o = super.createOscillator(),
          start = o.start.bind(o);
        o.start = (when?: number) => {
          (window as any).__tones.push(o.frequency.value);
          start(when);
        };
        return o;
      }
    };
  });
  await start(page);
  await advanceTo(page, 1);
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.progress.shield = 0;
    r.progress.tokens = 7;
    r.scene.hurt();
  });
  await expect(page.locator("#notice")).toHaveAttribute("data-tone", "urgent");
  await expect(page.locator("#notice")).toHaveAttribute("role", "alert");
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.scene.invulnerable = 0;
    r.scene.hurt();
    r.scene.invulnerable = 0;
    r.scene.hurt();
  });
  expect((await state(page)).hearts).toBe(0);
  expect((await state(page)).active).toBe(false);
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.texture.key),
  ).toBe("bird-dead");
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.scene.player.angle), {
      intervals: [40],
    })
    .toBeGreaterThan(80);
  await expect(page.locator("#dialog-title")).toHaveText("Game over");
  expect(await page.evaluate(() => (window as any).__tones.slice(-3))).toEqual([
    330, 247, 165,
  ]);
  await page.locator("#gameover-settings").click();
  await page.locator("#settings-done").click();
  await expect(page.locator("#dialog-title")).toHaveText("Game over");
  await page.reload();
  await expect(page.locator("#start-again")).toBeVisible();
  await page.locator("#start-again").click();
  await expect.poll(async () => (await state(page)).active).toBe(true);
  expect((await state(page)).over).toBe(false);
  expect((await state(page)).level).toBe(0);
  expect((await state(page)).hearts).toBe(3);
  expect((await state(page)).tokens).toBe(0);
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).rr.scene.player.body.maxVelocity.x),
    )
    .toBe(660);
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toEqual([0]);
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.texture.key),
  ).not.toBe("bird-dead");
});

test("title uses readable type and contains no update notes; neutral messages are gray", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await expect(page.locator(".title-panel")).not.toContainText("longer");
  await expect(page.locator(".title-panel")).not.toContainText("No game over");
  for (const selector of [
    ".title-panel .eyebrow",
    ".title-panel .lead",
    ".title-panel .text-btn",
  ])
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16);
  await page.locator("#title-prizes").click();
  await expect(page.locator(".prize-preview")).toHaveCount(3);
  await page.locator("#collection-back").click();
  await page.locator("#start").click();
  await expect(page.locator("#notice")).toHaveAttribute("data-tone", "neutral");
  expect(
    await page
      .locator("#notice")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(229, 231, 235)");
  await page.locator("#pause").click();
  await page.locator("#home").click();
  await expect(page.locator("#notice")).toBeEmpty();
  await expect(page.locator("#notice")).toBeHidden();
});
