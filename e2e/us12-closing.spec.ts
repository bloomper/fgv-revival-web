import {expect, test} from "./fixtures";

test.describe("Closing, M7: the directeur records the surplus, marks memberships, syncs to Spexregister and anonymizes", () => {
    test.beforeEach(async ({mock}) => {
        await mock.participants({people: true});
    });

    test("the directeur in SETTLING closes the revival, and the super admin sees it anonymized", async ({
                                                                                                            page,
                                                                                                            loginAs,
                                                                                                            mock
                                                                                                        }) => {
        test.setTimeout(90_000);
        await mock.closing({failOnce: ["TASK"]});
        await loginAs("directeur");
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Avslut", exact: true}).click();

        // The surplus decision is a DECISION in the log tagged "överskott"
        const surplus = page.getByRole("region", {name: "Beslut om överskott"});

        await expect(surplus).toContainText("Inget beslut om överskottet än.");
        await surplus.getByRole("button", {name: "Skriv beslut om överskott"}).click();
        const sheet = page.getByRole("dialog", {name: "Ny rad i loggen"});

        await expect(sheet.getByLabel("Typ")).toHaveValue("DECISION");
        await expect(sheet.getByRole("button", {name: "Ta bort taggen överskott"})).toBeVisible();
        await sheet.getByLabel("Vad").fill("Överskottet går till FGV.");
        await sheet.getByRole("button", {name: "Spara"}).click();
        await expect(surplus).toContainText("Beslut #1 i loggen");

        // FGV membership for those who said yes; the pending person is listed too, as a participant
        const membership = page.getByRole("region", {name: "FGV-medlemskap"});

        await expect(membership.getByLabel("År")).toHaveValue("2028");
        await membership.getByRole("checkbox", {name: "Anna \"Spexis\" Andersson"}).check();
        await membership.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Medlemskapen sparades")).toBeVisible();

        // The preview: what is written per participant, and who is left out
        const sync = page.getByRole("region", {name: "Synkning till Spexregistret"});
        const anna = sync.getByRole("row").filter({hasText: "Anna Andersson"});

        await expect(sync).toContainText("Nyuppsättningen finns inte i Spexregistret än och skapas först.");
        await expect(anna).toContainText("Befattning: Ensemble");
        await expect(anna).toContainText("Roll: Ali Baba");
        await expect(anna).toContainText("Medlemskap: 2028");
        await expect(sync.getByRole("row").filter({hasText: "Bertil Bengtsson"})).toContainText("Befattning: Orkester");
        await expect(sync).toContainText("1 deltagare synkas inte");
        await expect(sync.getByRole("listitem").filter({hasText: "Disa Deltagare"})).toBeVisible();
        await expect(sync).toContainText("7 saker förs in");

        await sync.getByRole("button", {name: "Starta synkning"}).click();
        const confirm = page.getByRole("alertdialog", {name: "Synka till Spexregistret?"});

        await expect(confirm).toContainText("7 saker för 2 deltagare");
        await confirm.getByRole("button", {name: "Starta synkning"}).click();

        // One step fails the first time: the run ends partly failed, and resuming writes only what is missing
        const run = sync.getByTestId("sync-run");

        await expect(run).toContainText("Delvis misslyckad", {timeout: 20_000});
        await expect(run).toContainText("Anna Andersson: Befattning – Spexregistret vägrade");
        await expect(anna).toContainText("Deltagande (finns redan)");
        await expect(sync).toContainText("1 sak förs in");
        await sync.getByRole("button", {name: "Återuppta"}).click();
        await page.getByRole("alertdialog", {name: "Synka till Spexregistret?"}).getByRole("button", {name: "Återuppta"}).click();
        await expect(run).toContainText("Klar", {timeout: 20_000});
        await expect(sync).toContainText("Allt finns redan i Spexregistret.");
        await expect(sync.getByRole("button", {name: "Starta synkning"})).toBeDisabled();

        // Anonymizing asks for the title
        const anonymize = page.getByRole("region", {name: "Anonymisering"});

        await expect(anonymize).toContainText("Deltagare och hjälpare");
        await anonymize.getByRole("button", {name: "Anonymisera"}).click();
        const dialog = page.getByRole("alertdialog", {name: "Anonymisera Ali Baba 2028?"});

        await dialog.getByLabel("Skriv ”Ali Baba 2028” för att bekräfta").fill("Ali Baba");
        await expect(dialog.getByRole("button", {name: "Anonymisera"})).toBeDisabled();
        await dialog.getByLabel("Skriv ”Ali Baba 2028” för att bekräfta").fill("ali baba 2028");
        await dialog.getByRole("button", {name: "Anonymisera"}).click();
        await expect(page.getByText("Nyuppsättningen anonymiserades", {exact: true})).toBeVisible();
        await expect(page.getByText(/^Anonymiserad \d{4}-\d{2}-\d{2}$/)).toBeVisible();
        await expect(anonymize).toContainText("Nyuppsättningen anonymiserades 20");
        await expect(page.getByRole("region", {name: "FGV-medlemskap"})).toHaveCount(0);

        await loginAs("superadmin");
        await page.goto("/revivals/manage");
        await expect(page.getByRole("row").filter({hasText: "Ali Baba"})).toContainText("Anonymiserad");
    });

    test("the super admin is warned before archiving a revival whose sync never completed", async ({
                                                                                                       page,
                                                                                                       loginAs,
                                                                                                       mock
                                                                                                   }) => {
        await mock.closing();
        await loginAs("superadmin");
        await page.goto("/revivals/1");

        await page.getByRole("combobox", {name: "Ändra status"}).selectOption("ARCHIVED");
        const warning = page.getByRole("alertdialog", {name: "Arkivera utan klar synkning?"});

        await expect(warning).toContainText("anonymiseras efter 36 månader");
        await warning.getByRole("button", {name: "Arkivera ändå"}).click();
        await expect(page.getByText("Statusen ändrades")).toBeVisible();

        await page.getByRole("link", {name: "Avslut", exact: true}).click();
        await expect(page.getByRole("region", {name: "Anonymisering"})).toContainText(/Nyuppsättningen anonymiseras automatiskt \d{4}-\d{2}-\d{2}\./);
    });

    test("an observer reads the closing page without controls, and sees no materials", async ({
                                                                                                  page,
                                                                                                  loginAs,
                                                                                                  mock
                                                                                              }) => {
        await mock.closing();
        await loginAs("observer");
        await page.goto("/revivals/1/closing");

        await expect(page.getByRole("region", {name: "Ekonomi"})).toBeVisible();
        await expect(page.getByRole("button", {name: "Skriv beslut om överskott"})).toHaveCount(0);
        await expect(page.getByRole("button", {name: "Starta synkning"})).toHaveCount(0);
        await expect(page.getByRole("button", {name: "Anonymisera"})).toHaveCount(0);
        await expect(page.getByRole("link", {name: "Material", exact: true})).toHaveCount(0);
    });
});
