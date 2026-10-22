import {expect, test} from "./fixtures";

test.describe("Decision log, user story 3: the steering group runs a meeting from the log", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.setStatus("1", "ORGANISING");
        await mock.logRow({revivalId: "1", type: "TODO", text: "Boka RunAn"});
        await loginAs("styrgrupp");
    });

    test("plans and runs a meeting, refuses to close with an unowned to-do, and emails the minutes", async ({page, mock}) => {
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

        await expect(page.getByRole("heading", {level: 3, name: "Direktionsmöte 4"})).toBeVisible();
        await expect(page.getByRole("table").getByText("Boka RunAn")).toBeVisible();
        await expect(page.getByText("Budget")).toBeVisible();

        await page.getByRole("button", {name: "Starta mötet"}).click();
        await expect(page.getByText("Protokollförare: Stina Styrgrupp")).toBeVisible();

        await page.goto("/revivals/1");
        await expect(page.getByText("Ett möte pågår")).toBeVisible();
        await expect(page.getByRole("link", {name: /Beslutslogg.*1 öppna rader, 0 försenade/})).toBeVisible();
        await page.getByRole("link", {name: "Direktionsmöte 4"}).click();
        await expect(page.getByRole("heading", {level: 3, name: "Direktionsmöte 4"})).toBeVisible();

        await page.getByRole("button", {name: "Avsluta mötet"}).click();
        await expect(page.getByRole("list", {name: "Rader utan ansvarig"})).toContainText("Rad 1");
        await expect(page.getByRole("dialog").getByRole("button", {name: "Avsluta mötet"})).toBeDisabled();
        await page.getByRole("dialog").getByRole("button", {name: "Rad 1"}).click();

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

        await mock.mail({failOnce: ["p-directeur"], waiting: 1});
        await page.getByRole("button", {name: "Skicka protokollet"}).click();
        await page.getByRole("dialog").getByLabel("Språk").selectOption("en");
        await page.getByRole("dialog").getByRole("button", {name: "Skicka", exact: true}).click();
        await expect(page.getByRole("dialog").getByText("Skickat till 1 person")).toBeVisible();
        await expect(page.getByRole("dialog").getByText("1 medlem väntar på åtkomst och fick inget")).toBeVisible();
        await expect(page.getByRole("dialog").getByText("Dana Directeur")).toBeVisible();
        await page.getByRole("dialog").getByRole("button", {name: "Klar"}).click();

        const sends = page.getByRole("region", {name: "Utskick"});

        await expect(sends.getByText(/De här fick inte protokollet: Dana Directeur/)).toBeVisible();
        await sends.getByRole("button", {name: "Skicka igen till dessa"}).click();
        await expect(page.getByText("Skickat till 1 person").first()).toBeVisible();
        await expect(sends.getByRole("listitem")).toHaveCount(2);
        await expect(sends.getByText(/av Stina Styrgrupp till 1 person$/)).toHaveCount(2);
        await expect(sends.getByRole("button", {name: "Skicka igen till dessa"})).toHaveCount(0);

        await page.getByRole("link", {name: "Mötets rader i loggen"}).click();
        const rows = page.getByRole("table");

        await expect(rows.getByText("Vi spelar i RunAn")).toBeVisible();
        await expect(rows.getByText("Boka RunAn")).toHaveCount(0);
        await expect(page.getByRole("combobox", {name: "Möte"})).toHaveValue(/.+/);
    });
});
