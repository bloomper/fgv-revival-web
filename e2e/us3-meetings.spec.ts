import {expect, test} from "./fixtures";

test.describe("Decision log, user story 3: the steering group runs a meeting from the log", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.setStatus("1", "ORGANISING");
        await mock.logRow({revivalId: "1", type: "TODO", text: "Boka RunAn"});
        await loginAs("styrgrupp");
    });

    test("plans and runs a meeting, refuses to close with an unowned to-do, and emails the minutes", async ({page}) => {
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Möten"}).click();
        await expect(page.getByText("Inga möten än.")).toBeVisible();

        await page.getByRole("button", {name: "Nytt möte"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Rubrik").fill("Direktionsmöte 4");
        await dialog.getByLabel("Stina Styrgrupp").check();
        await dialog.getByLabel("Dana Directeur").check();
        await dialog.getByLabel("Övriga punkter").fill("Budget");
        await dialog.getByLabel("Övriga punkter").press("Enter");
        await dialog.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByRole("heading", {level: 2, name: "Direktionsmöte 4"})).toBeVisible();
        await expect(page.getByRole("table").getByText("Boka RunAn")).toBeVisible();
        await expect(page.getByText("Budget")).toBeVisible();

        await page.getByRole("button", {name: "Starta mötet"}).click();
        await expect(page.getByText("Protokollförare: Stina Styrgrupp")).toBeVisible();

        await page.goto("/revivals/1");
        await expect(page.getByText("Ett möte pågår")).toBeVisible();
        await expect(page.getByRole("link", {name: /Beslutslogg.*1 öppna rader, 0 försenade/})).toBeVisible();
        await page.getByRole("link", {name: "Direktionsmöte 4"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Direktionsmöte 4"})).toBeVisible();

        await page.getByRole("button", {name: "Avsluta mötet"}).click();
        await expect(page.getByRole("list", {name: "Rader utan ansvarig"})).toContainText("Rad 1");
        await expect(page.getByRole("dialog").getByRole("button", {name: "Avsluta mötet"})).toBeDisabled();
        await page.getByRole("dialog").getByRole("button", {name: "Avbryt"}).click();

        await page.getByRole("table").getByRole("button", {name: "Ändra rad 1"}).click();
        await page.getByRole("dialog").getByLabel("Ansvarig").selectOption({label: "Stina Styrgrupp"});
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("dialog")).toBeHidden();

        await page.getByRole("button", {name: "Ny rad"}).click();
        await page.getByRole("dialog").getByLabel("Typ").selectOption({label: "Beslut"});
        await page.getByRole("dialog").getByLabel("Vad").fill("Vi spelar i RunAn");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("dialog")).toBeHidden();

        await page.getByRole("button", {name: "Avsluta mötet"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Avsluta mötet"}).click();

        const minutes = page.getByLabel("Protokoll");

        await expect(minutes.getByText("Vi spelar i RunAn")).toBeVisible();
        await expect(minutes.getByRole("heading", {name: "Att göra"})).toBeVisible();
        await expect(minutes.getByText("Boka RunAn")).toBeVisible();

        await page.getByRole("button", {name: "Skicka protokollet"}).click();
        await page.getByRole("dialog").getByLabel("Språk").selectOption("en");
        await page.getByRole("dialog").getByRole("button", {name: "Skicka", exact: true}).click();
        await expect(page.getByRole("dialog").getByText("Skickat till 2 personer")).toBeVisible();
    });
});
