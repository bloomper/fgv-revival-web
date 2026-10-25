import {expect, openRevival, test} from "./fixtures";

test("the observer sees every revival and no edit controls", async ({page, loginAs}) => {
    await loginAs("observer");
    await page.goto("/revivals/manage");

    for (const title of ["Ali Baba 2028", "Nobel 2030", "Snorre 2027"]) {
        await expect(page.getByRole("row", {name: new RegExp(title)})).toBeVisible();
    }
    await expect(page.getByRole("button", {name: "Ny nyuppsättning"})).toHaveCount(0);
    await expect(page.getByRole("combobox", {name: "Ändra status"})).toHaveCount(0);

    await openRevival(page, "Ali Baba 2028");
    await expect(page.getByText("Stina Styrgrupp")).toBeVisible();
    await expect(page.getByRole("button", {name: "Redigera uppgifter"})).toHaveCount(0);
    await expect(page.getByText("stina@example.org")).toHaveCount(0);

    await page.getByRole("link", {name: "Direktion", exact: true}).click();
    await expect(page.getByRole("row").filter({hasText: "Stina Styrgrupp"})).toBeVisible();
    await expect(page.getByRole("button", {name: /Utse directeur|Lägg till i direktionen|Åtgärder för/})).toHaveCount(0);
    await expect(page.getByText("stina@example.org")).toHaveCount(0);
});
