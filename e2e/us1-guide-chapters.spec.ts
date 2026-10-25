import {expect, test} from "./fixtures";

test.describe("Guide, user story 1: the super admin writes the first version chapter by chapter", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("superadmin");
    });

    test("starts an empty draft, adds and orders chapters, fills one and publishes it as the first version", async ({page}) => {
        await page.goto("/admin/guide");
        await expect(page.getByText("Guiden är inte publicerad än.")).toBeVisible();
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page).toHaveURL(/\/admin\/guide\/draft/);
        await expect(page.getByText("Utkastet har inga kapitel. Lägg till det första.")).toBeVisible();

        for (const title of ["Budget", "Godkännande"]) {
            await page.getByRole("button", {name: "Lägg till kapitel"}).click();
            await page.getByLabel("Svenska").fill(title);
            await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
            await expect(page.getByTestId(/draft-chapter-/).filter({hasText: title})).toBeVisible();
        }

        await page.getByTestId(/draft-chapter-/).filter({hasText: "Godkännande"}).getByRole("button", {name: "Flytta upp"}).click();
        await expect(page.getByTestId(/draft-chapter-/).first()).toContainText(/1\.\s*Godkännande/);

        await page.getByRole("link", {name: /\d+\. Budget/}).click();
        await expect(page.getByRole("heading", {name: "2. Budget"})).toBeVisible();
        await page.getByRole("button", {name: "Lägg till punkt"}).click();
        await page.getByLabel("Typ").selectOption("REQUIREMENT");
        await page.getByLabel("Svenska").fill("Budget ska upprättas innan ni drar kostnader.");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Budget ska upprättas innan ni drar kostnader.")).toBeVisible();

        await page.getByRole("link", {name: "Utkast"}).click();
        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText("Versionen är publicerad")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/guide$/);

        await page.goto("/guide");
        const chapters = page.getByRole("region", {name: "Kapitel"});

        await expect(chapters.getByRole("link")).toHaveCount(2);
        await expect(chapters.getByRole("link").first()).toContainText("Godkännande");
    });

    test("cannot publish a draft without chapters", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page).toHaveURL(/\/admin\/guide\/draft/);

        await page.getByRole("button", {name: "Publicera"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Publicera"}).click();
        await expect(page.getByText(/Utkastet är inte klart/)).toBeVisible();
    });

    test("discards a draft after confirming", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page).toHaveURL(/\/admin\/guide\/draft/);

        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Kasta utkastet"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Kasta"}).click();

        await expect(page.getByText("Utkastet är kastat")).toBeVisible();
        await expect(page.getByRole("button", {name: "Starta ett utkast"})).toBeVisible();
    });

    test("leaves the draft page for the guide admin page once there is no draft", async ({page}) => {
        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Starta ett utkast"}).click();
        await expect(page).toHaveURL(/\/admin\/guide\/draft/);

        await page.getByRole("button", {name: "Kasta utkastet"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Kasta"}).click();
        await expect(page.getByText("Utkastet är kastat")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/guide$/);

        await page.goto("/admin/guide/draft");
        await expect(page).toHaveURL(/\/admin\/guide$/);
        await expect(page.getByRole("button", {name: "Starta ett utkast"})).toBeVisible();
    });
});

test("removing a chapter is confirmed three times: when removed, when published and when a revival moves on", async ({
                                                                                                                         page,
                                                                                                                         mock,
                                                                                                                         loginAs
                                                                                                                     }) => {
    await mock.guide("published");
    await mock.setStatus("1", "ORGANISING");
    await loginAs("superadmin");

    await page.goto("/admin/guide");
    await page.getByRole("button", {name: "Starta ett utkast"}).click();
    await expect(page).toHaveURL(/\/admin\/guide\/draft/);

    const chapterE = page.getByTestId("draft-chapter-E");

    await chapterE.getByRole("button", {name: "Radera kapitlet"}).click();
    const remove = page.getByRole("alertdialog");

    await expect(remove.getByTestId("chapter-removal-impact")).toContainText(/förlorar \d+ nyuppsättning/);
    await expect(remove.getByRole("button", {name: "Radera kapitlet"})).toBeDisabled();
    await remove.getByLabel("Skriv kapitlets svenska titel för att bekräfta").fill("Ordna tillgångar");
    await remove.getByRole("button", {name: "Radera kapitlet"}).click();
    await expect(page.getByTestId("draft-chapter-E")).toHaveCount(0);

    await page.getByRole("button", {name: "Publicera"}).click();
    const publish = page.getByRole("dialog");

    await expect(publish.getByTestId("removal-warning")).toContainText("Ordna tillgångar");
    await expect(publish.getByRole("button", {name: "Publicera"})).toBeDisabled();
    await publish.getByText(/Jag förstår att checklistorna raderas/).click();
    await publish.getByRole("button", {name: "Publicera"}).click();
    await expect(page.getByText("Versionen är publicerad")).toBeVisible();

    await page.goto("/revivals/1/guide");
    await page.getByRole("button", {name: "Byt version"}).click();
    const change = page.getByRole("dialog");

    await change.getByLabel("Ny version").selectOption({label: "v2"});
    await expect(change.getByTestId("removal-warning")).toContainText("Ordna tillgångar");
    await expect(change.getByText("Kapitlet borttaget")).toBeVisible();
    await expect(change.getByRole("button", {name: "Byt version"})).toBeDisabled();
    await change.getByText(/Jag förstår att checklistorna raderas/).click();
    await change.getByRole("button", {name: "Byt version"}).click();
    await expect(page.getByText("Nyuppsättningen följer den nya versionen")).toBeVisible();

    await page.goto("/revivals/1/checklists");
    const checklists = page.getByRole("region", {name: "Guidens kapitel"});

    await expect(checklists.getByRole("link")).toHaveCount(9);
    await expect(checklists.getByText("Ordna tillgångar")).toHaveCount(0);
});

test("the guide's admin page is not offered to a directeur", async ({page, loginAs}) => {
    await loginAs("directeur");
    await page.goto("/admin/guide");

    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.getByRole("heading", {name: "Du har inte behörighet"})).toBeVisible();
});
