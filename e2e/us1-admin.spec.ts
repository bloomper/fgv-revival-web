import {expect, openRevival, test} from "./fixtures";

test.describe("User story 1: the super admin records and approves a revival", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("superadmin");
    });

    test("creates a revival from a spex search, approves it and appoints a waiting directeur", async ({page}) => {
        await page.goto("/revivals/manage");
        await page.getByRole("button", {name: "Ny nyuppsättning"}).click();
        await page.getByRole("textbox", {name: "Sök spex på titel"}).fill("sno");
        await page.getByRole("option", {name: /Snorre/}).click();
        await page.getByRole("combobox", {name: "År"}).click();
        await page.getByRole("option", {name: "2031"}).click();
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
        await page.goto("/revivals/manage");
        await openRevival(page, "Nobel 2030");
        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("REJECTED");
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Avslagen"})).toBeVisible();

        await page.goto("/revivals/manage");
        await openRevival(page, "Ali Baba 2028");
        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("PROPOSED");
        await expect(page.locator('[data-slot="badge"]:visible', {hasText: "Föreslagen"})).toBeVisible();
    });

    test("lists revivals newest first, sortable, with no status or directeur controls", async ({page}) => {
        await page.goto("/revivals/manage");

        await expect(page.getByRole("row").nth(1)).toContainText("Nobel");
        await expect(page.getByRole("columnheader", {name: "Directeurer"})).toHaveCount(0);
        await expect(page.getByRole("columnheader", {name: "Premiär"})).toHaveCount(0);

        const year = page.getByRole("button", {name: "År", exact: true});
        const spex = page.getByRole("button", {name: "Spex", exact: true});

        await year.click();
        await expect(page.getByRole("row").nth(1)).toContainText("Snorre");
        await expect(year.locator("svg")).toHaveClass(/lucide-arrow-up(?!-)/);

        await spex.click();
        await expect(page.getByRole("row").nth(1)).toContainText("Ali Baba");
        await expect(spex.locator("svg")).toHaveClass(/lucide-arrow-up(?!-)/);
        await expect(year.locator("svg")).toHaveClass(/lucide-arrow-up-down/);
        await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);
    });

    test("edits a revival's year from its row", async ({page}) => {
        await page.goto("/revivals/manage");
        await page.getByRole("button", {name: "Åtgärder för Nobel 2030"}).click();
        await page.getByRole("menuitem", {name: "Redigera"}).click();

        await page.getByRole("combobox", {name: "År"}).click();
        await page.getByRole("option", {name: "2031"}).click();
        await page.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByText("Nyuppsättningen sparades")).toBeVisible();
        await expect(page.getByRole("row", {name: /Nobel.*2031/})).toBeVisible();
    });

    test("deletes a revival from its row and the selected ones after confirming", async ({page}) => {
        await page.goto("/revivals/manage");
        await page.getByRole("button", {name: "Åtgärder för Nobel 2030"}).click();
        await page.getByRole("menuitem", {name: "Radera"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Radera"}).click();

        await expect(page.getByText("Nyuppsättningen raderades")).toBeVisible();
        await expect(page.getByRole("row", {name: /Nobel/})).toHaveCount(0);

        await page.getByRole("checkbox", {name: "Markera alla"}).click();
        await page.getByRole("button", {name: "Radera (2)"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Radera"}).click();

        await expect(page.getByText("2 nyuppsättningar raderades")).toBeVisible();
        await expect(page.getByRole("row")).toHaveCount(2);
    });

    test("filters the list on text and status", async ({page}) => {
        await page.goto("/revivals/manage");

        await page.getByRole("textbox", {name: "Sök"}).fill("nobel");
        await expect(page.getByRole("row")).toHaveCount(2);
        await expect(page.getByRole("row").nth(1)).toContainText("Nobel");

        await page.getByRole("button", {name: "Återställ", exact: true}).click();
        await page.getByRole("button", {name: /^Status \d+ valda/}).click();
        await page.getByRole("button", {name: "Föreslagen"}).click();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("row", {name: /Nobel/})).toHaveCount(0);
        await expect(page.getByRole("row", {name: /Ali Baba/})).toBeVisible();
    });

    test("is told the spex list is unavailable while Spexregister is down", async ({page, mock}) => {
        await mock.spexregister(false);
        await page.goto("/revivals/manage");

        await expect(page.getByRole("row", {name: /Ali Baba 2028/}).getByText("Spexregistret är tillfälligt otillgängligt")).toBeVisible();
        await page.getByRole("button", {name: "Ny nyuppsättning"}).click();
        await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Spexregistret är tillfälligt otillgängligt. Försök igen om en stund.");
    });

    test("opens a revival from the list to manage its steering group", async ({page}) => {
        await page.goto("/revivals/manage");
        await openRevival(page, "Ali Baba 2028");

        await expect(page.getByText("Stina Styrgrupp")).toBeVisible();
        await expect(page.getByRole("button", {name: "Lägg till i styrgruppen"})).toBeVisible();
    });
});
