import {expect, test} from "./fixtures";

test.describe("Guide, user story 2: a steering group member reads the guide for their revival", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await loginAs("styrgrupp");
    });

    test("reads the pinned version chapter by chapter and finds an item by search", async ({page}) => {
        await page.goto("/revivals/1");
        await page.getByRole("link", {name: "Guiden v1"}).click();

        await expect(page.getByRole("heading", {level: 2, name: "Guiden v1"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "A. Först: godkännande och tajmning"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "J. Stänga nyuppsättningen"})).toBeVisible();
        await expect(page.getByText("Krav").first()).toBeVisible();

        await page.getByRole("searchbox", {name: "Sök i guiden"}).fill("sprit");
        const hit = page.getByRole("list", {name: "Sökträffar"}).getByRole("link", {name: /sprittillstånd/});

        await expect(hit).toBeVisible();
        await hit.click();
        await expect(page).toHaveURL(/#item-/);
    });

    test("shows English text where there is one, and Swedish marked as not translated", async ({page}) => {
        await page.goto("/guide");
        await page.getByRole("button", {name: "Byt språk"}).click();
        await page.getByRole("menuitem", {name: "English"}).click();

        await expect(page.getByText("The revival must be approved by JK and FGV.")).toBeVisible();
        await expect(page.getByText("Not translated").first()).toBeVisible();
    });
});

test("a steering group member whose revival is not visible is refused the guide", async ({page, mock, loginAs}) => {
    await mock.guide("published");
    await loginAs("styrgrupp");
    await page.goto("/guide");

    await expect(page.getByText(/Guiden visas för styrgrupper/)).toBeVisible();
    await expect(page.getByRole("heading", {name: /^A\./})).toHaveCount(0);
});

test("before the first publication the revival's guide says so", async ({page, mock, loginAs}) => {
    await mock.guide("none");
    await loginAs("directeur");
    await page.goto("/revivals/1/guide");

    await expect(page.getByText("Guiden är inte publicerad än.")).toBeVisible();
});
