import {expect, test} from "./fixtures";

test.describe("The reference library and the application settings", () => {
    test("the super admin adds a venue, the steering group reads it, and a retired entry is hidden", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/library");
        await expect(page.getByRole("heading", {level: 2, name: "Referensbiblioteket"})).toBeVisible();

        await page.getByRole("button", {name: "Ny post"}).click();
        const sheet = page.getByRole("dialog");

        await sheet.getByRole("textbox", {name: "Namn (svenska)"}).fill("RunAn");
        await sheet.getByRole("group", {name: "Fördelar"}).getByRole("textbox", {name: "Svenska"}).fill("Stor scen.");
        await sheet.getByRole("textbox", {name: "Länk"}).fill("https://example.org/runan");
        await sheet.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("region", {name: "Lokaler"}).getByText("Stor scen.")).toBeVisible();

        await loginAs("styrgrupp");
        await page.goto("/library");
        await expect(page.getByText("RunAn", {exact: true})).toBeVisible();
        await expect(page.getByRole("button", {name: "Ny post"})).toHaveCount(0);

        await loginAs("superadmin");
        await page.goto("/library");
        await page.getByRole("button", {name: "Avveckla RunAn"}).click();
        await expect(page.getByText("Inga poster.")).toBeVisible();
    });

    test("the super admin sets the terms and the default fee", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/settings");

        await page.getByRole("group", {name: "Villkor för deltagare"}).getByRole("textbox", {name: "Svenska"}).fill("Följ FGV:s regler.");
        await page.getByRole("textbox", {name: "Deltagaravgift för nya nyuppsättningar (kr)"}).fill("800");
        await page.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Sparat")).toBeVisible();

        await page.reload();
        await expect(page.getByRole("textbox", {name: "Deltagaravgift för nya nyuppsättningar (kr)"})).toHaveValue("800");
    });
});
