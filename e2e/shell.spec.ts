import {expect, test} from "./fixtures";

test.describe("The application shell", () => {
    test("shows the FGV logo and the navigation for a super admin", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.locator('a[href="https://www.fgv.nu"]')).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Mina nyuppsättningar"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Alla nyuppsättningar"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Support"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Om"})).toBeVisible();
    });

    test("hides all revivals from a user without a global role", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.getByRole("link", {name: "Mina nyuppsättningar"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Alla nyuppsättningar"})).toHaveCount(0);
    });

    test("offers the FGV account and logging out in the user menu", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/");

        await page.getByRole("button", {name: /Dana Directeur/}).click();
        await expect(page.getByRole("menuitem", {name: /Mitt FGV-konto/})).toBeVisible();
        await expect(page.getByRole("link", {name: /Mitt FGV-konto/})).toHaveAttribute("href", /\/realms\/fgv\/account$/);

        await page.getByRole("menuitem", {name: "Logga ut"}).click();
        await expect(page.getByText("Du behöver vara inloggad för att använda Nyuppsättning.")).toBeVisible();
    });

    test("shows the support and about pages with their addresses", async ({page, loginAs}) => {
        await loginAs("directeur");

        await page.goto("/support");
        await expect(page.getByRole("heading", {name: "Hur kan vi hjälpa till?"})).toBeVisible();
        await expect(page.getByRole("link", {name: "Skicka ett supportärende"})).toHaveAttribute("href", "mailto:support.revival@example.org");

        await page.goto("/about");
        await expect(page.getByRole("heading", {name: "Om Nyuppsättning"})).toBeVisible();
        await expect(page.getByRole("link", {name: "Skicka ett e-postmeddelande"})).toHaveAttribute("href", "mailto:feedback.revival@example.org");
    });

    test("jumps to a page and opens the create dialog from the command palette", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/");
        await expect(page.getByRole("button", {name: "Öppna kommandopaletten"})).toBeVisible();

        await page.keyboard.press("ControlOrMeta+k");
        await page.getByPlaceholder("Hoppa till sida eller åtgärd…").fill("om");
        await page.getByRole("option", {name: "Om"}).click();
        await expect(page).toHaveURL(/\/about$/);

        await page.getByRole("button", {name: "Öppna kommandopaletten"}).click();
        await page.getByRole("option", {name: "Ny nyuppsättning"}).click();
        await expect(page.getByRole("dialog", {name: "Ny nyuppsättning"})).toBeVisible();
    });

    test("switches language and collapses the sidebar from the header", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/");

        await page.getByRole("button", {name: "Byt språk"}).click();
        await page.getByRole("menuitem", {name: "English"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "My revivals"})).toBeVisible();

        await page.locator("header").getByRole("button").first().click();
        await expect(page.locator('[data-slot="sidebar"][data-state="collapsed"]')).toHaveCount(1);
    });
});
