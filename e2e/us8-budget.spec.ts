import type {Page} from "@playwright/test";
import {expect, test} from "./fixtures";

const budgetNav = (page: Page) => page.getByRole("navigation", {name: "Budgetens delar"});

test.describe("Budget, M5: lines from proposals, transactions with receipts, scenarios and reference figures", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "ORGANISING");
        await mock.events();
    });

    test("the steering group member with finance adds a proposed line and a transaction with a receipt, reimburses it, runs a scenario and exports",
        async ({page, loginAs, mock}) => {
            await mock.budget();
            await mock.logRow({revivalId: "1", type: "DECISION", text: "Fyra springare à 1 200 kr"});
            await loginAs("styrgrupp");
            await page.goto("/revivals/1");
            await expect(page.getByRole("region", {name: "Budget"})).toContainText("20 000 kr");
            await page.getByRole("link", {name: "Budget", exact: true}).click();

            await expect(page.getByRole("region", {name: "Resultat"})).toContainText("20 000 kr");
            await expect(page.getByText("Endast läsning")).toHaveCount(0);

            await budgetNav(page).getByRole("link", {name: "Budgetrader"}).click();
            const proposals = page.getByRole("region", {name: "Föreslagna budgetrader"});

            await expect(proposals.getByRole("listitem").filter({hasText: "Mat under rephelgen"})).toContainText("3 400 kr");
            await proposals.getByRole("button", {name: "Lägg till Mat under rephelgen (Rephelg 1)"}).click();

            const dialog = page.getByRole("dialog");

            await expect(dialog.getByLabel("Beskrivning")).toHaveValue("Mat under rephelgen");
            await expect(dialog.getByLabel("Antal")).toHaveValue("40");
            await expect(dialog.getByTestId("line-amount")).toContainText("3 400 kr");
            await dialog.getByLabel("À-pris").fill("90");
            await expect(dialog.getByTestId("line-amount")).toContainText("3 600 kr");
            await dialog.getByLabel("Beslut").selectOption({label: "#1 Fyra springare à 1 200 kr"});
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog).toBeHidden();

            const line = page.getByRole("row").filter({hasText: "Mat under rephelgen"});

            await expect(line).toContainText("3 600 kr");
            await expect(line).toContainText("Rephelg 1");
            await expect(line).toContainText("Beslut #1");
            await expect(proposals).toHaveCount(0);

            await budgetNav(page).getByRole("link", {name: "Transaktioner"}).click();
            await page.getByRole("button", {name: "Ny transaktion"}).click();
            await dialog.getByLabel("Datum", {exact: true}).fill("2027-12-28");
            await dialog.getByLabel("Belopp").fill("1 349,90");
            await dialog.getByLabel("Kategori").selectOption({label: "Mat och dryck"});
            await dialog.getByLabel("Beskrivning").fill("Storhandling");
            await dialog.getByLabel("Budgetrad").selectOption({label: "Mat och dryck: Mat under rephelgen"});
            await dialog.getByLabel("Utlägg av").selectOption({label: "Stina Styrgrupp"});
            await dialog.getByLabel("Kvitto").setInputFiles({name: "kvitto.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 kvitto")});
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog).toBeHidden();

            const transaction = page.getByRole("row").filter({hasText: "Storhandling"});

            await expect(transaction).toContainText("1 349,90 kr");
            await expect(transaction).toContainText("Mot Mat under rephelgen");
            const receipt = transaction.getByRole("link", {name: "Ladda ner kvittot kvitto.pdf"});

            await expect(receipt).toBeVisible();
            const download = await page.request.get((await receipt.getAttribute("href"))!);

            expect(download.status()).toBe(200);
            expect(download.headers()["content-disposition"]).toContain("attachment");
            expect(download.headers()["content-security-policy"]).toContain("sandbox");
            expect(await download.text()).toBe("%PDF-1.4 kvitto");

            await page.getByRole("button", {name: "Åtgärder för Storhandling"}).click();
            await page.getByRole("menuitem", {name: "Ändra"}).click();
            await expect(dialog.getByRole("link", {name: "Ladda ner kvittot kvitto.pdf"})).toBeVisible();
            await expect(dialog.getByRole("button", {name: "Byt kvitto…"})).toBeVisible();
            await dialog.getByRole("button", {name: "Avbryt"}).click();
            await expect(dialog).toBeHidden();

            await page.getByRole("button", {name: "Ej tillbakabetalda"}).click();
            await expect(page.getByRole("row").filter({hasText: "Storhandling"})).toBeVisible();
            await transaction.getByRole("switch", {name: "Tillbakabetald: Storhandling"}).click();
            await expect(page.getByRole("row").filter({hasText: "Storhandling"})).toHaveCount(0);
            await page.getByRole("button", {name: "Ej tillbakabetalda"}).click();
            await expect(transaction.getByRole("switch", {name: "Tillbakabetald: Storhandling"})).toBeChecked();

            await budgetNav(page).getByRole("link", {name: "Översikt"}).click();
            await expect(page.getByRole("region", {name: "Saknar kvitto"})).toContainText("0");
            await expect(page.getByRole("region", {name: "Att betala tillbaka"})).toContainText("Inga utlägg väntar");
            await expect(page.getByRole("region", {name: "Resultat"})).toContainText("16 400 kr");

            await budgetNav(page).getByRole("link", {name: "Scenarion"}).click();
            await expect(page.getByLabel("Sålda biljetter föreställning")).toHaveAttribute("placeholder", "400");
            await page.getByLabel("Sålda biljetter föreställning").fill("300");
            await page.getByRole("button", {name: "Räkna"}).click();
            const result = page.getByRole("region", {name: "Scenariots resultat"});

            await expect(result).toContainText("1 400 kr");
            await expect(result).toContainText("291");
            await page.getByLabel("Namn på scenariot").fill("Färre biljetter");
            await page.getByRole("button", {name: "Spara som scenario"}).click();
            await expect(page.getByRole("region", {name: "Sparade scenarion"}).getByRole("listitem").filter({hasText: "Färre biljetter"}))
                .toContainText("1 400 kr");

            await budgetNav(page).getByRole("link", {name: "Översikt"}).click();
            const [workbook] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", {name: "Exportera till Excel"}).click()]);

            expect(workbook.suggestedFilename()).toBe("budget-ali-baba-2028.xlsx");
        });

    test("a steering group member without finance reads the budget without changing it", async ({page, loginAs, mock}) => {
        await mock.budget({finance: false});
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/budget");

        await expect(page.getByText("Endast läsning")).toBeVisible();
        await expect(page.getByText("bara directeuren och direktionsmedlemmar med ansvarsområdet ekonomi ändrar den")).toBeVisible();
        await expect(page.getByRole("button", {name: "Ändra"})).toHaveCount(0);

        await budgetNav(page).getByRole("link", {name: "Budgetrader"}).click();
        await expect(page.getByRole("row").filter({hasText: "Hyra Kårhuset"})).toContainText("40 000 kr");
        await expect(page.getByRole("button", {name: "Ny budgetrad"})).toHaveCount(0);
        await expect(page.getByRole("region", {name: "Föreslagna budgetrader"})).toHaveCount(0);

        await budgetNav(page).getByRole("link", {name: "Transaktioner"}).click();
        await expect(page.getByText("Budgeten har inga transaktioner än.")).toBeVisible();
        await expect(page.getByRole("button", {name: "Ny transaktion"})).toHaveCount(0);
    });

    test("the super admin keeps categories, reference figures and an event type's budget lines", async ({page, loginAs, mock}) => {
        await mock.budget();
        await loginAs("superadmin");

        await page.goto("/admin/budget-categories");
        await page.getByRole("button", {name: "Ny budgetkategori"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Namn (svenska)").fill("Teknik");
        await dialog.getByRole("radio", {name: /Kostnader/}).check();
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("list", {name: "Budgetkategorier"}).getByRole("listitem").filter({hasText: "Teknik"})).toContainText("Kostnader");

        await page.goto("/admin/reference-figures");
        await expect(page.getByRole("list", {name: "Referenssiffror"})).toContainText("Nobel 2026");
        await page.getByRole("button", {name: "Ny referens"}).click();
        await dialog.getByLabel("Benämning").fill("Snorre 2024");
        await dialog.getByLabel("År").fill("2024");
        await dialog.getByLabel("Deltagare").fill("45");
        await dialog.getByLabel("Budget för Lokaler").fill("30 000");
        await dialog.getByLabel("Utfall för Lokaler").fill("31 500");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("list", {name: "Referenssiffror"}).getByRole("listitem").filter({hasText: "Snorre 2024"})).toContainText("31 500 kr");

        await page.goto("/revivals/1/budget");
        await expect(page.getByText("Endast läsning")).toBeVisible();
        await page.getByRole("button", {name: "Visa referenssiffror för Lokaler"}).click();
        const references = page.getByRole("row", {name: /^Snorre 2024/});

        await expect(references).toContainText("31 500 kr");
        await expect(references).toContainText("700 kr");

        await page.goto("/admin/event-types");
        const lines = page.getByRole("list", {name: "Budgetrader för Rephelg 1"});

        await expect(lines).toContainText("Mat under rephelgen");
        await expect(lines).toContainText("85 kr");
        await page.getByRole("button", {name: "Lägg till budgetrad för Rephelg 2"}).click();
        await dialog.getByLabel("Kategori").selectOption({label: "Lokaler"});
        await dialog.getByLabel("Beskrivning (svenska)").fill("Hyra övningslokal");
        await dialog.getByLabel("Antal beräknas").selectOption({label: "Fast antal"});
        await dialog.getByLabel("Antal", {exact: true}).fill("2");
        await dialog.getByLabel("À-pris").fill("1 500");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("list", {name: "Budgetrader för Rephelg 2"})).toContainText("2 × 1 500 kr");
    });

    test("the timeline of all revivals flags a show in the Chalmersspex's week", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/spex-calendar");
        await page.getByRole("button", {name: "Nytt datum"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Datum", {exact: true}).fill("2028-03-03");
        await dialog.getByLabel("Vad").fill("Chalmersspexet: premiär");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("list", {name: "Chalmersspexet"})).toContainText("2028-03-03");

        await page.goto("/revivals/manage");
        await page.getByRole("link", {name: "Tidslinje", exact: true}).click();
        const timeline = page.getByRole("region", {name: "Tidslinje"});

        await expect(timeline.getByText("1 vecka med krock")).toBeVisible();
        await expect(timeline).toContainText("Vecka 9 2028: Ali Baba 2028, Chalmersspexet: premiär");
        await expect(timeline.getByRole("listitem").filter({hasText: "2028-03-04"})).toContainText("Krock");
    });
});
