import { test, expect } from "@playwright/test";
import { levels } from "../src/course";
for (const fallback of [false, true]) {
  test(`fullscreen ${fallback ? "page fallback" : "browser mode"} keeps controls, questions, and exit usable`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() =>
        Object.defineProperty(document, "fullscreenEnabled", {
          get: () => false,
        }),
      );
    await page.goto("/?test=1");
    const normalCanvasWidth = await page
      .locator("#canvas canvas")
      .evaluate((el) => el.getBoundingClientRect().width);
    await page.locator("#title-fullscreen").click();
    const shell = page.locator(".game-shell");
    await expect(shell).toHaveClass(/is-expanded/);
    await expect(page.locator("#fullscreen")).toHaveText("Exit full screen");
    if (!fallback)
      expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(
        true,
      );
    const box = await shell.boundingBox();
    expect(box!.width).toBe(page.viewportSize()!.width);
    expect(box!.height).toBe(page.viewportSize()!.height);
    await expect
      .poll(() =>
        page
          .locator("#canvas canvas")
          .evaluate((el) => el.getBoundingClientRect().width),
      )
      .toBeGreaterThan(normalCanvasWidth + 100);
    await page.locator("#start").click();
    await expect
      .poll(() => page.evaluate(() => (window as any).rr.scene.activePlay))
      .toBe(true);
    await expect(
      page.getByRole("button", { name: "Jump", exact: true }),
    ).toBeInViewport();
    await page.locator("#game-settings").click();
    await expect(page.locator("#setting-speed")).toBeVisible();
    await page.locator("#settings-done").click();
    await page.locator("#resume").click();
    await page.evaluate((x) => (window as any).rr.teleport(x), levels[0].shop);
    await page.locator("#shop-open").click();
    await expect(page.locator("#store-controls")).toBeVisible();
    await page.locator("#store-browse").click();
    await expect(page.locator("#buy-shield")).toBeVisible();
    await page.locator("#leave-shop").click();
    await page.locator("#store-exit").click();
    await page.evaluate(
      (x) => (window as any).rr.teleport(x),
      levels[0].end + 100,
    );

    await expect(page.locator("#dialog-title")).toHaveText(
      "A little water, many gardens",
    );
    await page.locator('[data-answer="0"]').click();
    await page.locator("#question-continue").click();
    await page.locator("#next-level").click();
    await page.locator("#fullscreen").click();
    await expect(shell).not.toHaveClass(/is-expanded/);
    await page.keyboard.press("f");
    await expect(shell).toHaveClass(/is-expanded/);
    await page.keyboard.press("Escape");
    await expect(shell).not.toHaveClass(/is-expanded/);
    expect(await page.evaluate(() => (window as any).rr.screen)).toBe("play");
  });
}
