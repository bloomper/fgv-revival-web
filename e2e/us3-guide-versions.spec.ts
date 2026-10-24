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

        await page.getByRole("link", {name: /Sätt budgeten/}).click();
        const chapterC = page.getByRole("region", {name: /^3\. Sätt budgeten/});

        await chapterC.getByRole("button", {name: "Lägg till punkt"}).first().click();
        await page.getByLabel("Typ").selectOption("REQUIREMENT");
        await page.getByLabel("Svenska").fill("Budget ska vara klar innan första rephelgen.");
        await page.getByLabel("Engelska (frivilligt)").fill("The budget must be ready before the first rehearsal weekend.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(chapterC.getByText("Budget ska vara klar innan första rephelgen.")).toBeVisible();

        await page.getByRole("navigation", {
            name: "Kapitel",
            exact: true
        }).getByRole("link", {name: /Boka lokaler/}).click();
        const tip = page.getByTestId(/draft-item-/).filter({hasText: "Kontrollera sprittillstånd"});

        await tip.getByRole("button", {name: "Redigera punkten"}).click();
        await page.getByLabel("Svenska").fill("Kontrollera sprittillstånd i god tid.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Kontrollera sprittillstånd i god tid.")).toBeVisible();

        await page.getByRole("link", {name: "Utkast"}).click();
        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByLabel("Vad har ändrats? (frivilligt)").fill("Krav på budget före första rephelgen.");
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText("Versionen är publicerad")).toBeVisible();

        await page.goto("/admin/guide");
        const rows = page.getByRole("row");

        await expect(rows.filter({hasText: "v2"})).toContainText("Krav på budget före första rephelgen.");
        await expect(rows.filter({hasText: "v1"})).toContainText("3");
        await expect(page.getByRole("link", {name: "v2"})).toHaveCount(0);
    });

    test("shows a summary from the row, the whole version from the menu, and deletes a version only when unused", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Utkast"})).toBeVisible();
        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText("Versionen är publicerad")).toBeVisible();
        await page.goto("/admin/guide");

        await page.getByRole("row").filter({hasText: "v1"}).getByText("v1").click();
        const view = page.getByRole("dialog");

        await expect(view.getByRole("heading", {name: "v1"})).toBeVisible();
        await expect(view.getByText("Sara Admin")).toBeVisible();
        await expect(view.getByText("Används av 3 nyuppsättningar")).toBeVisible();
        await expect(view.getByRole("textbox")).toHaveCount(0);
        await view.getByRole("button", {name: "Stäng"}).click();

        await page.getByRole("button", {name: "Åtgärder för v1"}).click();
        await expect(page.getByRole("menuitem", {name: /Ta bort/})).toHaveAttribute("aria-disabled", "true");
        await page.getByRole("menuitem", {name: "Visa versionen"}).click();
        await expect(page).toHaveURL(/\/guide\/versions\/1$/);
        await expect(page.getByRole("heading", {level: 2, name: "Guiden v1"})).toBeVisible();

        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Åtgärder för v2"}).click();
        await page.getByRole("menuitem", {name: /Ta bort/}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Ta bort"}).click();
        await expect(page.getByText("Versionen är borttagen")).toBeVisible();
        await expect(page.getByRole("row").filter({hasText: "v2"})).toHaveCount(0);
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

        await expect(page.getByText(/Nyuppsättningen följer v2/)).toBeVisible();
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

test("an observer picks an older version in the guide's version selector", async ({page, mock, loginAs}) => {
    await mock.guide("two");
    await loginAs("observer");
    await page.goto("/guide");

    await expect(page.getByRole("heading", {level: 2, name: "Guiden v2"})).toBeVisible();
    const select = page.getByRole("combobox", {name: "Versioner"});

    await expect(select).toContainText("v2 (senaste)");
    await select.click();
    await page.getByRole("option", {name: "v1"}).click();
    await expect(page).toHaveURL(/\/guide\/versions\/1$/);
    await expect(page.getByRole("heading", {level: 2, name: "Guiden v1"})).toBeVisible();

    await select.click();
    await page.getByRole("option", {name: "v2 (senaste)"}).click();
    await expect(page).toHaveURL(/\/guide$/);
});
