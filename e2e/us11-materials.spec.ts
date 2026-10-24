import {expect, test} from "./fixtures";

test.describe("Materials and inventory, M8: links to where files are kept, shown to the right participants", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "OPEN");
        await mock.participants({people: true});
    });

    test("the steering group adds a recognised link and one for a position; only a participant with the position sees the second",
        async ({page, loginAs, mock}) => {
            await loginAs("styrgrupp");
            await page.goto("/revivals/1");
            await page.getByRole("navigation", {name: "Nyuppsättningens delar"}).getByRole("link", {name: "Material"}).click();
            await expect(page.getByText("Inget material än")).toBeVisible();

            await page.getByRole("button", {name: "Nytt material"}).click();
            let sheet = page.getByRole("dialog", {name: "Nytt material"});

            await sheet.getByLabel("Titel").fill("Manus 2028");
            await sheet.getByLabel("Länk").fill("https://docs.google.com/document/d/e2e");
            await expect(sheet.getByText("Känns igen som Google Drive.")).toBeVisible();
            await sheet.getByRole("radio", {name: /Alla deltagare/}).check();
            await sheet.getByRole("button", {name: "Spara"}).click();
            await expect(page.getByText("Materialet lades till")).toBeVisible();
            await expect(sheet).toBeHidden();

            const script = page.getByRole("row").filter({hasText: "Manus 2028"});

            await expect(script).toContainText("Google Drive");
            await expect(script).toContainText("Alla deltagare");
            await expect(script.getByRole("link", {name: /Manus 2028/})).toHaveAttribute("target", "_blank");
            await expect(script.getByRole("link", {name: /Manus 2028/})).toHaveAttribute("rel", "noopener noreferrer");

            // Spexflix has no hosts yet, so the steering group picks it
            await page.getByRole("button", {name: "Nytt material"}).click();
            sheet = page.getByRole("dialog", {name: "Nytt material"});
            await sheet.getByLabel("Titel").fill("Föreställningen 1988");
            await sheet.getByLabel("Länk").fill("http://spexflix.example/v/1988");
            await sheet.getByRole("button", {name: "Spara"}).click();
            await expect(sheet.getByText("Ange en hel länk som börjar med https://")).toBeVisible();
            await sheet.getByLabel("Länk").fill("https://spexflix.example/v/1988");
            await expect(sheet.getByText("Ingen tjänst känner igen spexflix.example.")).toBeVisible();
            await sheet.getByLabel("Tjänst").selectOption({label: "Spexflix"});
            await sheet.getByLabel("Kategori").selectOption({label: "Film"});
            await sheet.getByRole("radio", {name: /Vissa befattningar/}).check();
            await sheet.getByRole("button", {name: "Spara"}).click();
            await expect(sheet.getByText("Välj minst en befattning.")).toBeVisible();
            await sheet.getByRole("checkbox", {name: "Ensemble"}).click();
            await sheet.getByRole("button", {name: "Spara"}).click();
            await expect(sheet).toBeHidden();

            const film = page.getByRole("row").filter({hasText: "Föreställningen 1988"});

            await expect(film).toContainText("Spexflix");
            await expect(film).toContainText("Befattningar: Ensemble");

            // Without a position, Disa sees only what is for every participant
            await loginAs("deltagare");
            await page.goto("/revivals/1/me");
            const mine = page.getByRole("region", {name: "Material"});

            await expect(mine.getByRole("link", {name: /Manus 2028/})).toHaveAttribute("href", "https://docs.google.com/document/d/e2e");
            await expect(mine).toContainText("Google Drive");
            await expect(mine.getByText("Föreställningen 1988")).toHaveCount(0);

            await mock.materials({disaPosition: "T-ENS"});
            await page.reload();
            await expect(mine.getByRole("link", {name: /Föreställningen 1988/})).toHaveAttribute("target", "_blank");
            await expect(mine.getByRole("heading", {name: "Film"})).toBeVisible();
        });

    test("the steering group keeps an inventory item with an owner and a status that needs action", async ({page, loginAs}) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/materials/inventory");
        await expect(page.getByText("Inga inventarier än")).toBeVisible();

        await page.getByRole("button", {name: "Ny inventarie"}).click();
        const sheet = page.getByRole("dialog", {name: "Ny inventarie"});

        await sheet.getByLabel("Namn").fill("Flygande matta");
        await sheet.getByLabel("Typ").selectOption({label: "Rekvisita"});
        await sheet.getByLabel("Antal").fill("2");
        await sheet.getByLabel("Status").selectOption({label: "Byggs"});
        await sheet.getByLabel("Plats", {exact: true}).selectOption({label: "Runan"});
        await sheet.getByLabel("Var exakt").fill("Hylla 3");
        await sheet.getByLabel("Vem har det").selectOption({label: "Någon utanför direktionen…"});
        await sheet.getByRole("textbox", {name: "Namn"}).last().fill("Sam på lokalen");
        await sheet.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Inventarien lades till")).toBeVisible();

        const carpet = page.getByRole("row").filter({hasText: "Flygande matta"});

        await expect(carpet).toContainText("Byggs");
        await expect(carpet).toContainText("Runan");
        await expect(carpet).toContainText("Hylla 3");
        await expect(carpet).toContainText("Sam på lokalen");
        await expect(page.getByText("1 sak behöver hittas, köpas eller byggas.")).toBeVisible();

        await carpet.getByRole("button", {name: "Åtgärder för Flygande matta"}).click();
        await page.getByRole("menuitem", {name: "Ta bort"}).click();
        await expect(page.getByText("Inventarien togs bort")).toBeVisible();
        await expect(page.getByRole("row").filter({hasText: "Flygande matta"})).toHaveCount(0);
        await page.getByRole("switch", {name: "Visa borttagna"}).click();
        await expect(page.getByRole("row").filter({hasText: "Flygande matta"})).toContainText("Borttagen");
    });

    test("an observer reads the steering group's work but not its materials", async ({page, loginAs}) => {
        await loginAs("observer");
        await page.goto("/revivals/1");
        const tabs = page.getByRole("navigation", {name: "Nyuppsättningens delar"});

        await expect(tabs.getByRole("link", {name: "Beslutslogg"})).toBeVisible();
        await expect(tabs.getByRole("link", {name: "Material"})).toHaveCount(0);
    });

    test("the super admin gives Spexflix a host, after which its links are recognised", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/link-services");
        await expect(page.getByRole("heading", {name: "Länktjänster"})).toBeVisible();

        await page.getByRole("button", {name: "Redigera Spexflix"}).click();
        const sheet = page.getByRole("dialog", {name: "Ändra tjänst"});

        await sheet.getByRole("textbox", {name: "Värdnamn"}).fill("https://Spexflix.example/v/1");
        await sheet.getByRole("textbox", {name: "Värdnamn"}).press("Enter");
        await expect(sheet.getByRole("list", {name: "Värdnamn"})).toContainText("spexflix.example");
        await sheet.getByRole("button", {name: "Spara"}).click();
        await expect(sheet).toBeHidden();
        await expect(page.getByRole("listitem").filter({hasText: "Spexflix"})).toContainText("spexflix.example");

        await loginAs("styrgrupp");
        await page.goto("/revivals/1/materials");
        await page.getByRole("button", {name: "Nytt material"}).click();
        await page.getByRole("dialog", {name: "Nytt material"}).getByLabel("Länk").fill("https://www.spexflix.example/v/2");
        await expect(page.getByText("Känns igen som Spexflix.")).toBeVisible();
    });
});
