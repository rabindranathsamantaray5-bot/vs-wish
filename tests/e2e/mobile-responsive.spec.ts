import { expect, test } from "@playwright/test";

for (const width of [320, 375, 430]) {
  test(`homepage sections remain responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("mobile-menu-btn")).toBeVisible();

    for (const sectionId of [
      "home-categories",
      "home-trending",
      "home-how",
      "home-benefits",
      "home-stats",
      "home-testimonials",
      "home-faq",
      "home-cta",
    ]) {
      const section = page.getByTestId(sectionId);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    }

    await expect(page.getByRole("heading", { name: /Trending Templates/i })).toBeVisible({
      timeout: 30_000,
    });
    const firstTemplate = page.locator('[data-testid^="template-card-"]').first();
    await expect(firstTemplate).toBeVisible({ timeout: 30_000 });
    const railMetrics = await page.getByTestId("mobile-template-rail").evaluate((rail) => ({
      clientWidth: rail.clientWidth,
      scrollWidth: rail.scrollWidth,
      firstCardWidth: rail.firstElementChild?.getBoundingClientRect().width || 0,
    }));
    expect(railMetrics.scrollWidth).toBeGreaterThan(railMetrics.clientWidth);
    expect(railMetrics.firstCardWidth).toBeGreaterThanOrEqual(width * 0.7);
    expect(railMetrics.firstCardWidth).toBeLessThan(width);

    const firstCategory = page.getByTestId("homepage-categories-grid").locator("a").first();
    await firstCategory.scrollIntoViewIfNeeded();
    await expect(firstCategory).toBeVisible({ timeout: 30_000 });
    expect((await firstCategory.boundingBox())?.width || 0).toBeGreaterThan(110);

    const firstBenefit = page.getByTestId("home-benefits").locator("h3").first().locator("..");
    await firstBenefit.scrollIntoViewIfNeeded();
    const benefitWidth = (await firstBenefit.boundingBox())?.width || 0;
    expect(benefitWidth).toBeGreaterThan(width < 390 ? width - 50 : 150);

    const ctaForm = page.getByTestId("home-cta").locator("form");
    await ctaForm.scrollIntoViewIfNeeded();
    const [emailBox, subscribeBox] = await Promise.all([
      ctaForm.locator("input").boundingBox(),
      ctaForm.locator("button").boundingBox(),
    ]);
    expect(emailBox).not.toBeNull();
    expect(subscribeBox).not.toBeNull();
    if (width < 380) {
      expect(subscribeBox!.y).toBeGreaterThan(emailBox!.y);
    } else {
      expect(Math.abs(subscribeBox!.y - emailBox!.y)).toBeLessThan(4);
    }

    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      sections: [...document.querySelectorAll("main > section")].map((section) => {
        const box = section.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      }),
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    for (const section of layout.sections) {
      expect(section.left).toBeGreaterThanOrEqual(-1);
      expect(section.right).toBeLessThanOrEqual(width + 1);
    }
  });
}
