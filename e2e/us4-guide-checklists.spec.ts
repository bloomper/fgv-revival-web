import {expect, test} from "./fixtures";

test.describe("Decision log, user story 4: the steering group works through the phase checklists", () => {
    test.beforeEach(async ({mock}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
    });

    test("ticks a requirement, adds an own item and filters across checklists", async ({page, loginAs}) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Checklistor"}).click();

        await expect(page.getByRole("heading", {level: 2, name: "Checklistor"})).toBeVisible();
        await page.getByRole("link", {name: /Fas A/}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Fas A: Först: godkännande och tajmning"})).toBeVisible();

        const requirement = page.getByRole("checkbox", {name: "Nyuppsättningen ska godkännas av JK och FGV."});

        await requirement.check();
        await expect(requirement).toBeChecked();
        await expect(page.getByRole("button", {name: "Gäller inte"})).toHaveCount(0);

        await page.getByRole("button", {name: "Ny punkt"}).click();
        await page.getByRole("dialog").getByLabel("Vad ska göras").fill("Fråga JK om datum");
        await page.getByRole("dialog").getByLabel("Ansvarig").selectOption({label: "Stina Styrgrupp"});
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("dialog")).toBeHidden();
        await expect(page.getByRole("checkbox", {name: "Fråga JK om datum"})).toBeVisible();

        await page.getByRole("link", {name: "Checklistor"}).click();
        await page.getByRole("link", {name: "Mina", exact: true}).click();
        const matches = page.getByRole("list", {name: "Matchande punkter"});

        await expect(matches.getByText("Fråga JK om datum")).toBeVisible();
        await expect(matches.getByText("Nyuppsättningen ska godkännas av JK och FGV.")).toHaveCount(0);
    });

    test("shows the chapter's tips with its checklist", async ({page, loginAs}) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/checklists");
        await page.getByRole("link", {name: /Fas B/}).click();

        await page.getByText("Tips från guiden (1)").click();
        await expect(page.getByText("Kontrollera sprittillstånd i vald lokal.")).toBeVisible();
    });

    test("a directeur waives a requirement with a reason", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/revivals/1/checklists");
        await page.getByRole("link", {name: /Fas J/}).click();

        await page.getByRole("button", {name: "Gäller inte"}).click();
        const dialog = page.getByRole("dialog");

        await expect(dialog.getByRole("button", {name: "Gäller inte"})).toBeDisabled();
        await dialog.getByLabel("Motivering").fill("Vi tar inget lån");
        await dialog.getByRole("button", {name: "Gäller inte"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByText("Vi tar inget lån")).toBeVisible();
        await expect(page.getByRole("button", {name: "Öppna igen"})).toBeVisible();
    });
});
