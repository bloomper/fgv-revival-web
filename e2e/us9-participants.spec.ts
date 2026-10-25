import {expect, test} from "./fixtures";

test.describe("Participants: the steering group adds and invites, the participant answers on their own page", () => {
    test.beforeEach(async ({mock}) => {
        await mock.setStatus("1", "OPEN");
    });

    test("the directeur adds candidates and a pending person, invites them, marks a fee paid and sets Swish and WhatsApp",
        async ({page, loginAs, mock}) => {
            await mock.participants();
            await loginAs("directeur");
            await page.goto("/revivals/1");
            await page.getByRole("link", {name: "Deltagare", exact: true}).click();
            await expect(page.getByText("Inga deltagare än")).toBeVisible();

            await page.getByRole("button", {name: "Lägg till deltagare"}).click();
            const sheet = page.getByRole("dialog", {name: "Lägg till deltagare"});

            await expect(sheet.getByRole("checkbox", {name: "Anna \"Spexis\" Andersson"})).toBeVisible();
            await expect(sheet.getByText("Ali Baba 2008, Ali Baba 1956")).toBeVisible();
            // Deceased spexare are never candidates
            await expect(sheet.getByText("Cecilia Carlsson")).toHaveCount(0);
            await sheet.getByRole("checkbox", {name: "Anna \"Spexis\" Andersson"}).check();
            await sheet.getByRole("checkbox", {name: "Bertil Bengtsson"}).check();
            await sheet.getByRole("button", {name: "Lägg till markerade (2)"}).click();
            await expect(page.getByText("2 deltagare lades till")).toBeVisible();
            await expect(sheet.getByText("Inga fler kandidater.")).toBeVisible();

            await sheet.getByRole("tab", {name: "Ny person"}).click();
            await sheet.getByLabel("Förnamn").fill("Disa");
            await sheet.getByLabel("Efternamn").fill("Deltagare");
            await sheet.getByRole("button", {name: "Lägg till", exact: true}).click();
            await expect(sheet.getByText("En deltagare behöver en e-postadress för att bjudas in.")).toBeVisible();
            await expect(sheet.getByLabel("E-post")).toBeFocused();
            await sheet.getByLabel("E-post").fill("disa@example.org");
            await sheet.getByRole("button", {name: "Lägg till", exact: true}).click();
            await expect(page.getByText("Disa Deltagare lades till")).toBeVisible();
            await expect(sheet.getByLabel("Förnamn")).toHaveValue("");
            await page.keyboard.press("Escape");
            await expect(sheet).toBeHidden();

            const disa = page.getByRole("row").filter({hasText: "Disa Deltagare"});

            await expect(disa).toContainText("Inte i Spexregistret");
            await expect(disa).toContainText("Inte inbjuden");
            await page.getByRole("button", {name: "Bjud in alla ej inbjudna (3)"}).click();

            const invite = page.getByRole("dialog", {name: "Bjud in deltagare"});

            await expect(invite).toContainText("3 personer bjuds in.");
            await invite.getByRole("button", {name: "Skicka"}).click();
            await expect(invite).toContainText("2 personer bjöds in.");
            await expect(invite).toContainText("Bertil Bengtsson: saknar e-postadress");
            await invite.getByRole("button", {name: "Stäng"}).click();

            // Disa's address is an FGV account with access, so her role is claimed at once
            await expect(disa).toContainText("Inloggad");
            await expect(page.getByRole("row").filter({hasText: "Anna"})).toContainText("Inbjuden");
            await expect(page.getByRole("row").filter({hasText: "Bertil"})).toContainText("Inte inbjuden");

            const anna = page.getByRole("row").filter({hasText: "Anna"});

            await expect(anna).toContainText("800 kr");
            await expect(anna.getByRole("link", {name: "Skriv till Anna \"Spexis\" Andersson på WhatsApp"})).toHaveAttribute("href", "https://wa.me/46701112233");
            await anna.getByRole("switch", {name: "Spexpengar betalda: Anna \"Spexis\" Andersson"}).click();
            await expect(page.getByText("Markerad som betald")).toBeVisible();
            await expect(anna.getByRole("switch", {name: "Spexpengar betalda: Anna \"Spexis\" Andersson"})).toBeChecked();

            await page.getByRole("button", {name: "Inställningar"}).click();
            const settings = page.getByRole("dialog", {name: "Inställningar för deltagare"});

            await settings.getByLabel("Swishnummer").fill("123 456 78 9");
            await settings.getByLabel("Länk till WhatsApp-gruppen").fill("https://example.org/grupp");
            await settings.getByRole("button", {name: "Spara"}).click();
            await expect(settings.getByText("Ange tio siffror, t.ex. 123 456 78 90.")).toBeVisible();
            await expect(settings.getByText("Länken ska börja med https://chat.whatsapp.com/.")).toBeVisible();
            await settings.getByLabel("Swishnummer").fill("123 456 78 90");
            await settings.getByLabel("Länk till WhatsApp-gruppen").fill("https://chat.whatsapp.com/NyGrupp");
            await settings.getByRole("button", {name: "Spara"}).click();
            await expect(settings).toBeHidden();
            await page.getByRole("button", {name: "Inställningar"}).click();
            await expect(settings.getByLabel("Swishnummer")).toHaveValue("1234567890");
        });

    test("the directeur turns a participant's suggestion into a pending person", async ({page, loginAs, mock}) => {
        await mock.participants({people: true});
        await loginAs("directeur");
        await page.goto("/revivals/1/participants");

        const referrals = page.getByRole("region", {name: "Tips från deltagarna"});

        await expect(referrals).toContainText("Gustav Gren");
        await expect(referrals).toContainText("Spelade fiol 2008.");
        await referrals.getByRole("button", {name: "Lägg till Gustav Gren som ny person"}).click();
        await expect(page.getByRole("row").filter({hasText: "Gustav Gren"})).toContainText("gustav@example.org");
        await expect(referrals).toHaveCount(0);
    });

    test("the participant is routed to their page, answers yes with the terms and consent, gives dietary needs and sees how to pay",
        async ({page, loginAs, mock}) => {
            await mock.participants({people: true});
            // The participant's page is made for a phone
            await page.setViewportSize({width: 390, height: 844});
            await loginAs("deltagare");

            await page.getByRole("link", {name: /Din medverkan: Ali Baba 2028/}).click();
            await expect(page).toHaveURL(/\/revivals\/1\/me$/);
            await page.goto("/revivals");
            await page.getByRole("link", {name: /Ali Baba 2028/}).click();
            await expect(page).toHaveURL(/\/revivals\/1\/me$/);
            await page.goto("/revivals/1");
            await expect(page).toHaveURL(/\/revivals\/1\/me$/);
            await expect(page.getByRole("heading", {level: 2, name: "Ali Baba 2028"})).toBeVisible();
            await expect(page.getByRole("navigation", {name: "Nyuppsättningens delar"})).toHaveCount(0);

            const response = page.getByRole("region", {name: "Ditt svar"});

            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
            expect((await response.getByRole("button", {name: "Skicka svar"}).boundingBox())!.height).toBeGreaterThanOrEqual(44);
            expect((await response.locator("label").filter({hasText: "Ja, jag är med"}).boundingBox())!.height).toBeGreaterThanOrEqual(44);

            await expect(response).toContainText("Deltagaravgiften är 800 kr.");
            await expect(response).toContainText("Repetitioner varje söndag.");
            await response.getByRole("radio", {name: "Ja, jag är med"}).check();
            await response.getByRole("button", {name: "Skicka svar"}).click();
            await expect(response.getByText("Godkänn villkoren för att svara ja.")).toBeVisible();
            await expect(response.getByText("Välj om Spexregistret får spara dina uppgifter.")).toBeVisible();
            await expect(response.getByRole("checkbox", {name: "Jag godkänner villkoren"})).toBeFocused();
            await response.getByRole("checkbox", {name: "Jag godkänner villkoren"}).check();
            await response.getByRole("radio", {name: "Ja, det får det"}).check();
            await response.getByLabel("Önskad befattning").selectOption({label: "Orkester"});
            await response.getByRole("button", {name: "Skicka svar"}).click();
            await expect(page.getByText("Ditt svar är sparat")).toBeVisible();
            await expect(response).toContainText("Du svarade Ja");

            await expect(page.getByRole("region", {name: "WhatsApp-gruppen"}).getByRole("link", {name: "Gå med i gruppen"}))
                .toHaveAttribute("href", "https://chat.whatsapp.com/E2eGrupp");

            const contact = page.getByRole("region", {name: "Kontaktuppgifter"});

            await expect(contact.getByLabel("E-post")).toHaveValue("disa@example.org");
            await contact.getByLabel("Mobiltelefon").fill("070-555 66 77");
            await contact.getByRole("button", {name: "Spara kontaktuppgifter"}).click();
            await expect(page.getByText("Kontaktuppgifterna är sparade")).toBeVisible();

            const dietary = page.getByRole("region", {name: "Kost och allergier"});

            await dietary.getByLabel("Specialkost och allergier").fill("Laktosintolerant");
            await dietary.getByRole("button", {name: "Spara"}).click();
            await expect(page.getByText("Kostuppgifterna är sparade")).toBeVisible();

            const fee = page.getByRole("region", {name: "Spexpengar"});

            await expect(fee).toContainText("800 kr");
            await expect(fee).toContainText("Inte betald");
            await expect(fee).toContainText("1234567890");
            await expect(fee).toContainText("Ali Baba 2028 Disa Deltagare");
            await expect(fee.getByRole("button", {name: "Kopiera Swishnummer"})).toBeVisible();
            const qr = fee.getByRole("img", {name: "QR-kod för att swisha 800 kr"});

            await expect(qr).toBeVisible();
            const svg = await page.request.get((await qr.getAttribute("src"))!);

            expect(svg.status()).toBe(200);
            expect(svg.headers()["content-type"]).toContain("image/svg+xml");
            expect(svg.headers()["content-security-policy"]).toContain("sandbox");

            const steering = page.getByRole("region", {name: "Direktionen"});

            await expect(steering).toContainText("Dana Directeur");
            await expect(steering).toContainText("Stina Styrgrupp");

            const referral = page.getByRole("region", {name: "Känner du någon vi har missat?"});

            await referral.getByRole("button", {name: "Skicka tips"}).click();
            await expect(referral.getByText("Skriv ett namn.")).toBeVisible();
            await referral.getByLabel("Namn").fill("Hilda Holm");
            await referral.getByLabel("E-post eller telefon").fill("hilda@example.org");
            await referral.getByRole("button", {name: "Skicka tips"}).click();
            await expect(page.getByText("Tack! Tipset är skickat till direktionen.")).toBeVisible();
            await expect(referral.getByLabel("Namn")).toHaveValue("");

            await expect(page.getByRole("region", {name: "Kalender"}).getByRole("button", {name: "Kalenderlänk"})).toBeVisible();
        });

    test("the directeur gives a participant an own fee, finds it again, goes back to the revival's, and keeps a pending person's email",
        async ({page, loginAs, mock}) => {
            await mock.participants({people: true});
            await loginAs("directeur");
            await page.goto("/revivals/1/participants");

            const anna = page.getByRole("row").filter({hasText: "Anna"});
            const edit = async (name: string) => {
                await page.getByRole("button", {name: `Åtgärder för ${name}`}).click();
                await page.getByRole("menuitem", {name: "Redigera"}).click();
                return page.getByRole("dialog", {name: `Redigera ${name}`});
            };
            let dialog = await edit("Anna \"Spexis\" Andersson");

            await expect(dialog.getByRole("checkbox", {name: "Använd nyuppsättningens avgift"})).toBeChecked();
            await expect(dialog.getByLabel("Egen avgift")).toBeDisabled();
            await dialog.getByRole("checkbox", {name: "Använd nyuppsättningens avgift"}).uncheck();
            await dialog.getByLabel("Egen avgift").fill("500");
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog).toBeHidden();
            await expect(anna).toContainText("500 kr");

            dialog = await edit("Anna \"Spexis\" Andersson");
            await expect(dialog.getByLabel("Egen avgift")).toHaveValue("500");
            await dialog.getByRole("checkbox", {name: "Använd nyuppsättningens avgift"}).check();
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog).toBeHidden();
            await expect(anna).toContainText("800 kr");

            dialog = await edit("Disa Deltagare");
            await dialog.getByLabel("E-post").fill("");
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog.getByText("En deltagare behöver en e-postadress för att bjudas in.")).toBeVisible();
            await dialog.getByLabel("E-post").fill("disa.d@example.org");
            await dialog.getByRole("button", {name: "Spara"}).click();
            await expect(dialog).toBeHidden();
            await expect(page.getByRole("row").filter({hasText: "Disa Deltagare"})).toContainText("disa.d@example.org");
        });

    test("the steering group's own pages stay closed to the participant", async ({page, loginAs, mock}) => {
        await mock.participants({people: true});
        await loginAs("deltagare");
        await page.goto("/");
        await expect(page.getByRole("link", {name: /Din medverkan/})).toBeVisible();
        // Neither the home page nor the sidebar offers the guide, which participants do not read
        await expect(page.getByRole("link", {name: /Guiden/})).toHaveCount(0);
        await page.goto("/revivals/1/participants");
        await expect(page.getByRole("heading", {name: "Sidan finns inte"})).toBeVisible();
    });

    test("an observer reads the revival but not its participants", async ({page, loginAs, mock}) => {
        await mock.participants({people: true});
        await loginAs("observer");
        await page.goto("/revivals/1");
        await expect(page.getByRole("heading", {level: 2, name: "Ali Baba 2028"})).toBeVisible();
        await expect(page.getByRole("navigation", {name: "Nyuppsättningens delar"})).toBeVisible();
        await expect(page.getByRole("link", {name: "Deltagare", exact: true})).toHaveCount(0);
        await page.goto("/revivals/1/participants");
        await expect(page.getByRole("heading", {name: "Sidan finns inte"})).toBeVisible();
    });
});
