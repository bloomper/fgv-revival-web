import {expect, test} from "./fixtures";

test.describe("Guide: a steering group member reads the guide for their revival", () => {
    test.beforeEach(async ({mock, loginAs}) => {
        await mock.guide("published");
        await mock.setStatus("1", "ORGANISING");
        await loginAs("styrgrupp");
    });

    test("reads the pinned version chapter by chapter and finds an item by search", async ({page}) => {
        await page.goto("/revivals/1");
        await page.getByRole("navigation", {name: "Nyuppsättningens delar"}).getByRole("link", {name: "Guiden"}).click();

        await expect(page.getByText(/Nyuppsättningen följer v1/)).toBeVisible();
        await page.getByRole("link", {name: "Öppna guiden"}).click();
        const chapters = page.getByRole("navigation", {name: "Kapitel", exact: true});

        await expect(chapters.getByRole("link")).toHaveCount(10);
        await chapters.getByRole("link", {name: /Först: godkännande och tajmning/}).click();

        await expect(page.getByRole("heading", {name: "1. Först: godkännande och tajmning"})).toBeVisible();
        await expect(page.getByText("Krav").first()).toBeVisible();
        const list = page.getByRole("navigation", {name: "Kapitel", exact: true});

        await list.evaluate(element => element.setAttribute("data-kept", ""));
        await page.getByRole("link", {name: /Nästa kapitel/}).click();
        await expect(page.getByRole("heading", {name: "2. Boka lokaler och lägg fast er tidslinje"})).toBeVisible();
        await expect(page).toHaveURL(/\/revivals\/1\/guide\/B$/);
        await expect(list, "the chapter list stays while the chapter beside it loads").toHaveAttribute("data-kept", "");

        await page.getByRole("searchbox", {name: "Sök i guiden"}).fill("lån");
        const hit = page.getByRole("list", {name: "Sökträffar"}).getByRole("link", {name: /lån/});

        await expect(hit).toBeVisible();
        await hit.click();
        await expect(page).toHaveURL(/\/revivals\/1\/guide\/J#item-/);
        await expect(page.getByRole("heading", {name: "10. Stänga nyuppsättningen"})).toBeVisible();
        await expect(page.getByRole("list", {name: "Sökträffar"})).toHaveCount(0);
    });

    test("on a phone, finds the chapters in a bar that opens a list", async ({page}) => {
        await page.setViewportSize({width: 390, height: 844});
        await page.goto("/revivals/1/guide/B");

        const bar = page.getByRole("button", {name: /2\/10 · Boka lokaler/});

        await expect(bar).toBeVisible();
        await bar.click();
        await page.getByRole("dialog").getByRole("link", {name: /Sätt budgeten/}).click();

        await expect(page).toHaveURL(/\/revivals\/1\/guide\/C$/);
        await expect(page.getByRole("button", {name: /3\/10 · Sätt budgeten/})).toBeVisible();
        await expect(page.getByRole("link", {name: /Föregående kapitel/})).toBeVisible();
    });

    test("shows English text where there is one, and Swedish marked as not translated", async ({page}) => {
        await page.goto("/guide/A");
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

    await expect(page.getByText(/Guiden visas för direktioner/)).toBeVisible();
    await expect(page.getByRole("region", {name: "Kapitel"})).toHaveCount(0);
});

test("before the first publication the revival's guide says so", async ({page, mock, loginAs}) => {
    await mock.guide("none");
    await loginAs("directeur");
    await page.goto("/revivals/1/guide");

    await expect(page.getByText("Guiden är inte publicerad än.")).toBeVisible();
});
