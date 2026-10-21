import {expect, test} from "./fixtures";

test.describe("Guide, user story 1: the super admin imports guide v5 and publishes it", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("superadmin");
    });

    test("imports a Word document, reviews the report and publishes it as the first version", async ({page}) => {
        await page.goto("/admin/guide");
        await expect(page.getByText("Guiden är inte publicerad än.")).toBeVisible();

        await page.getByRole("button", {name: "Importera från Word"}).click();
        await page.getByLabel("Word-dokument (.docx, högst 10 MB)").setInputFiles({
            name: "guide.docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            buffer: Buffer.from("PK fictitious"),
        });
        await page.getByRole("button", {name: "Importera", exact: true}).click();

        await expect(page.getByText("Importrapport för guide.docx")).toBeVisible();
        await expect(page.getByText("En bild importerades inte.")).toBeVisible();
        await expect(page.getByText(/”Om kalaset” är ingen känd rubrik/)).toBeVisible();
        await expect(page.getByRole("button", {name: "Importera från Word"})).toHaveCount(0);

        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByLabel("Versionsbeteckning").fill("v1");
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();

        await expect(page.getByText("Versionen är publicerad")).toBeVisible();
        await expect(page.getByRole("link", {name: "v1"})).toBeVisible();
        await expect(page.getByText("Det finns inget utkast.")).toBeVisible();
        await expect(page.getByRole("button", {name: "Importera från Word"})).toHaveCount(0);
    });

    test("discards an imported draft after confirming", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Importera från Word"}).click();
        await page.getByLabel("Word-dokument (.docx, högst 10 MB)").setInputFiles({
            name: "guide.docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            buffer: Buffer.from("PK fictitious"),
        });
        await page.getByRole("button", {name: "Importera", exact: true}).click();
        await expect(page.getByText("Importrapport för guide.docx")).toBeVisible();

        await page.getByRole("button", {name: "Kasta utkastet"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Kasta"}).click();

        await expect(page.getByText("Utkastet är kastat")).toBeVisible();
        await expect(page.getByRole("button", {name: "Importera från Word"})).toBeVisible();
    });
});

test("the guide's admin page is not offered to a directeur", async ({page, loginAs}) => {
    await loginAs("directeur");
    await page.goto("/admin/guide");

    await expect(page).toHaveURL(/no-access/);
});
