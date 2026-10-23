import {expect, openRevival, test} from "./fixtures";

test.describe("User story 4: the directeur builds the steering group", () => {
    test("adds a member with FINANCE, shown as waiting for access", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/revivals");
        await openRevival(page, "Ali Baba 2028");
        await page.getByRole("link", {name: "Styrgrupp", exact: true}).click();
        await page.getByRole("button", {name: "Lägg till i styrgruppen"}).click();

        const form = page.getByRole("dialog");
        const search = form.getByRole("combobox", {name: /^Lägg till i styrgruppen/});

        await search.fill("ny.medlem@example.org");
        await expect(form.getByText(/Inget FGV-konto använder ny.medlem@example.org/)).toBeVisible();
        await form.getByLabel("Förnamn").fill("Nora");
        await form.getByRole("checkbox", {name: "Ekonomi"}).click();
        await form.getByRole("button", {name: "Bjud in"}).click();

        await expect(form.getByRole("list", {name: "Tillagda (1)"})).toContainText("Nora");
        await expect(search).toBeFocused();
        await form.getByRole("button", {name: "Klar"}).click();
        await expect(page.getByText("ny.medlem@example.org").first()).toBeVisible();
        await expect(page.getByText("Väntar på åtkomst")).toBeVisible();
        await expect(page.getByText(/inbjuden \d{4}-\d{2}-\d{2}/)).toBeVisible();
    });

    test("picks an FGV account by name", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/revivals");
        await openRevival(page, "Ali Baba 2028");
        await page.getByRole("link", {name: "Styrgrupp", exact: true}).click();
        await page.getByRole("button", {name: "Lägg till i styrgruppen"}).click();

        const dialog = page.getByRole("dialog");

        await dialog.getByRole("combobox", {name: /^Lägg till i styrgruppen/}).fill("Olle");
        await dialog.getByRole("option").filter({hasText: "Olle Observatör"}).getByRole("button").click();
        await dialog.getByRole("button", {name: "Lägg till i styrgruppen"}).click();
        await expect(dialog.getByRole("list", {name: "Tillagda (1)"})).toContainText("Olle Observatör");
        await dialog.getByRole("button", {name: "Klar"}).click();

        await expect(page.getByRole("row").filter({hasText: "Olle Observatör"})).toBeVisible();
    });

    test("the member sees the revival only while organising, open or closing, and read-only", async ({page, loginAs, mock}) => {
        await loginAs("styrgrupp");
        await page.goto("/revivals");
        await expect(page.getByText("Ali Baba 2028")).toHaveCount(0);

        await mock.setStatus("1", "ORGANISING");
        await page.goto("/revivals");
        await openRevival(page, "Ali Baba 2028");
        await expect(page.getByText("Dana Directeur")).toBeVisible();
        await expect(page.getByRole("button", {name: "Redigera uppgifter"})).toHaveCount(0);
        await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);
        await page.getByRole("link", {name: "Styrgrupp", exact: true}).click();
        await expect(page.getByRole("row").filter({hasText: "Dana Directeur"})).toBeVisible();
        await expect(page.getByRole("button", {name: "Lägg till i styrgruppen"})).toHaveCount(0);

        await mock.setStatus("1", "SETTLING");
        await page.goto("/revivals");
        await expect(page.getByText("Ali Baba 2028")).toHaveCount(0);
    });
});
