import {expect, test} from "./fixtures";

const today = () => new Date().toISOString().slice(0, 10);

test.describe("News on the start page, kept under Administration, with its history", () => {
    test("the super admin publishes a draft, everyone reads it on the start page, and the history shows the change", async ({
                                                                                                                              page,
                                                                                                                              loginAs
                                                                                                                          }) => {
        await loginAs("superadmin");
        await page.goto("/admin/news");
        await expect(page.getByRole("heading", {level: 2, name: "Nyheter"})).toBeVisible();

        await page.getByRole("button", {name: "Ny nyhet"}).click();
        const dialog = page.getByRole("dialog");

        await dialog.getByRole("textbox", {name: "Rubrik"}).fill("Träff för directeurer");
        await dialog.getByRole("textbox", {name: "Text"}).fill("Vi ses i juni.\nMer info: https://fgv.example.org");
        await dialog.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("row").filter({hasText: "Träff för directeurer"})).toContainText("Utkast");

        // A draft is not on the start page
        await loginAs("styrgrupp");
        await page.goto("/");
        await expect(page.getByText("Inga nyheter just nu.")).toBeVisible();

        await loginAs("superadmin");
        await page.goto("/admin/news");
        await page.getByRole("row").filter({hasText: "Träff för directeurer"}).click();
        await page.getByRole("dialog").getByRole("textbox", {name: "Visas från"}).fill(today());
        await page.getByRole("dialog").getByRole("button", {name: "Spara"}).click();
        await expect(page.getByRole("row").filter({hasText: "Träff för directeurer"})).toContainText("Publicerad");

        await page.getByRole("button", {name: "Meny för Träff för directeurer"}).click();
        await page.getByRole("menuitem", {name: "Historik"}).click();
        const history = page.getByRole("dialog", {name: "Historik: Träff för directeurer"});
        const revisions = history.getByRole("list", {name: "Historik"}).getByRole("listitem");

        await expect(revisions).toHaveCount(2);
        await expect(revisions.first()).toContainText("Ändrad");
        await expect(revisions.first()).toContainText("Sara Admin");
        await expect(revisions.first()).toContainText(`Visas frånFöre: (tomt)Efter: ${today()}`);
        await expect(revisions.last()).toContainText("Skapad");
        await page.keyboard.press("Escape");

        await loginAs("styrgrupp");
        await page.goto("/");
        await page.getByRole("button", {name: /Träff för directeurer/}).click();
        await expect(page.getByRole("dialog", {name: "Träff för directeurer"}).getByRole("link", {name: "https://fgv.example.org"}))
            .toHaveAttribute("rel", "noopener noreferrer");
    });

    test("news is administered only by the super admin", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/admin/news");
        await expect(page.getByRole("heading", {level: 2, name: "Nyheter"})).toHaveCount(0);
    });
});
