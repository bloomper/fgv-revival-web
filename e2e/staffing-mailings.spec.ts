import {expect, test} from "./fixtures";

// The mock places "Rephelg 1" five days from today, so its allergy mailing is due
const day = (offset: number) => new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const first = day(5);
const second = day(6);

test.describe("Staffing and mailings: availability, shifts, the mailing plan and sending", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "OPEN");
        await mock.participants({people: true});
    });

    test("the participant answers for each day, takes an open shift, sees it in the schedule and leaves it", async ({
                                                                                                                        page,
                                                                                                                        loginAs,
                                                                                                                        mock
                                                                                                                    }) => {
        await mock.staffing({answered: true});
        await page.setViewportSize({width: 390, height: 844});
        await loginAs("deltagare");
        await page.goto("/revivals/1/me");

        const availability = page.getByRole("region", {name: "Kan du?"});
        const firstDay = availability.getByRole("group", {name: new RegExp(first)});
        const secondDay = availability.getByRole("group", {name: new RegExp(second)});

        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
        await expect(secondDay.getByRole("radio", {name: "Kan", exact: true})).toBeChecked();
        expect((await firstDay.locator("label").filter({hasText: "Kanske"}).boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await firstDay.getByRole("radio", {name: "Kanske"}).check();
        await firstDay.getByLabel("Kommentar").fill("Dålig rygg, kan annat");
        await availability.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Dina svar är sparade")).toBeVisible();
        await page.reload();
        await expect(firstDay.getByRole("radio", {name: "Kanske"})).toBeChecked();
        await expect(firstDay.getByLabel("Kommentar")).toHaveValue("Dålig rygg, kan annat");

        const open = page.getByRole("region", {name: "Lediga pass"});

        await expect(open).toContainText("Biljettkontroll");
        await expect(open).toContainText("2 platser kvar");
        await open.getByRole("button", {name: `Ta passet Biljettkontroll, ${first} 18:00–20:00`}).click();
        await expect(page.getByText("Du har tagit passet")).toBeVisible();
        await expect(open).toContainText("Inga lediga pass just nu.");

        const mine = page.getByRole("region", {name: "Mina pass"});

        await expect(mine).toContainText("Biljettkontroll");
        await expect(page.getByRole("region", {name: "Schema"}).getByRole("list", {name: "Dina pass"})).toContainText(`Biljettkontroll ${first} 18:00–20:00`);
        await mine.getByRole("button", {name: /Lämna passet Biljettkontroll/}).click();
        await expect(page.getByText("Du har lämnat passet")).toBeVisible();
        await expect(mine).toContainText("Du har inga pass än.");
    });

    test("a STAFFING member adds a slot and assigns by availability; the matrix and the print show it", async ({
                                                                                                                   page,
                                                                                                                   loginAs,
                                                                                                                   mock
                                                                                                               }) => {
        await mock.staffing({capabilities: ["STAFFING"], answered: true});
        await loginAs("styrgrupp");
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Bemanning", exact: true}).click();
        await expect(page.getByLabel("Händelse")).toHaveValue(/\d+/);

        const secondDay = page.getByRole("region", {name: new RegExp(second)});

        await expect(secondDay).toContainText("Inga pass den här dagen.");
        await page.getByRole("button", {name: `Lägg till pass ${second}`}).click();

        const dialog = page.getByRole("dialog", {name: "Lägg till pass"});

        await expect(dialog.getByLabel("Dag")).toHaveValue(second);
        await dialog.getByLabel("Från").fill("12:00");
        await dialog.getByLabel("Till").fill("11:00");
        await dialog.getByLabel("Uppgift").fill("Bar");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog.getByText("Sluttiden måste vara efter starttiden.")).toBeVisible();
        await dialog.getByLabel("Till").fill("14:00");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(secondDay).toContainText("Bar");
        await expect(secondDay).toContainText("0 av 1");

        await secondDay.getByRole("button", {name: "Bemanna Bar 12:00–14:00"}).click();
        const options = page.getByRole("listbox").getByRole("option");

        // Disa said she can that day; Anna has not answered
        await expect(options.first()).toContainText("Disa Deltagare");
        await expect(options.first()).toContainText("Kan");
        await expect(options.nth(1)).toContainText("Anna \"Spexis\" Andersson");
        await expect(options.nth(1)).toContainText("Inget svar");
        await options.first().click();
        await expect(page.getByText("Disa Deltagare har passet")).toBeVisible();
        await expect(secondDay.getByRole("list", {name: "Bemannat Bar"})).toContainText("Disa Deltagare");
        await expect(secondDay).toContainText("Fullt");

        await page.getByRole("link", {name: "Tillgänglighet"}).click();
        const matrix = page.getByRole("table", {name: /Tillgänglighet för Rephelg 1/});

        await expect(matrix.getByRole("row", {name: /Disa Deltagare/})).toContainText("Kan");

        await page.getByRole("link", {name: "Pass", exact: true}).click();
        const href = await page.getByRole("link", {name: "Skriv ut schemat"}).getAttribute("href");

        expect(await page.getByRole("link", {name: "Skriv ut schemat"}).getAttribute("target")).toBe("_blank");
        await page.goto(href!);
        await expect(page.getByRole("heading", {name: "Bemanning: Rephelg 1"})).toBeVisible();
        await expect(page.getByRole("row", {name: /Bar/})).toContainText("Disa Deltagare");
        await page.emulateMedia({media: "print"});
        await expect(page.getByRole("navigation", {name: "Nyuppsättningens delar"})).toBeHidden();
        await expect(page.getByRole("button", {name: "Skriv ut"})).toBeHidden();
    });

    test("a steering group member without STAFFING reads the staffing but cannot change it", async ({
                                                                                                        page,
                                                                                                        loginAs,
                                                                                                        mock
                                                                                                    }) => {
        await mock.staffing();
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/staffing");
        await expect(page.getByText("Biljettkontroll")).toBeVisible();
        await expect(page.getByRole("button", {name: /Lägg till pass/})).toHaveCount(0);
        await expect(page.getByRole("button", {name: /Bemanna/})).toHaveCount(0);
    });

    test("a COMMS member drafts the due mailing from the plan and sends it", async ({page, loginAs, mock}) => {
        await mock.staffing({capabilities: ["COMMS"], answered: true});
        await loginAs("styrgrupp");
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Utskick", exact: true}).click();

        const plan = page.getByRole("region", {name: "Utskicksplan"});
        const allergies = plan.getByRole("listitem").filter({hasText: "Allergier inför rephelgen"});

        await expect(allergies).toContainText("Dags");
        await expect(allergies).toContainText("Rephelg 1");
        await allergies.getByRole("link", {name: "Skapa utkast: Allergier inför rephelgen"}).click();

        await expect(page.getByLabel("Vilka")).toHaveValue("EVENT_ATTENDEES");
        await expect(page.getByLabel("Händelse")).not.toHaveValue("");
        await expect(page.getByLabel("Ämne")).toHaveValue("Allergier inför rephelgen");
        await expect(page.getByText("1 mottagare just nu")).toBeVisible();
        await expect(page.getByRole("region", {name: "Förhandsvisning"}).locator("strong")).toHaveText("senast fredag");
        await page.getByRole("button", {name: "Engelska", exact: true}).click();
        await expect(page.getByLabel("Ämne")).toHaveValue("Allergies before the rehearsal weekend");
        await page.getByRole("button", {name: "Svenska", exact: true}).click();
        await page.getByRole("button", {name: "Spara utkast"}).click();
        await expect(page.getByText("Utkastet är sparat")).toBeVisible();
        await expect(page).toHaveURL(/\/revivals\/1\/mailings\/ml\d+$/);

        await page.getByRole("button", {name: "Skicka", exact: true}).click();
        const confirm = page.getByRole("alertdialog", {name: "Skicka Allergier inför rephelgen?"});

        await expect(confirm).toContainText("1 mottagare just nu");
        await confirm.getByRole("button", {name: "Skicka till 1 mottagare"}).click();
        await expect(page.getByText("Skickat till 1 mottagare")).toBeVisible();
        await expect(page.getByRole("heading", {level: 3, name: /Allergier inför rephelgen/})).toContainText("Skickat");

        const recipients = page.getByRole("region", {name: "Mottagare (1)"});

        await expect(recipients).toContainText("Disa Deltagare");
        await expect(recipients).toContainText("Skickat");

        await page.getByRole("link", {name: "Alla utskick"}).click();
        await expect(plan.getByRole("listitem").filter({hasText: "Allergier inför rephelgen"})).not.toContainText("Dags");
        await expect(page.getByRole("row").filter({hasText: "Allergier inför rephelgen"})).toContainText("Skickat");
    });

    test("a member without COMMS drafts a mailing with a live audience but cannot send it", async ({
                                                                                                       page,
                                                                                                       loginAs,
                                                                                                       mock
                                                                                                   }) => {
        await mock.staffing({answered: true});
        await loginAs("styrgrupp");
        await page.goto("/revivals/1/mailings");
        await page.getByRole("link", {name: "Nytt utskick"}).click();

        await page.getByLabel("Vilka").selectOption({label: "De som inte har svarat"});
        await expect(page.getByText("Ingen mottagare just nu")).toBeVisible();
        await page.getByLabel("Vilka").selectOption({label: "Bekräftade deltagare (ja)"});
        await expect(page.getByText("1 mottagare just nu")).toBeVisible();
        await page.getByLabel("Vilka").selectOption({label: "Deltagare med befattning"});
        await page.getByRole("button", {name: "Spara utkast"}).click();
        await expect(page.getByText("Välj en befattning.")).toBeVisible();
        await expect(page.getByText("Skriv ett ämne.")).toBeVisible();
        await page.getByLabel("Vilka").selectOption({label: "Bekräftade deltagare (ja)"});
        await page.getByLabel("Ämne").fill("Välkomna!");
        await page.getByLabel("Text").fill("Vi ses på **kickoffen**.\n\n<img src=\"https://example.org/x.png\">");
        await expect(page.getByRole("region", {name: "Förhandsvisning"}).locator("strong")).toHaveText("kickoffen");
        await expect(page.getByRole("region", {name: "Förhandsvisning"}).locator("img")).toHaveCount(0);
        await page.getByRole("button", {name: "Spara utkast"}).click();
        await expect(page).toHaveURL(/\/revivals\/1\/mailings\/ml\d+$/);

        await expect(page.getByText("Directeuren eller den som ansvarar för kommunikation skickar utkastet.")).toBeVisible();
        await expect(page.getByRole("button", {name: "Skicka", exact: true})).toHaveCount(0);
        // The new mailing's page stays mounted, hidden, after the redirect (Cache Components keeps recent routes)
        await page.getByRole("textbox", {name: "Ämne"}).fill("Välkomna allihop!");
        await page.getByRole("button", {name: "Spara utkast"}).click();
        await expect(page.getByRole("heading", {level: 3, name: /Välkomna allihop!/})).toBeVisible();
    });

    test("the super admin adds a template to the mailing plan, and revivals plan it", async ({page, loginAs, mock}) => {
        await mock.staffing();
        await loginAs("superadmin");
        await page.goto("/admin/mailing-templates");
        await expect(page.getByRole("heading", {level: 2, name: "Utskicksplan"})).toBeVisible();
        await expect(page.getByRole("list", {name: "Utskicksplan"})).toContainText("måndag veckan innan Rephelg 1");

        await page.getByRole("button", {name: "Lägg till utskick"}).click();
        const sheet = page.getByRole("dialog", {name: "Lägg till utskick"});

        await sheet.getByLabel("Namn (svenska)").fill("Tack för i år");
        await sheet.getByLabel("Vilka").selectOption({label: "Funktionärer"});
        await sheet.getByLabel("Räknas från").selectOption({label: "Premiären"});
        await sheet.getByLabel("Typ av deadline").selectOption({label: "Dagar"});
        await sheet.getByLabel("Antal").fill("7");
        await sheet.getByLabel("Före eller efter").selectOption({label: "efter"});
        await sheet.getByRole("group", {name: "Svenska", exact: true}).getByLabel("Ämne").fill("Tack!");
        await sheet.getByRole("group", {name: "Svenska", exact: true}).getByLabel("Text").fill("Tack för hjälpen.");
        await sheet.getByRole("button", {name: "Spara"}).click();
        await expect(sheet).toBeHidden();
        await expect(page.getByRole("list", {name: "Utskicksplan"}).getByRole("listitem").filter({hasText: "Tack för i år"}))
            .toContainText("7 dagar efter premiären");

        await page.goto("/revivals/1/mailings");
        await expect(page.getByRole("region", {name: "Utskicksplan"})).toContainText("Tack för i år");
    });
});
