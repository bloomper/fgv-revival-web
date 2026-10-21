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

    test("rejects a revival and moves another one backwards from the list", async ({page}) => {
        await page.goto("/admin/revivals");

        const nobel = page.getByRole("row", {name: /Nobel 2030/});
        await nobel.getByRole("combobox", {name: "Ändra status"}).selectOption("REJECTED");
        await expect(nobel.getByText("Avslagen")).toBeVisible();

        const aliBaba = page.getByRole("row", {name: /Ali Baba 2028/});
        await aliBaba.getByRole("combobox", {name: "Ändra status"}).selectOption("PROPOSED");
        await expect(aliBaba.getByText("Föreslagen")).toBeVisible();
    });

    test("lists revivals sortable by premiere date with their directeurs", async ({page}) => {
        await page.goto("/admin/revivals");

        await expect(page.getByRole("row", {name: /Ali Baba 2028.*Dana Directeur/})).toBeVisible();
        await page.getByRole("button", {name: "Sortera på premiär"}).click();
        await expect(page.getByRole("row").nth(1)).toContainText("Snorre 2027");
    });

    test("is told the spex list is unavailable while Spexregister is down", async ({page, mock}) => {
        await mock.spexregister(false);
        await page.goto("/admin/revivals");

        await expect(page.getByRole("row", {name: /Ali Baba 2028/}).getByText("Spexregistret är tillfälligt otillgängligt")).toBeVisible();
        await page.getByRole("button", {name: "Ny nyuppsättning"}).click();
        await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Spexregistret är tillfälligt otillgängligt. Försök igen om en stund.");
    });

    test("appoints and removes a directeur from the list", async ({page}) => {
        await page.goto("/admin/revivals");
        await page.getByRole("row", {name: /Nobel 2030/}).getByRole("button", {name: "Directeurer för Nobel 2030"}).click();

        const dialog = page.getByRole("dialog");
        await dialog.getByRole("textbox", {name: /Utse directeur/}).fill("lista.directeur@example.org");
        await dialog.getByRole("button", {name: "Utse directeur"}).click();
        await expect(dialog.getByText("lista.directeur@example.org")).toBeVisible();
        await expect(dialog.getByText("Väntar på åtkomst")).toBeVisible();

        await dialog.getByRole("button", {name: "Ta bort lista.directeur@example.org"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Ta bort"}).click();
        await expect(dialog.getByText("Ingen directeur är utsedd.")).toBeVisible();
    });

    test("opens a revival from the list to manage its steering group", async ({page}) => {
        await page.goto("/admin/revivals");
        await openRevival(page, "Ali Baba 2028");

        await expect(page.getByText("Stina Styrgrupp")).toBeVisible();
        await expect(page.getByRole("button", {name: "Lägg till i styrgruppen"})).toBeVisible();
    });
});
