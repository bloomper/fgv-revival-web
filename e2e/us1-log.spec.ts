import {type Page} from "@playwright/test";
import {expect, test} from "./fixtures";

const yesterday = () => new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);

async function addRow(page: Page, {type, text, owner, ownerName, deadline, tag}: {
    type: string; text: string; owner?: string; ownerName?: string; deadline?: string; tag?: string;
}) {
    await page.getByRole("button", {name: "Ny rad"}).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByLabel("Typ").selectOption({label: type});
    await dialog.getByLabel("Vad").fill(text);
    if (owner) {
        await dialog.getByLabel("Ansvarig").selectOption({label: owner});
    }
    if (ownerName) {
        await dialog.getByLabel("Ansvarig").selectOption({label: "Någon utanför direktionen…"});
        await dialog.getByLabel("Namn").fill(ownerName);
    }
    if (deadline) {
        await dialog.getByLabel("Klart senast").fill(deadline);
    }
    if (tag) {
        await dialog.getByLabel("Taggar").fill(tag);
        await dialog.getByLabel("Taggar").press("Enter");
    }
    await dialog.getByRole("button", {name: "Spara"}).click();
    await expect(dialog).toBeHidden();
}

test.describe("Decision log, user story 1: the steering group keeps the decision log", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.setStatus("1", "ORGANISING");
        await loginAs("styrgrupp");
    });

    test("adds rows, filters them, answers a question and cancels a row", async ({page}) => {
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Beslutslogg"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Beslutslogg"})).toBeVisible();
        await expect(page.getByText("Loggen är tom.")).toBeVisible();

        await addRow(page, {type: "Att göra", text: "Boka RunAn", owner: "Stina Styrgrupp", deadline: yesterday(), tag: "lokal"});
        await addRow(page, {type: "Fråga", text: "Var har vi kalaset?", tag: "lokal"});
        await addRow(page, {type: "Att göra", text: "Skicka offert", ownerName: "Sam på lokalen"});

        const table = page.getByRole("table");

        await expect(table.getByRole("row")).toHaveCount(4);
        await expect(table.getByText("Försenad")).toBeVisible();
        await expect(table.getByText("Sam på lokalen")).toBeVisible();
        await expect(table.getByText("inte medlem")).toBeVisible();

        await page.getByRole("button", {name: "Mina"}).click();
        await page.getByRole("button", {name: "Försenade"}).click();
        await expect(page).toHaveURL(/mine=1&overdue=1/);
        await expect(table.getByRole("row")).toHaveCount(2);
        await expect(table.getByText("Boka RunAn")).toBeVisible();

        await page.goto("/revivals/1/log?tag=lokal");
        await expect(page.getByRole("table").getByRole("row")).toHaveCount(3);

        await page.goto("/revivals/1/log");
        await page.getByRole("button", {name: "Besvara fråga 2"}).click();
        await page.getByRole("dialog").getByLabel("Beslut").fill("Kalaset blir på Kårhuset");
        await page.getByRole("dialog").getByRole("button", {name: "Besvara"}).click();
        await expect(page.getByRole("table").getByText("Besvarar fråga 2")).toBeVisible();
        await expect(page.getByRole("table").getByText("Besvarad i rad 4")).toBeVisible();

        await page.getByRole("table").getByLabel("Status för rad 3").selectOption({label: "Struken"});
        await expect(page.getByRole("table").getByLabel("Status för rad 3")).toHaveValue("CANCELLED");
        await expect(page.getByRole("button", {name: /Ta bort/})).toHaveCount(0);
    });
});

test("an observer reads the log without any controls", async ({page, mock, loginAs}) => {
    await mock.setStatus("1", "ORGANISING");
    await mock.logRow({revivalId: "1", type: "DECISION", text: "Spexpengen är 1500 kr"});
    await loginAs("observer");
    await page.goto("/revivals/1/log");

    await expect(page.getByRole("table").getByText("Spexpengen är 1500 kr")).toBeVisible();
    await expect(page.getByRole("button", {name: "Ny rad"})).toHaveCount(0);
    await expect(page.getByRole("button", {name: /Ändra rad/})).toHaveCount(0);
});
