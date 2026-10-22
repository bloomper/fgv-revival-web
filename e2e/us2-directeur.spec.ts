import {expect, openRevival, test} from "./fixtures";

test.describe("User story 2: the directeur runs their revival", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("directeur");
    });

    test("sees only their revival", async ({page}) => {
        await page.goto("/revivals");

        await expect(page.getByRole("link", {name: /Ali Baba 2028/})).toBeVisible();
        await expect(page.getByText("Nobel 2030")).toHaveCount(0);
        await expect(page.getByText("Snorre 2027")).toHaveCount(0);
        await expect(page.getByRole("link", {name: "Hantera", exact: true})).toHaveCount(0);
    });

    test("edits the details, with an early show date refused", async ({page}) => {
        await page.goto("/revivals");
        await openRevival(page, "Ali Baba 2028");
        await page.getByRole("button", {name: "Redigera uppgifter"}).click();

        await page.getByLabel("Premiär").fill("2028-02-10");
        await page.getByRole("button", {name: "Lägg till föreställning"}).click();
        await page.getByLabel("Föreställningar 1").fill("2028-02-09");
        await page.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("alert").filter({hasText: "premiären"})).toHaveText("En föreställning får inte ligga före premiären.");

        await page.getByLabel("Föreställningar 1").fill("2028-02-12");
        await page.getByRole("button", {name: "Lägg till spelplats"}).click();
        await page.getByLabel("Spelplatser 1").fill("Chalmers kårhus");
        await page.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByText("Chalmers kårhus")).toBeVisible();
        await expect(page.getByRole("button", {name: "Redigera uppgifter"})).toBeVisible();
    });

    test("advances step by step and loses sight of the revival once archived", async ({page, mock}) => {
        await page.goto("/revivals");
        await openRevival(page, "Ali Baba 2028");

        for (const [value, label] of [["ORGANISING", "Organiseras"], ["OPEN", "Öppen"], ["CLOSING", "Avslutas"], ["SETTLING", "Slutredovisas"]]) {
            const select = page.getByRole("combobox", {name: "Ändra status"});

            await expect(select.locator("option")).toHaveCount(2);
            await select.selectOption(value);
            await expect(page.locator('[data-slot="badge"]:visible', {hasText: label})).toBeVisible();
        }
        await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);

        await mock.setStatus("1", "ARCHIVED");
        await page.reload();
        await expect(page.getByRole("heading", {name: "Sidan finns inte"})).toBeVisible();
        await page.goto("/revivals");
        await expect(page.getByText("Du har ingen roll i någon nyuppsättning som syns just nu.")).toBeVisible();
    });
});
