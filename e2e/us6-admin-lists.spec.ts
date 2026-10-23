import {expect, test} from "./fixtures";

test.describe("Administration: the areas of responsibility and guide item types the super admin keeps", () => {
    test("a new area is offered to the steering group, an unused one is deleted and one in use only retired", async ({page, mock, loginAs}) => {
        await mock.setStatus("1", "ORGANISING");
        await loginAs("superadmin");
        await page.goto("/admin/capabilities");
        await expect(page.getByRole("heading", {level: 2, name: "Ansvarsområden"})).toBeVisible();
        const row = (name: string) => page.getByRole("list", {name: "Ansvarsområden"}).getByRole("listitem").filter({hasText: name});

        await page.getByRole("button", {name: "Nytt ansvarsområde"}).click();
        await page.getByRole("dialog").getByLabel("Namn (svenska)").fill("Scenografi");
        await page.getByRole("dialog").getByLabel("Namn (engelska, frivilligt)").fill("Set design");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(row("Scenografi")).toContainText("Set design");

        // Stina holds Ekonomi, so it can only be retired
        await expect(page.getByRole("button", {name: "Radera Ekonomi"})).toHaveCount(0);
        await page.getByRole("button", {name: "Avveckla Bemanning"}).click();
        await expect(row("Bemanning")).toHaveCount(0);

        await page.goto("/revivals/1");
        const steeringGroup = page.getByRole("group", {name: "Ansvarsområden"}).first();

        await expect(steeringGroup.getByLabel("Scenografi")).toBeVisible();
        await expect(steeringGroup.getByLabel("Bemanning")).toHaveCount(0);

        await page.goto("/admin/capabilities");
        await page.getByRole("button", {name: "Radera Scenografi"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Radera"}).click();
        await expect(row("Scenografi")).toHaveCount(0);

        await page.getByRole("switch", {name: "Visa avvecklade"}).click();
        await expect(page).toHaveURL(/\?retired=1$/);
        await page.getByRole("button", {name: "Återställ Bemanning"}).click();
        await expect(row("Bemanning")).not.toContainText("Avvecklad");
    });

    test("a new item type of the requirement kind is offered in the draft and labels its items", async ({page, mock, loginAs}) => {
        await mock.guide("draft");
        await loginAs("superadmin");
        await page.goto("/admin/guide-item-types");
        await expect(page.getByRole("heading", {level: 2, name: "Punkttyper i guiden"})).toBeVisible();
        const row = (name: string) => page.getByRole("list", {name: "Punkttyper i guiden"}).getByRole("listitem").filter({hasText: name});
        // Every type is used in the guide, so none can be deleted
        await expect(page.getByRole("button", {name: /^Radera /})).toHaveCount(0);

        await page.getByRole("button", {name: "Ny punkttyp"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Namn (svenska)").fill("Myndighetskrav");
        await dialog.getByRole("radio", {name: /Krav/}).check();
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(row("Myndighetskrav")).toContainText("Krav");

        await page.goto("/admin/guide/draft");
        await page.getByRole("link", {name: /Sätt budgeten/}).click();
        const chapterC = page.getByRole("region", {name: /^3\. Sätt budgeten/});

        await chapterC.getByRole("button", {name: "Lägg till punkt"}).first().click();
        await page.getByLabel("Typ").selectOption({label: "Myndighetskrav"});
        await page.getByLabel("Svenska").fill("Tillstånd från polisen för offentlig tillställning.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByTestId(/draft-item-/).filter({hasText: "Tillstånd från polisen"})).toContainText("Myndighetskrav");
    });
});
