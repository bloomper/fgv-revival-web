import {expect, test} from "./fixtures";

const WIDTH = 375;

test.describe("Phone width: no page scrolls sideways", () => {
    test.beforeEach(async ({page, mock}) => {
        await mock.guide("published");
        await mock.budget();
        await page.setViewportSize({width: WIDTH, height: 812});
    });

    test("the revival's sections fit the screen, and the tables scroll inside it", async ({page, loginAs}) => {
        await loginAs("directeur");

        for (const section of ["", "/members", "/log", "/checklists", "/events", "/budget", "/budget/transactions", "/closing"]) {
            await page.goto(`/revivals/1${section}`);
            await page.getByRole("navigation", {name: "Nyuppsättningens delar"}).waitFor();
            expect(await page.evaluate(() => document.documentElement.scrollWidth), section || "/").toBeLessThanOrEqual(WIDTH);
        }
    });
});
