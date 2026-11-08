import type {Page} from "@playwright/test";
import {expect, test} from "./fixtures";
import {ALI_BABA_2028} from "./constants";

/** Small and common phones, and a tablet. */
const SCREENS = [
    {width: 360, height: 740},
    {width: 390, height: 844},
    {width: 768, height: 1024},
];

const SECTIONS = ["", "/members", "/log", "/checklists", "/events", "/budget", "/budget/transactions", "/closing",
    "/guide", "/meetings", "/participants", "/staffing", "/mailings", "/materials"];
const ADMIN_PAGES = ["/", "/revivals", "/revivals/manage", "/library", "/guide", "/guide/changes", "/admin/guide",
    "/admin/guide/draft", "/admin/guide/suggestions", "/admin/settings", "/admin/news", "/admin/event-types",
    "/admin/capabilities", "/admin/checklist-templates", "/admin/mailing-templates", "/admin/budget-categories",
    "/admin/reference-figures", "/admin/spex-calendar", "/admin/maintenance", "/about", "/support"];

/**
 * The page does not scroll sideways; tables may scroll inside their frame.
 */
async function fits(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("heading", {level: 1}).first().waitFor({state: "attached"});

    // Charts and tables may be laid out at a default size before they measure their frame, so give them a moment
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
        {message: `${path} scrolls sideways`}).toBeLessThanOrEqual(0);
}

/**
 * The application's name is shown in full, and every control in the header lies inside the screen, clear of the
 * others.
 */
async function headerFits(page: Page) {
    const header = page.getByRole("banner");
    const title = header.getByText("Nyuppsättning", {exact: true});

    await expect(title).toBeVisible();
    expect(await title.evaluate(element => element.scrollWidth - element.clientWidth), "the title is cut short")
        .toBeLessThanOrEqual(0);

    const boxes = await header.locator("button:visible, a:visible, input:visible").evaluateAll(elements => elements
        .filter(element => !elements.some(other => other !== element && other.contains(element)))
        .map(element => ({name: element.getAttribute("aria-label") ?? element.textContent ?? "", ...element.getBoundingClientRect().toJSON()})));
    const width = await page.evaluate(() => document.documentElement.clientWidth);

    expect(boxes.length).toBeGreaterThan(2);
    boxes.forEach((box, index) => {
        expect(box.left, `${box.name} starts off screen`).toBeGreaterThanOrEqual(0);
        expect(box.right, `${box.name} ends off screen`).toBeLessThanOrEqual(width);
        boxes.slice(index + 1).forEach(other => {
            const overlaps = box.left < other.right - 1 && other.left < box.right - 1
                && box.top < other.bottom - 1 && other.top < box.bottom - 1;

            expect(overlaps, `${box.name} overlaps ${other.name}`).toBe(false);
        });
    });
}

for (const screen of SCREENS) {
    test.describe(`${screen.width} × ${screen.height}: no page scrolls sideways`, () => {
        test.beforeEach(async ({page, mock}) => {
            await mock.guide("published");
            await mock.budget();
            await page.setViewportSize(screen);
        });

        test("the revival's sections fit the screen, and the tables scroll inside it", async ({page, loginAs}) => {
            test.setTimeout(120_000);
            await loginAs("directeur");

            for (const section of SECTIONS) {
                await fits(page, `/revivals/${ALI_BABA_2028}${section}`);
            }
        });

        test("the start, guide and admin pages fit the screen, and so does the header", async ({page, loginAs}) => {
            test.setTimeout(120_000);
            await loginAs("superadmin");

            for (const path of ADMIN_PAGES) {
                await fits(page, path);
            }
            await page.goto("/");
            await headerFits(page);
            if (screen.width < 768) {
                // On phones the menu is a sheet over the page
                await page.getByRole("button", {name: "Visa menyn"}).click();
                await expect(page.getByRole("link", {name: "Nyuppsättningar", exact: true})).toBeVisible();
            }
        });
    });
}
