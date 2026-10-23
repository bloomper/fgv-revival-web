import {expect, test} from "./fixtures";

test.describe("Guide, user story 5: the steering group suggests changes", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await loginAs("styrgrupp");
    });

    test("suggests new text for a tip and a new requirement, and withdraws one", async ({page}) => {
        await page.goto("/revivals/1/guide/B");

        const tip = page.locator("[id^='item-']").filter({hasText: "Kontrollera sprittillstånd"});

        await tip.getByRole("button", {name: "Föreslå en ändring"}).click();
        await page.getByLabel("Svenska").fill("Kontrollera sprittillstånd och ljudtillstånd.");
        await page.getByLabel("Varför?").fill("Ljudet glömdes bort förra gången.");
        await page.getByRole("button", {name: "Skicka förslaget"}).click();
        await expect(page.getByRole("dialog")).toHaveCount(0, {timeout: 15_000});

        await page.goto("/revivals/1/guide/E");
        await page.getByRole("region", {name: /^5\. Ordna tillgångar/}).getByRole("button", {name: "Föreslå ny punkt"}).first().click();
        await page.getByLabel("Typ").selectOption("REQUIREMENT");
        await page.getByLabel("Svenska").fill("Förrådet ska inventeras innan första rephelgen.");
        await page.getByRole("button", {name: "Skicka förslaget"}).click();
        await expect(page.getByRole("dialog")).toHaveCount(0, {timeout: 15_000});

        await page.getByRole("link", {name: "Version och förslag"}).click();
        await page.getByRole("link", {name: "Alla förslag"}).click();
        await expect(page.getByText("Kontrollera sprittillstånd och ljudtillstånd.")).toBeVisible();
        await expect(page.getByText("Förrådet ska inventeras innan första rephelgen.")).toBeVisible();

        await page.getByRole("button", {name: "Föreslå ny punkt"}).click();
        await page.getByRole("combobox", {name: "Kapitel", exact: true}).selectOption({label: "10. Stänga nyuppsättningen"});
        await page.getByLabel("Svenska").fill("Lärdomar ska skrivas ner.");
        await page.getByRole("button", {name: "Skicka förslaget"}).click();
        await expect(page.getByText("Lärdomar ska skrivas ner.")).toBeVisible();

        await page.getByTestId(/suggestion-/).filter({hasText: "Förrådet ska inventeras"}).getByRole("button", {name: "Återkalla"}).click();
        await expect(page.getByText("Förslaget är återkallat")).toBeVisible();
        await expect(page.getByTestId(/suggestion-/).filter({hasText: "Förrådet ska inventeras"}).getByText("Återkallade")).toBeVisible();
    });
});

test.describe("Guide, user story 5: the super admin decides", () => {
    test("accepts one suggestion into a new draft, rejects another, and a discarded draft reopens the accepted one", async ({page, mock, loginAs, request}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await loginAs("superadmin");

        // Two suggestions from the steering group, made through the mock's GraphQL as Stina
        for (const proposal of [
            {kind: "CHANGE", itemKey: null, proposedTextSv: "Ändrat tips.", reason: "Inaktuellt"},
            {kind: "ADD", chapterKey: "E", proposedType: "TIP", proposedTextSv: "Ett nytt tips.", reason: null},
        ]) {
            await request.post("http://localhost:4101/__suggest", {data: {revivalId: "1", ...proposal}});
        }

        await page.goto("/admin/guide/suggestions");
        const change = page.getByTestId(/suggestion-/).filter({hasText: "Ändrat tips."});
        const add = page.getByTestId(/suggestion-/).filter({hasText: "Ett nytt tips."});

        await change.getByRole("button", {name: "Godta"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Godta"}).click();
        await expect(page.getByText("Förslaget är godtaget och finns i utkastet")).toBeVisible();

        await add.getByRole("button", {name: "Avslå"}).click();
        await page.getByLabel(/Motivering/).fill("Finns redan i kapitel D.");
        await page.getByRole("dialog").getByRole("button", {name: "Avslå"}).click();
        await expect(page.getByText("Förslaget är avslaget")).toBeVisible();

        await page.goto("/admin/guide");
        await page.getByRole("button", {name: "Kasta utkastet"}).click();
        await expect(page.getByRole("alertdialog")).toContainText("1 godtaget förslag öppnas igen.");
        await page.getByRole("alertdialog").getByRole("button", {name: "Kasta"}).click();
        await expect(page.getByText("Utkastet är kastat")).toBeVisible();

        await page.goto("/admin/guide/suggestions?status=OPEN");
        await expect(page.getByTestId(/suggestion-/).filter({hasText: "Ändrat tips."}).getByText(/öppet igen/)).toBeVisible();
    });
});
