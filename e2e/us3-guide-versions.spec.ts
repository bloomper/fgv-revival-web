import {expect, test} from "./fixtures";

test.describe("Guide, user story 3: the super admin edits a draft and publishes a new version", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.guide("published");
        await loginAs("superadmin");
    });

    test("starts a draft, edits it and publishes it as v2", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Utkast"})).toBeVisible();

        const chapterC = page.getByRole("region", {name: /^C\. Sätt budgeten/});

        await chapterC.getByRole("button", {name: "Lägg till punkt"}).first().click();
        await page.getByLabel("Typ").selectOption("REQUIREMENT");
        await page.getByLabel("Svenska").fill("Budget ska vara klar innan första rephelgen.");
        await page.getByLabel("Engelska (frivilligt)").fill("The budget must be ready before the first rehearsal weekend.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(chapterC.getByText("Budget ska vara klar innan första rephelgen.")).toBeVisible();

        const tip = page.getByTestId(/draft-item-/).filter({hasText: "Kontrollera sprittillstånd"});

        await tip.getByRole("button", {name: "Redigera punkten"}).click();
        await page.getByLabel("Svenska").fill("Kontrollera sprittillstånd i god tid.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Kontrollera sprittillstånd i god tid.")).toBeVisible();

        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByLabel("Versionsbeteckning").fill("v1");
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText("Versionsbeteckningen v1 används redan.")).toBeVisible();

        await page.getByLabel("Versionsbeteckning").fill("v2");
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText("Versionen är publicerad")).toBeVisible();

        await page.goto("/admin/guide");
        await expect(page.getByRole("link", {name: "v2"})).toBeVisible();
        await expect(page.getByRole("link", {name: "v1"})).toBeVisible();
    });
});

test.describe("Guide, user story 3: the directeur moves the revival to a newer version", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.guide("two");
        await loginAs("directeur");
    });

    test("sees the newer version and what changed, moves forward and cannot move back", async ({page}) => {
        await page.goto("/revivals/1/guide");
        await expect(page.getByText("Det finns en nyare version av guiden, v2.")).toBeVisible();

        await page.getByRole("link", {name: "Se vad som ändrats"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Ändringar från v1 till v2"})).toBeVisible();
        await expect(page.getByText("Ny text (sv)")).toBeVisible();

        await page.goto("/revivals/1/guide");
        await page.getByRole("button", {name: "Byt version"}).click();
        await page.getByLabel("Ny version").selectOption({label: "v2"});
        await expect(page.getByRole("dialog").getByText("Ny text (sv)")).toBeVisible();
        await page.getByRole("dialog").getByRole("button", {name: "Byt version"}).click();

        await expect(page.getByRole("heading", {level: 3, name: "Guiden v2"})).toBeVisible();
        await expect(page.getByText("Det finns en nyare version av guiden")).toHaveCount(0);
        await expect(page.getByRole("button", {name: "Byt version"})).toHaveCount(0);
        await expect(page.getByText(/Dana Directeur bytte från v1 till v2/)).toBeVisible();
    });
});

test("a steering group member cannot change the version", async ({page, mock, loginAs}) => {
    await mock.guide("two");
    await mock.setStatus("1", "ORGANISING");
    await loginAs("styrgrupp");
    await page.goto("/revivals/1/guide");

    await expect(page.getByText("Det finns en nyare version av guiden, v2.")).toBeVisible();
    await expect(page.getByRole("button", {name: "Byt version"})).toHaveCount(0);
});
