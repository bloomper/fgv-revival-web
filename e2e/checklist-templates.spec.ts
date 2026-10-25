import {expect, test} from "./fixtures";

test.describe("Decision log: checklist templates and event checklists", () => {
    test("a super admin builds an event template with relative deadlines", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/checklist-templates");
        await expect(page.getByRole("heading", {level: 2, name: "Checklistmallar"})).toBeVisible();

        await page.getByRole("button", {name: "Ny händelsemall"}).click();
        await page.getByRole("dialog").getByLabel("Namn (svenska)").fill("Rephelg");
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("heading", {level: 3, name: "Rephelg"})).toBeVisible();

        await page.getByRole("button", {name: "Ny punkt"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Text (svenska)").fill("Utskick");
        await dialog.getByLabel("Typ av deadline").selectOption({label: "Veckodag veckan innan"});
        await expect(dialog.getByText(/Till exempel för lördag .*: måndag/)).toBeVisible();
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();

        await page.getByRole("button", {name: "Ny punkt"}).click();
        await dialog.getByLabel("Text (svenska)").fill("Lokaler bokade");
        await dialog.getByLabel("Typ av deadline").selectOption({label: "Dagar"});
        await dialog.getByLabel("Antal").fill("14");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();

        const items = page.getByRole("list", {name: "Punkter"});

        await expect(items.getByText("måndag veckan innan")).toBeVisible();
        await expect(items.getByText("14 dagar före")).toBeVisible();
        await page.getByRole("button", {name: "Flytta upp Lokaler bokade"}).click();
        await expect(items.getByRole("listitem").first()).toContainText("Lokaler bokade");
    });

    test("the steering group makes a rehearsal weekend checklist, moves its date and adds from the chapter template", async ({
                                                                                                                                 page,
                                                                                                                                 mock,
                                                                                                                                 loginAs
                                                                                                                             }) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await mock.templates();
        await loginAs("styrgrupp");

        await page.goto("/revivals/1/checklists");
        await page.getByRole("button", {name: "Ny händelse-checklista"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByLabel("Namn").fill("Rephelg 2");
        await dialog.getByLabel("Datum", {exact: true}).fill("2027-11-20");
        await dialog.getByLabel("Mall").selectOption({label: "Rephelg"});
        await dialog.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByRole("heading", {level: 3, name: /Rephelg 2/})).toBeVisible();
        // Not the revival's "Utskick" tab, which is a list item too
        const row = (text: string) => page.getByRole("listitem").filter({hasText: text}).filter({hasNotText: /^Utskick$/});

        await expect(row("Utskick")).toContainText("Klart senast: 2027-11-08");
        await expect(row("Lokaler bokade")).toContainText("Klart senast: 2027-11-06");
        await expect(row("Allergier insamlade")).toContainText("Klart senast: 2027-11-15");
        await expect(row("Allergier insamlade")).toContainText("Stina Styrgrupp");
        await expect(row("Fika")).not.toContainText("Klart senast");

        await row("Fika").getByRole("button", {name: "Ändra punkt"}).click();
        await dialog.getByLabel("Klart senast").fill("2027-11-01");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();

        await page.getByRole("button", {name: "Ändra namn och datum"}).click();
        await dialog.getByLabel("Datum", {exact: true}).fill("2027-11-27");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(dialog).toBeHidden();
        await expect(row("Utskick")).toContainText("Klart senast: 2027-11-15");
        await expect(row("Lokaler bokade")).toContainText("Klart senast: 2027-11-13");
        await expect(row("Fika")).toContainText("Klart senast: 2027-11-01");

        await page.goto("/revivals/1/checklists");
        await page.getByRole("link", {name: /Boka lokaler/}).click();
        await page.getByRole("button", {name: "Lägg till punkter från mall"}).click();
        await expect(row("Boka kalaslokal")).toHaveCount(1);
        await page.getByRole("button", {name: "Lägg till punkter från mall"}).click();
        await expect(page.getByText("Punkterna från mallen är tillagda").first()).toBeVisible();
        await expect(row("Boka kalaslokal")).toHaveCount(1);

        await page.goto("/revivals/1/checklists");
        await page.getByRole("link", {name: /Rephelg 2/}).click();
        await page.getByRole("link", {name: "Från mallen Rephelg"}).click();
        await expect(page.getByRole("heading", {level: 2, name: "Rephelg"})).toBeVisible();
        await expect(page.getByRole("list", {name: "Punkter"}).getByText("Utskick")).toBeVisible();
        await expect(page.getByRole("button", {name: "Ny punkt"})).toHaveCount(0);

        await page.goBack();
        await page.getByRole("button", {name: "Stryk checklistan"}).click();
        await expect(page.getByText("Checklistan är struken").first()).toBeVisible();
        await page.goto("/revivals/1/checklists");
        const events = page.getByRole("region", {name: "Händelser"});

        await expect(events.getByText("Rephelg 2")).toHaveCount(0);
        await events.getByRole("switch", {name: "Visa strukna"}).click();
        await expect(page.getByRole("region", {name: "Händelser"}).getByRole("listitem").filter({hasText: "Rephelg 2"})).toContainText("Struken");
    });

    test("a super admin moves between templates in the list beside the editor", async ({page, mock, loginAs}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await mock.templates();
        await loginAs("superadmin");
        await page.goto("/admin/checklist-templates");

        const nav = page.getByRole("navigation", {name: "Checklistmallar"});
        const chapters = nav.getByRole("region", {name: "Guidens kapitel"});

        await chapters.getByRole("link", {name: /1 punkt/}).click();
        await expect(page.getByRole("heading", {level: 3, name: /^Mall för/})).toBeVisible();
        await expect(page.getByRole("list", {name: "Punkter"}).getByText("Boka kalaslokal")).toBeVisible();
        await expect(chapters.locator("[aria-current=page]")).toContainText("1 punkt");

        await nav.evaluate(element => element.setAttribute("data-kept", ""));
        await nav.getByRole("region", {name: "Händelser"}).getByRole("link", {name: /Rephelg/}).click();
        await expect(page.getByRole("heading", {level: 3, name: "Rephelg"})).toBeVisible();
        await expect(nav, "the list stays while the template beside it loads").toHaveAttribute("data-kept", "");
        await expect(page.getByLabel("Namn (svenska)")).toHaveValue("Rephelg");
        await expect(page.getByRole("list", {name: "Punkter"}).getByText("Utskick")).toBeVisible();

        await chapters.getByRole("button", {name: /Skapa mall/}).first().click();
        await expect(page.getByText("Mallen har inga punkter.")).toBeVisible();
        await expect(chapters.locator("[aria-current=page]")).toContainText("0 punkter");
    });

    test("a super admin sees retired items and restores them and the template", async ({page, mock, loginAs}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await mock.templates();
        await loginAs("superadmin");
        await page.goto("/admin/checklist-templates");
        await page.getByRole("navigation", {name: "Checklistmallar"}).getByRole("link", {name: /Rephelg/}).click();

        const items = page.getByRole("list", {name: "Punkter"});
        const retired = page.getByRole("region", {name: "Avvecklade punkter"});

        await page.getByRole("button", {name: "Avveckla Utskick"}).click();
        await expect(items.getByText("Utskick")).toHaveCount(0);
        await expect(retired).toHaveCount(0);

        await page.getByRole("switch", {name: "Visa avvecklade"}).click();
        await expect(retired.getByText("Utskick")).toBeVisible();
        await retired.getByRole("button", {name: "Återställ Utskick"}).click();
        await expect(page.getByText("Punkten är återställd").first()).toBeVisible();
        await expect(items.getByRole("listitem").last()).toContainText("Utskick");
        await expect(retired).toHaveCount(0);

        await page.getByRole("button", {name: "Avveckla mallen"}).click();
        await expect(page.getByRole("heading", {level: 3, name: /Rephelg/})).toContainText("Avvecklad");
        await expect(page.getByRole("button", {name: "Ny punkt"})).toHaveCount(0);
        await page.getByRole("button", {name: "Återställ mallen"}).click();
        await expect(page.getByText("Mallen är återställd").first()).toBeVisible();
        await expect(page.getByRole("button", {name: "Ny punkt"})).toBeVisible();
    });

    test("the steering group cannot reach the template admin", async ({page, loginAs}) => {
        await loginAs("styrgrupp");
        await page.goto("/admin/checklist-templates");

        await expect(page).toHaveURL(/\/admin\//);
        await expect(page.getByRole("heading", {name: "Du har inte behörighet"})).toBeVisible();
    });
});
