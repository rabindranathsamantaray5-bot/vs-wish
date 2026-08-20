import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/audit/screenshots")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # 1. Test Home Page
        await page.goto("http://localhost:8080", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "home_page.png"))
        print(f"Home page loaded: {page.url}")

        # 2. Test Templates Page
        await page.goto("http://localhost:8080/templates")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "templates_page.png"))
        print(f"Templates page loaded: {page.url}")

        # 3. Test Admin Login Page
        await page.goto("http://localhost:8080/admin/login")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "admin_login.png"))
        print(f"Admin login page loaded: {page.url}")

        # 4. Attempt direct access to Admin Dashboard (should fail/redirect)
        await page.goto("http://localhost:8080/admin")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "admin_dashboard_unauth.png"))
        print(f"Admin dashboard (unauth) attempted: {page.url}")

        # 5. Check Customer Registration/Login
        await page.goto("http://localhost:8080/account/login")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "customer_login.png"))
        print(f"Customer login page loaded: {page.url}")

        await browser.close()

asyncio.run(main())
