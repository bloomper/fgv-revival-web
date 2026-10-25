import {expect, test} from "./fixtures";

test.describe("Events: the timeline, proposals from the premiere and calendar links", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "ORGANISING");
        await mock.events();
    });

    test("the steering group adds a proposed event with its checklist, edits, cancels and subscribes to the calendar", async ({
                                                                                                                                  page,
                                                                                                                                  loginAs
                                                                                                                              }) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Händelser", exact: true}).click();

        const proposals = page.getByRole("region", {name: "Föreslagna händelser"});

        await expect(proposals.getByRole("listitem").filter({hasText: "Rephelg 1"})).toContainText("2028-01-01 – 2028-01-02");
        await proposals.getByRole("button", {name: "Lägg till Rephelg 1"}).click();

        const dialog = page.getByRole("dialog");

        await expect(dialog.getByLabel("Rubrik")).toHaveValue("Rephelg 1");
        await expect(dialog.getByLabel("Sista dag")).toHaveValue("2028-01-02");
        await dialog.getByLabel("Plats").fill("Kemihuset");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();

        const row = page.getByRole("row").filter({hasText: "Kemihuset"});

        await expect(row).toContainText("2028-01-01 – 2028-01-02");
        await expect(row).toContainText("−9 v.");
        await expect(proposals.getByRole("button", {name: "Lägg till Rephelg 1"})).toHaveCount(0);

        await row.getByRole("link", {name: "Checklista: 2 av 2 punkter öppna"}).click();
        await expect(page.getByRole("heading", {level: 3, name: /Rephelg 1/})).toBeVisible();
        await expect(page.getByText("Boka lokaler")).toBeVisible();
        await page.getByRole("link", {name: "Hör till händelsen Rephelg 1"}).click();

        await page.getByRole("button", {name: "Åtgärder för Rephelg 1"}).click();
        await page.getByRole("menuitem", {name: "Ändra"}).click();
        await dialog.getByLabel("Rubrik").fill("Rephelg 1 i Kemi");
        await dialog.getByLabel("Starttid").fill("10:00");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("row").filter({hasText: "Rephelg 1 i Kemi"})).toContainText("2028-01-01 10:00 – 2028-01-02");

        await page.getByRole("button", {name: "Ny händelse"}).click();
        await expect(dialog.getByLabel("Typ")).toHaveValue("");
        await dialog.getByLabel("Rubrik").fill("Förrådsbesök");
        await dialog.getByLabel("Första dag").fill("2027-11-02");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("row").filter({hasText: "Förrådsbesök"})).toContainText("2027-11-02");

        await page.getByRole("link", {name: "Tidslinje", exact: true}).click();
        const timeline = page.getByRole("region", {name: "Tidslinje"});

        await expect(timeline.getByRole("heading", {name: "Januari 2028"})).toBeVisible();
        await expect(timeline.getByRole("listitem").filter({hasText: "Rephelg 1 i Kemi"})).toContainText("−9 v.");
        await expect(timeline.getByRole("listitem").filter({has: page.getByText("Premiär", {exact: true})})).toContainText("2028-03-04");
        await expect(timeline.getByText("Föreställning, Kårhuset")).toBeVisible();
        await page.getByRole("link", {name: "Lista", exact: true}).click();

        await page.getByRole("button", {name: "Åtgärder för Förrådsbesök"}).click();
        await page.getByRole("menuitem", {name: "Ställ in"}).click();
        await page.getByRole("alertdialog").getByRole("button", {name: "Ställ in"}).click();
        await expect(page.getByRole("row").filter({hasText: "Förrådsbesök"})).toHaveCount(0);
        await page.getByRole("switch", {name: "Visa inställda"}).click();
        await expect(page).toHaveURL(/\?cancelled=1$/);
        await expect(page.getByRole("row").filter({hasText: "Förrådsbesök"})).toContainText("Inställd");

        await page.getByRole("button", {name: "Kalenderlänk"}).click();
        await page.getByRole("dialog").getByRole("button", {name: "Skapa länk"}).click();
        const address = page.getByRole("dialog").getByLabel("Länk att prenumerera på");

        await expect(address).toHaveValue(/\/api\/calendar\/[A-Za-z0-9_-]+\.ics$/);
        const url = await address.inputValue();
        const feed = await page.request.get(url);

        expect(feed.status()).toBe(200);
        expect(feed.headers()["content-type"]).toContain("text/calendar");
        expect(feed.headers()["cache-control"]).toBe("private, max-age=900");
        expect(await feed.text()).toContain("SUMMARY:Rephelg 1 i Kemi");
        await page.getByRole("dialog").getByRole("button", {name: "Stäng"}).first().click();

        await page.getByRole("button", {name: "Kalenderlänk"}).click();
        await expect(page.getByRole("dialog")).toContainText("Du har en kalenderlänk sedan");
        await page.getByRole("dialog").getByRole("button", {name: "Stäng av"}).click();
        await expect(page.getByRole("dialog")).toContainText("Du har ingen kalenderlänk");
        expect((await page.request.get(url)).status()).toBe(404);
        expect((await page.request.get("/api/calendar/not-a-feed.txt")).status()).toBe(404);

        await page.goto("/revivals/1");
        await expect(page.getByText("Kommande händelser")).toBeVisible();
        await expect(page.getByText("Rephelg 1 i Kemi")).toBeVisible();
    });

    test("the observer reads the events without changing them", async ({page, loginAs}) => {
        await loginAs("observer");
        await page.goto("/revivals/1/events");

        await expect(page.getByText("Endast läsning")).toBeVisible();
        await expect(page.getByText("Inga händelser än.")).toBeVisible();
        await expect(page.getByRole("button", {name: "Ny händelse"})).toHaveCount(0);
        await expect(page.getByRole("button", {name: "Kalenderlänk"})).toHaveCount(0);
        await expect(page.getByRole("region", {name: "Föreslagna händelser"})).toHaveCount(0);
    });

    test("the super admin edits and retires event types", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/event-types");
        await expect(page.getByRole("heading", {level: 2, name: "Händelsetyper"})).toBeVisible();
        const row = (name: string) => page.getByRole("list", {name: "Händelsetyper"}).getByRole("listitem").filter({hasText: name});

        await expect(row("Rephelg 1")).toContainText("10–8 veckor före premiären");
        await expect(row("Rephelg 1")).toContainText("Checklista: Övningshelg");

        await page.getByRole("button", {name: "Ändra Kortafton"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Tidigast (dagar)").fill("14");
        await expect(dialog.getByText("2–13 veckor efter premiären")).toBeVisible();
        await dialog.getByLabel("Tidigast (dagar)").fill("100");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog.getByText("Tidigast får inte ligga efter senast.")).toBeVisible();
        await dialog.getByLabel("Tidigast (dagar)").fill("14");
        await dialog.getByLabel("Antal dagar").fill("2");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(row("Kortafton")).toContainText("2–13 veckor efter premiären");
        await expect(row("Kortafton")).toContainText("2 dagar");

        await page.getByRole("button", {name: "Avveckla AW"}).click();
        await expect(row("AW")).toHaveCount(0);
        await page.getByRole("switch", {name: "Visa avvecklade"}).click();
        await expect(row("AW")).toContainText("Avvecklad");
    });
});
