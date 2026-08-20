import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

function loadLocalEnv() {
  const values: Record<string, string> = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match?.[1] && match[2] !== undefined) {
      values[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return values;
}

const env = loadLocalEnv();
const supabaseUrl = env["SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userEmail = `wishfly-e2e-${runId}@example.com`;
const userPassword = `E2e-${runId}-Safe!`;
const wishSlug = `e2e-${runId}`.slice(0, 40);
const builderMediaTitle = `E2E Builder Media ${runId}`;
let userId = "";
let categoryId = "";
let templateId = "";
let createdUserId = "";
let mediaId = "";
let builderMediaId = "";
let planId = "";
let couponId = "";
let originalWebsiteSettings: unknown = null;
let originalSystemSettings: unknown = null;

const adminHeaders = () => ({
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
});

test.describe.serial("WishFly core E2E", () => {
  test.beforeAll(async ({ request }) => {
    expect(supabaseUrl, "SUPABASE_URL must exist in .env").toBeTruthy();
    expect(serviceKey, "SUPABASE_SERVICE_ROLE_KEY must exist in .env").toBeTruthy();

    const [websiteSettings, systemSettings] = await Promise.all([
      request.get(`${supabaseUrl}/rest/v1/website_settings?key=eq.general&select=value`, {
        headers: adminHeaders(),
      }),
      request.get(`${supabaseUrl}/rest/v1/system_settings?key=eq.features&select=value`, {
        headers: adminHeaders(),
      }),
    ]);
    originalWebsiteSettings = (await websiteSettings.json())[0]?.value || {};
    originalSystemSettings = (await systemSettings.json())[0]?.value || {};
    const enableTestFeatures = await request.patch(
      `${supabaseUrl}/rest/v1/system_settings?key=eq.features`,
      {
        headers: adminHeaders(),
        data: {
          value: {
            ...(originalSystemSettings as Record<string, unknown>),
            maintenance_mode: false,
            registration_enabled: true,
            comments_enabled: true,
          },
        },
      },
    );
    if (!enableTestFeatures.ok()) throw new Error(await enableTestFeatures.text());

    const builderMedia = await request.post(`${supabaseUrl}/rest/v1/media_library`, {
      headers: { ...adminHeaders(), Prefer: "return=representation" },
      data: {
        title: builderMediaTitle,
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
        type: "image",
        tags: "e2e,builder",
      },
    });
    if (!builderMedia.ok()) throw new Error(await builderMedia.text());
    builderMediaId = (await builderMedia.json())[0].id;
    const response = await request.post(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: adminHeaders(),
      data: {
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: { full_name: "WishFly E2E User" },
      },
    });
    if (!response.ok()) throw new Error(await response.text());
    userId = (await response.json()).id;
    const roleResponse = await request.post(`${supabaseUrl}/rest/v1/user_roles`, {
      headers: { ...adminHeaders(), Prefer: "return=minimal" },
      data: { user_id: userId, role: "admin" },
    });
    if (!roleResponse.ok()) throw new Error(await roleResponse.text());
  });

  test.afterAll(async ({ request }) => {
    if (originalWebsiteSettings) {
      await request.patch(`${supabaseUrl}/rest/v1/website_settings?key=eq.general`, {
        headers: adminHeaders(),
        data: { value: originalWebsiteSettings },
      });
    }
    if (originalSystemSettings) {
      await request.patch(`${supabaseUrl}/rest/v1/system_settings?key=eq.features`, {
        headers: adminHeaders(),
        data: { value: originalSystemSettings },
      });
    }
    if (couponId) {
      await request.delete(`${supabaseUrl}/rest/v1/coupons?id=eq.${couponId}`, {
        headers: adminHeaders(),
      });
    }
    if (planId) {
      await request.delete(`${supabaseUrl}/rest/v1/plans?id=eq.${planId}`, {
        headers: adminHeaders(),
      });
    }
    if (mediaId) {
      await request.delete(`${supabaseUrl}/rest/v1/media_library?id=eq.${mediaId}`, {
        headers: adminHeaders(),
      });
    }
    if (builderMediaId) {
      await request.delete(`${supabaseUrl}/rest/v1/media_library?id=eq.${builderMediaId}`, {
        headers: adminHeaders(),
      });
    }
    if (templateId) {
      await request.delete(`${supabaseUrl}/rest/v1/templates?id=eq.${templateId}`, {
        headers: adminHeaders(),
      });
    }
    if (categoryId) {
      await request.delete(`${supabaseUrl}/rest/v1/categories?id=eq.${categoryId}`, {
        headers: adminHeaders(),
      });
    }
    if (!userId) return;
    if (createdUserId) {
      await request.delete(`${supabaseUrl}/auth/v1/admin/users/${createdUserId}`, {
        headers: adminHeaders(),
      });
    }
    await request.delete(`${supabaseUrl}/rest/v1/wishes?user_id=eq.${userId}`, {
      headers: adminHeaders(),
    });
    await request.delete(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      headers: adminHeaders(),
    });
  });

  test("mobile home has no horizontal overflow and generation endpoints work", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("mobile-menu-btn")).toBeVisible();
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        { timeout: 10_000 },
      )
      .toBeLessThanOrEqual(0);

    const message = await request.post("/api/wishes/generate", {
      data: { name: "Riya", occasion: "Birthday", from: "Amit" },
    });
    expect(message.ok()).toBeTruthy();
    expect((await message.json()).message).toContain("Riya");

    const cover = await request.post("/api/wishes/cover", {
      data: { occasion: "Birthday", recipient: "Riya", theme: "birthday" },
    });
    expect(cover.ok()).toBeTruthy();
    expect((await cover.json()).image).toMatch(/^data:image\/svg\+xml/);

    await page.goto("/templates");
    await expect(page.getByText("Supabase Fields")).toHaveCount(0);
  });

  test("templates header matches the logged-in home header", async ({ page, request }) => {
    const settingsResponse = await request.get("/api/public/settings");
    expect(settingsResponse.ok()).toBeTruthy();
    const siteName = (await settingsResponse.json()).site.siteName;
    await page.goto("/account/login?redirect=%2Faccount");
    const submitButton = page.getByRole("button", { name: "Sign In" });
    await expect(submitButton).toBeEnabled({ timeout: 45_000 });
    await page.locator('input[type="email"]').fill(userEmail);
    await page.locator('input[type="password"]').fill(userPassword);
    await submitButton.click();
    await expect(page).toHaveURL(/\/account\/?$/);
    await expect(page.getByText("Welcome back")).toBeVisible();

    await page.goto("/");
    await expect(page.getByTestId("header-my-account")).toBeVisible({ timeout: 20_000 });
    const homeAccountName = page.getByTestId("header-my-account").locator("span").last();
    await expect(homeAccountName).toHaveText("WishFly");
    await expect(page.getByTestId("theme-toggle")).toHaveCount(1);
    const homeThemeClasses = await page.getByTestId("theme-toggle").getAttribute("class");

    await page.goto("/templates");
    await expect(page.locator("header").getByText(siteName, { exact: true })).toBeVisible();
    await expect(page.getByTestId("header-my-account")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("header-my-account").locator("span").last()).toHaveText(
      "WishFly",
    );
    await expect(page.getByTestId("theme-toggle")).toHaveCount(1);
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute("class", homeThemeClasses || "");
  });

  test("every footer destination opens with the shared premium header and footer", async ({
    page,
  }) => {
    test.slow();
    const routes = [
      "/",
      "/templates",
      "/categories",
      "/how-it-works",
      "/pricing",
      "/help-center",
      "/faq",
      "/contact",
      "/privacy-policy",
      "/terms-of-service",
      "/about",
      "/blog",
      "/careers",
      "/affiliate-program",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return HTTP 200`).toBe(200);
      await expect(page.getByTestId("site-header"), `${route} header`).toBeVisible();
      await expect(page.getByTestId("site-footer"), `${route} footer`).toBeAttached();
    }

    await page.goto("/");
    const footer = page.getByTestId("site-footer");
    for (const route of routes.slice(1)) {
      expect(
        await footer.locator(`a[href="${route}"]`).count(),
        `${route} should have at least one footer link`,
      ).toBeGreaterThan(0);
    }
  });

  test("all customer and admin authentication cards have a working cancel action", async ({
    page,
  }) => {
    for (const route of ["/account/login", "/account/register", "/admin/login"]) {
      await page.goto(route);
      const cancel = page.getByTestId("auth-cancel");
      await expect(cancel, `${route} cancel button`).toBeVisible();
      await expect(cancel).toHaveAttribute("href", "/");
      await expect(cancel).toHaveAccessibleName(/cancel/i);
    }

    await page.getByTestId("auth-cancel").click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("customer can login, create and unlock a protected wish, then post a comment", async ({
    page,
    request,
  }) => {
    await page.goto("/account/login?redirect=%2Faccount");
    const submitButton = page.getByRole("button", { name: "Sign In" });
    await expect(submitButton).toBeEnabled({ timeout: 45_000 });
    await page.locator('input[type="email"]').fill(userEmail);
    await page.locator('input[type="password"]').fill(userPassword);
    await submitButton.click();
    await expect(page).toHaveURL(/\/account\/?$/);
    await expect(page.getByText("Welcome back")).toBeVisible();

    await page.goto("/");
    await expect(page.getByTestId("header-my-account")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("open-wish-builder").click();
    await page.getByRole("button", { name: "Library", exact: true }).click();
    await page.getByRole("button", { name: new RegExp(builderMediaTitle) }).click();
    await expect(page.locator('img[alt="cover"]')).toHaveAttribute(
      "src",
      /photo-1519225421980-715cb0215aed/,
    );
    await page.getByRole("button", { name: "Add from Library" }).click();
    await page.getByRole("button", { name: new RegExp(builderMediaTitle) }).click();
    await page.getByTestId("builder-recipient").fill("E2E Recipient");
    await page.getByTestId("builder-from").fill("E2E Sender");
    await page.getByTestId("builder-title").fill("Protected E2E Wish");
    await page.getByTestId("builder-step-1-next").click();
    await page.getByTestId("builder-message").fill("This private content must never leak.");
    await page.getByTestId("builder-step-2-next").click();
    await page.locator('input[placeholder="riya-birthday"]').fill(wishSlug);
    await page.getByTestId("builder-password").fill("WishPass-123!");
    await page.getByTestId("builder-publish").click();
    await expect(page.getByText("Your wish is live!")).toBeVisible({ timeout: 20_000 });

    const publicResponse = await request.get(`/api/public/wish?id=${wishSlug}`);
    expect(publicResponse.ok()).toBeTruthy();
    const publicBody = await publicResponse.json();
    expect(publicBody.protected).toBe(true);
    expect(JSON.stringify(publicBody)).not.toContain("This private content must never leak");
    expect(JSON.stringify(publicBody)).not.toContain("password_hash");

    await page.goto(`/wish/${wishSlug}`);
    await expect(page.getByText("Private Wish")).toBeVisible();
    await page.locator('input[placeholder="Password"]').fill("WishPass-123!");
    await page.getByRole("button", { name: "Unlock Wish" }).click();
    await expect(page.getByText("This private content must never leak.")).toBeVisible();
    await page.locator('input[placeholder="Your name"]').fill("E2E Guest");
    await page.locator('input[placeholder^="Leave a heartfelt note"]').fill("E2E comment works");
    await page.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText("E2E comment works")).toBeVisible();
  });

  test("admin template modal saves changes to the public catalog", async ({ page, request }) => {
    await page.goto("/admin/login");
    const submit = page.getByTestId("login-submit-btn");
    await expect(submit).toBeEnabled({ timeout: 45_000 });
    await page.getByTestId("login-email-input").fill(userEmail);
    await page.getByTestId("login-password-input").fill(userPassword);
    await submit.click();
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 60_000 });

    const token = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (name) => name.startsWith("sb-") && name.endsWith("-auth-token"),
      );
      return key ? JSON.parse(localStorage.getItem(key) || "{}").access_token || "" : "";
    });
    expect(token).toBeTruthy();

    const templateLabel = `Before Save ${runId}`;
    const updatedTemplateLabel = `After Save ${runId}`;
    const createTemplate = await request.post("/api/admin/templates", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: `E2E Template ${runId}`,
        category: "Wedding",
        pages: 9,
        badge: "New",
        label: templateLabel,
        sub: "Admin UI save authentication test",
        photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
        price: 222,
        discountPrice: 111,
        isPremium: true,
        order: -998,
        active: true,
      },
    });
    expect(createTemplate.status()).toBe(200);
    templateId = (await createTemplate.json()).item.id;

    const mediaTitle = `E2E Cover ${runId}`;
    const mediaUrl = "https://images.unsplash.com/photo-1519741497674-611481863552";
    const createMedia = await request.post("/api/admin/media", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: mediaTitle,
        url: mediaUrl,
        type: "image",
        tags: "e2e, cover",
      },
    });
    expect(createMedia.status()).toBe(200);
    mediaId = (await createMedia.json()).item.id;

    await page.goto("/admin/templates");
    await page.getByTestId(`tpl-edit-${templateId}`).click();
    await expect(
      page.locator("select").filter({ has: page.locator('option[value="Wedding"]') }),
    ).toBeVisible();
    await page.getByTestId("tpl-field-title").fill(`Updated Template ${runId}`);
    await page.getByTestId("tpl-field-pages").fill("12");
    await page.getByTestId("tpl-field-label").fill(updatedTemplateLabel);
    await page.getByTestId("tpl-field-price").fill("321");
    await page.getByText("Choose cover from Media Library").click();
    await page.getByRole("button", { name: new RegExp(mediaTitle) }).click();
    await page.getByTestId("tpl-field-discount").fill("0");
    await expect(page.getByTestId("tpl-field-premium")).toBeDisabled();
    await expect(page.getByTestId("tpl-field-premium")).not.toBeChecked();
    await page.getByTestId("tpl-save-btn").click();
    await expect(page.getByText("Updated — live on customer site")).toBeVisible();

    const publicTemplates = await request.get("/api/public/templates?limit=100");
    expect(publicTemplates.status()).toBe(200);
    const publicTemplate = (await publicTemplates.json()).items.find(
      (item: { id: string }) => item.id === templateId,
    );
    expect(publicTemplate).toMatchObject({
      title: `Updated Template ${runId}`,
      label: updatedTemplateLabel,
      photo: mediaUrl,
      pages: 12,
      price: 321,
      discountPrice: 0,
      isPremium: false,
      category: "Wedding",
    });

    await page.goto("/templates");
    await expect(page.getByTestId(`template-card-${templateId}`)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId(`template-card-${templateId}`).getByText("Free")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("admin RBAC login and users listing work", async ({ page, request }) => {
    test.slow();
    await page.goto("/admin/login");
    const submit = page.getByTestId("login-submit-btn");
    await expect(submit).toBeEnabled({ timeout: 45_000 });
    await page.getByTestId("login-email-input").fill(userEmail);
    await page.getByTestId("login-password-input").fill(userPassword);
    await submit.click();
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 60_000 });

    const token = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (name) => name.startsWith("sb-") && name.endsWith("-auth-token"),
      );
      return key ? JSON.parse(localStorage.getItem(key) || "{}").access_token || "" : "";
    });
    expect(token).toBeTruthy();
    const usersResponse = await request.get("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(usersResponse.status()).toBe(200);
    const users = await usersResponse.json();
    expect(users.items.some((item: { id: string }) => item.id === userId)).toBe(true);

    const createdUserEmail = `admin-created-${runId}@example.com`;
    const createUser = await request.post("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "Admin Created E2E",
        email: createdUserEmail,
        password: `Created-${runId}!`,
        role: "user",
      },
    });
    expect(createUser.status()).toBe(200);
    createdUserId = (await createUser.json()).item.id;

    const createPlan = await request.post("/api/admin/plans", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: `E2E Plan ${runId}`,
        slug: `e2e-plan-${runId}`,
        description: "Visible public E2E plan",
        price: 777,
        currency: "INR",
        billing_period: "monthly",
        is_active: true,
        is_visible: true,
        display_order: -999,
        features: ["First feature", "Second feature"],
      },
    });
    expect(createPlan.status()).toBe(200);
    planId = (await createPlan.json()).item.id;

    const couponCode = `E2E${runId.replace(/[^a-z0-9]/gi, "").slice(-10)}`.toUpperCase();
    const createCoupon = await request.post("/api/admin/coupons", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        code: couponCode,
        description: "E2E percentage coupon",
        discount_type: "percentage",
        discount_value: 20,
        minimum_amount: 100,
        maximum_discount: 50,
        usage_limit: 10,
        per_user_limit: 1,
        is_active: true,
      },
    });
    expect(createCoupon.status()).toBe(200);
    couponId = (await createCoupon.json()).item.id;

    const couponQuote = await request.post("/api/public/coupons/validate", {
      data: { code: couponCode, amount: 300 },
    });
    expect(couponQuote.status()).toBe(200);
    expect((await couponQuote.json()).quote).toMatchObject({
      originalAmount: 300,
      discount: 50,
      finalAmount: 250,
    });

    const catalogResponse = await request.get("/api/public/templates?limit=100");
    const paidTemplate = (await catalogResponse.json()).items.find(
      (item: { price: number; discountPrice: number | null }) =>
        (item.discountPrice == null ? item.price : item.discountPrice) >= 100,
    );
    expect(paidTemplate).toBeTruthy();
    const customerPrice =
      paidTemplate.discountPrice == null ? paidTemplate.price : paidTemplate.discountPrice;
    const expectedCouponDiscount = Math.min(50, customerPrice * 0.2);
    await page.goto("/templates");
    const paidCard = page.getByTestId(`template-card-${paidTemplate.id}`);
    await paidCard.getByPlaceholder("Coupon code").fill(couponCode);
    await paidCard.getByRole("button", { name: "Apply" }).click();
    await expect(paidCard.getByTestId("coupon-quote")).toContainText(
      `Pay ₹${customerPrice - expectedCouponDiscount}`,
    );

    await page.goto("/pricing");
    const publicPlan = page.getByTestId("public-plans").getByText(`E2E Plan ${runId}`);
    await expect(publicPlan).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("First feature")).toBeVisible();

    for (const [path, testId] of [
      ["/admin/users", "users-admin-page"],
      ["/admin/templates", "templates-admin-page"],
      ["/admin/categories", "categories-admin-page"],
      ["/admin/media", "media-admin-page"],
      ["/admin/plans", "plan-admin-page"],
      ["/admin/coupons", "coupon-admin-page"],
      ["/admin/comments", "comment-admin-page"],
    ]) {
      await page.goto(path);
      await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
    }

    await expect(page.getByRole("button", { name: "Add New" })).toHaveCount(0);
    const commentRow = page.getByRole("row").filter({ hasText: "E2E comment works" });
    await expect(commentRow).toBeVisible();
    await commentRow.locator("select").selectOption("rejected");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("row").filter({ hasText: "E2E comment works" }).locator("select"),
    ).toHaveValue("rejected");

    await page.goto("/admin/settings/website");
    await expect(page.locator("h1").filter({ hasText: "Website Settings" })).toBeVisible();
    await page.goto("/admin/settings/system");
    await expect(page.locator("h1").filter({ hasText: "System Settings" })).toBeVisible();

    const categoryName = `E2E Category ${runId}`;
    const createCategory = await request.post("/api/admin/categories", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: categoryName,
        img: "🧪",
        bg: "from-cyan-100 to-teal-100",
        order: -999,
        active: true,
      },
    });
    expect(createCategory.status()).toBe(200);
    categoryId = (await createCategory.json()).item.id;

    await page.goto("/");
    const category = page.getByTestId(`cat-link-${categoryName}`);
    await expect(category).toBeVisible();
    await expect(category.getByText("🧪")).toBeVisible();
    await expect(category.locator('[style*="background-image"]').first()).toHaveAttribute(
      "style",
      /--color-cyan-100/,
    );
    await expect(page.getByTestId("homepage-categories-grid").locator("a").first()).toContainText(
      categoryName,
    );

    const hideCategory = await request.patch(`/api/admin/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { active: false },
    });
    expect(hideCategory.status()).toBe(200);

    const categoriesLoaded = page.waitForResponse(
      (response) => response.url().includes("/api/public/categories") && response.status() === 200,
    );
    await page.reload();
    await categoriesLoaded;
    await expect(page.getByTestId("homepage-categories-grid")).toBeVisible();
    await expect(category).toHaveCount(0);
  });

  test("website and system settings control the public application", async ({ page, request }) => {
    test.slow();
    const temporarySite = {
      ...(originalWebsiteSettings as Record<string, unknown>),
      site_name: `E2E Brand ${runId}`,
      tagline: `E2E Tagline ${runId}`,
      support_email: `support-${runId}@example.com`,
      default_meta_title: `E2E Meta ${runId}`,
      default_meta_description: `E2E Description ${runId}`,
    };
    const disabledFeatures = {
      ...(originalSystemSettings as Record<string, unknown>),
      maintenance_mode: false,
      registration_enabled: false,
      comments_enabled: false,
    };

    const [siteUpdate, featureUpdate] = await Promise.all([
      request.patch(`${supabaseUrl}/rest/v1/website_settings?key=eq.general`, {
        headers: adminHeaders(),
        data: { value: temporarySite },
      }),
      request.patch(`${supabaseUrl}/rest/v1/system_settings?key=eq.features`, {
        headers: adminHeaders(),
        data: { value: disabledFeatures },
      }),
    ]);
    expect(siteUpdate.ok()).toBeTruthy();
    expect(featureUpdate.ok()).toBeTruthy();

    await page.goto("/");
    await expect(
      page.locator("header").getByText(`E2E Brand ${runId}`, { exact: true }),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveTitle(`E2E Meta ${runId}`);

    await page.goto("/account/register");
    await expect(page.getByTestId("registration-disabled")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /Create Account/ })).toBeDisabled();

    await page.goto(`/wish/${wishSlug}`);
    await page.locator('input[placeholder="Password"]').fill("WishPass-123!");
    await page.getByRole("button", { name: "Unlock Wish" }).click();
    await expect(page.getByTestId("comments-disabled")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Post" })).toBeDisabled();

    const maintenanceUpdate = await request.patch(
      `${supabaseUrl}/rest/v1/system_settings?key=eq.features`,
      {
        headers: adminHeaders(),
        data: { value: { ...disabledFeatures, maintenance_mode: true } },
      },
    );
    expect(maintenanceUpdate.ok()).toBeTruthy();
    await page.goto("/");
    await expect(page.getByTestId("maintenance-page")).toBeVisible({ timeout: 30_000 });

    await page.goto("/admin/login");
    await expect(page.getByTestId("login-submit-btn")).toBeVisible();
    await expect(page.getByTestId("maintenance-page")).toHaveCount(0);
  });
});
