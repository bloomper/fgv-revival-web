import {expect, openRevival, test} from "./fixtures";

test.describe("User story 1: the super admin records and approves a revival", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("superadmin");
    });

    test("creates a revival from a spex search, approves it and appoints a waiting directeur", async ({page}) => {
        await page.goto("/admin/revivals");
        await page.getByRole("button", {name: "Ny nyuppsättning"}).click();
        await page.getByRole("textbox", {name: "Sök spex på titel"}).fill("sno");
        await page.getByRole("option", {name: /Snorre/}).click();
        await page.getByLabel("År").fill("2031");
        await page.getByLabel("Arbetstitel").fill("Snorre 2031");
        await page.getByRole("button", {name: "Skapa"}).click();

        await expect(page.getByRole("heading", {level: 2, name: "Snorre 2031"})).toBeVisible();
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Föreslagen"})).toBeVisible();

        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("APPROVED");
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Godkänd"})).toBeVisible();

        await page.getByRole("textbox", {name: /Utse directeur/}).fill("ny.directeur@example.org");
        await page.getByRole("button", {name: "Utse directeur"}).click();
        await expect(page.getByText("ny.directeur@example.org")).toBeVisible();
        await expect(page.getByText("Väntar på åtkomst")).toBeVisible();
    });

    test("rejects a revival and moves another one backwards on their pages", async ({page}) => {
        await page.goto("/admin/revivals");
        await openRevival(page, "Nobel 2030");
        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("REJECTED");
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Avslagen"})).toBeVisible();

        await page.goto("/admin/revivals");
        await openRevival(page, "Ali Baba 2028");
        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("PROPOSED");
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Föreslagen"})).toBeVisible();
    });

    test("lists revivals sortable by any column with their directeurs, and no controls in the rows", async ({page}) => {
        await page.goto("/admin/revivals");

        await expect(page.getByRole("row", {name: /Ali Baba 2028.*Dana Directeur/})).toBeVisible();
        await expect(page.getByRole("row").nth(1)).toContainText("Snorre 2027");

        const title = page.getByRole("button", {name: "Arbetstitel"});
        const premiere = page.getByRole("button", {name: "Premiär"});

        await title.click();
        await expect(page.getByRole("row").nth(1)).toContainText("Ali Baba 2028");
        await expect(title.locator("svg")).toHaveClass(/lucide-arrow-up(?!-)/);
        await expect(premiere.locator("svg")).toHaveClass(/lucide-arrow-up-down/);

        await title.click();
        await expect(page.getByRole("row").nth(1)).toContainText("Snorre 2027");
        await expect(title.locator("svg")).toHaveClass(/lucide-arrow-down/);

        await page.getByRole("button", {name: "År"}).click();
        await expect(page.getByRole("row").nth(1)).toContainText("Snorre 2027");
        await expect(page.getByRole("row").nth(3)).toContainText("Nobel 2030");
        await expect(page.getByRole("button", {name: "År"}).locator("svg")).toHaveClass(/lucide-arrow-up(?!-)/);
        await expect(title.locator("svg")).toHaveClass(/lucide-arrow-up-down/);
        await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);
    });

    test("filters the list on text and status", async ({page}) => {
        await page.goto("/admin/revivals");

        await page.getByRole("textbox", {name: "Sök"}).fill("nobel");
        await expect(page.getByRole("row")).toHaveCount(2);
        await expect(page.getByRole("row").nth(1)).toContainText("Nobel 2030");

        await page.getByRole("button", {name: "Återställ", exact: true}).click();
        await page.getByRole("button", {name: /^Status \d+ valda/}).click();
        await page.getByRole("button", {name: "Föreslagen"}).click();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("row", {name: /Nobel 2030/})).toHaveCount(0);
        await expect(page.getByRole("row", {name: /Ali Baba 2028/})).toBeVisible();
    });

    test("is told the spex list is unavailable while Spexregister is down", async ({page, mock}) => {
        await mock.spexregister(false);
        await page.goto("/admin/revivals");

        await expect(page.getByRole("row", {name: /Ali Baba 2028/}).getByText("Spexregistret är tillfälligt otillgängligt")).toBeVisible();
        await page.getByRole("button", {name: "Ny nyuppsättning"}).click();
        await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Spexregistret är tillfälligt otillgängligt. Försök igen om en stund.");
    });

    test("opens a revival from the list to manage its steering group", async ({page}) => {
        await page.goto("/admin/revivals");
        await openRevival(page, "Ali Baba 2028");

        await expect(page.getByText("Stina Styrgrupp")).toBeVisible();
        await expect(page.getByRole("button", {name: "Lägg till i styrgruppen"})).toBeVisible();
    });
});
