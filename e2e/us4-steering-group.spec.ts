import {expect, openRevival, test} from "./fixtures";

test.describe("User story 4: the directeur builds the steering group", () => {
    test("adds a member with FINANCE, shown as waiting for access", async ({page, loginAs}) => {
        await loginAs("directeur");
        await page.goto("/");
        await openRevival(page, "Ali Baba 2028");

        const form = page.locator("form").filter({has: page.getByRole("button", {name: "Lägg till i styrgruppen"})});

        await form.getByRole("textbox").fill("ny.medlem@example.org");
        await form.getByRole("checkbox", {name: "Ekonomi"}).click();
        await form.getByRole("button", {name: "Lägg till i styrgruppen"}).click();

        await expect(page.getByText("ny.medlem@example.org")).toBeVisible();
        await expect(page.getByText("Väntar på åtkomst")).toBeVisible();
    });

    test("the member sees the revival only while organising, open or closing, and read-only", async ({page, loginAs, mock}) => {
        await loginAs("styrgrupp");
        await page.goto("/");
        await expect(page.getByText("Ali Baba 2028")).toHaveCount(0);

        await mock.setStatus("1", "ORGANISING");
        await page.goto("/");
        await openRevival(page, "Ali Baba 2028");
        await expect(page.getByText("Dana Directeur")).toBeVisible();
        await expect(page.getByRole("button", {name: "Redigera uppgifter"})).toHaveCount(0);
        await expect(page.getByRole("button", {name: "Lägg till i styrgruppen"})).toHaveCount(0);
        await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);

        await mock.setStatus("1", "SETTLING");
        await page.goto("/");
        await expect(page.getByText("Ali Baba 2028")).toHaveCount(0);
    });
});
