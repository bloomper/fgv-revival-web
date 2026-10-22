import {expect, test} from "./fixtures";

const WORKBOOK = {name: "beslutslogg.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("PK fictitious")};

test.describe("Decision log, user story 2: the directeur imports the revival's existing Excel log", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "ORGANISING");
    });

    test("previews, matches an owner and imports the rows with their numbers", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/revivals/1/log");
        await page.getByRole("link", {name: "Importera från Excel"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Importera från Excel"})).toBeVisible();

        await page.getByLabel("Excel-fil (.xlsx, högst 10 MB)").setInputFiles(WORKBOOK);
        await page.getByRole("button", {name: "Förhandsgranska"}).click();

        await expect(page.getByText("Beslut: 7")).toBeVisible();
        await expect(page.getByText("Klar: 7")).toBeVisible();
        await expect(page.getByText("Checklistor, Så funkar det")).toBeVisible();
        await page.getByLabel("Vem är Dana?").selectOption({label: "Dana Directeur"});
        await page.getByRole("button", {name: "Importera 12 rader"}).click();

        await expect(page).toHaveURL(/\/revivals\/1\/log$/);
        const table = page.getByRole("table");

        await expect(table.getByRole("row")).toHaveCount(13);
        await expect(table.getByText("Rad 12 i loggen")).toBeVisible();
        await expect(table.getByRole("row", {name: /Rad 1 i loggen/})).toContainText("Dana Directeur");
        await expect(table.getByRole("row", {name: /Rad 9 i loggen/})).toContainText("Robin");
        await expect(page.getByRole("link", {name: "Importera från Excel"})).toHaveCount(0);
    });

    test("a steering group member is never offered the import", async ({page, loginAs}) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/log");
        await expect(page.getByRole("heading", {level: 2, name: "Beslutslogg"})).toBeVisible();
        await expect(page.getByRole("link", {name: "Importera från Excel"})).toHaveCount(0);

        await page.goto("/revivals/1/log/import");
        await expect(page.getByRole("heading", {name: "Importera från Excel"})).toHaveCount(0);
    });
});
