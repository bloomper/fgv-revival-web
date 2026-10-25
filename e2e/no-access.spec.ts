import {consentStored, expect, test} from "./fixtures";

test("a visitor who is not logged in gets the login screen and no app", async ({page}) => {
    await page.goto("/");

    await expect(page.getByText("Du behöver vara inloggad för att använda Nyuppsättning.")).toBeVisible();
    await expect(page.locator('a[href="/api/auth/login"]')).toBeVisible();
    await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0);
});

test("a user without USER sees the no-access page and no revival data", async ({page, loginAs}) => {
    await loginAs("noaccess");
    await page.goto("/");

    await expect(page).toHaveURL(/\/no-access$/);
    await expect(page.getByRole("heading", {name: "Du har inte åtkomst"})).toBeVisible();
    await expect(page.getByText("Ali Baba 2028")).toHaveCount(0);

    await page.goto("/revivals/manage");
    await expect(page).toHaveURL(/\/no-access$/);
});

test("a visitor is told which cookies are used, once", async ({page}) => {
    await page.goto("/");

    await expect(page.getByText("Cookies på den här webbplatsen")).toBeVisible();
    await page.getByRole("button", {name: "Jag förstår"}).click();
    await expect(page.getByText("Cookies på den här webbplatsen")).toHaveCount(0);
    await consentStored(page);

    await page.reload();
    await expect(page.getByText("Du behöver vara inloggad för att använda Nyuppsättning.")).toBeVisible();
    await expect(page.getByText("Cookies på den här webbplatsen")).toHaveCount(0);
});
