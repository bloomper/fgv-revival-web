import {expect, test} from "./fixtures";

const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

test("everyone sees the revivals coming up on the start page, not those only approved", async ({page, mock, loginAs}) => {
    await mock.premiere("1", inDays(60));
    await loginAs("deltagare");
    await page.goto("/");
    const upcoming = page.getByRole("list", {name: "Kommande nyuppsättningar"}).getByRole("listitem");

    // Ali Baba is only approved, so it is not announced yet; Snorre is open
    await expect(upcoming).toHaveCount(1);
    await expect(upcoming.first()).toContainText("Snorre 2027");

    await mock.setStatus("1", "ORGANISING");
    await page.reload();

    // The order follows the premieres; Snorre's is fixed in the mock, so only what is there is checked
    await expect(upcoming).toHaveCount(2);
    await expect(upcoming.filter({hasText: "Ali Baba 2028"})).toContainText(`Premiär ${inDays(60)}`);
    await expect(upcoming.filter({hasText: "Snorre 2027"})).toHaveCount(1);
});
