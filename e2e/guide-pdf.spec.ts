import {expect, test} from "./fixtures";
import {ALI_BABA_2028, uuidOf} from "./constants";

test.describe("Guide: export the guide to PDF", () => {
    test("a directeur downloads the revival's guide as a PDF", async ({page, mock, loginAs}) => {
        await mock.guide("published");
        await loginAs("directeur");
        await page.goto(`/revivals/${ALI_BABA_2028}/guide`);

        await page.getByRole("button", {name: "Ladda ner PDF"}).click();
        const download = page.waitForEvent("download");
        await page.getByRole("menuitem", {name: "På engelska"}).click();

        expect((await download).suggestedFilename()).toBe("nyuppsattningsguide-ali-baba-2028-en.pdf");
    });

    test("a steering group member gets a published version's PDF but not the draft's", async ({
                                                                                                  page,
                                                                                                  mock,
                                                                                                  loginAs
                                                                                              }) => {
        await mock.guide("draft");
        await mock.setStatus(ALI_BABA_2028, "ORGANISING");
        await loginAs("styrgrupp");

        const published = await page.request.get(`/api/guide-pdf?version=${uuidOf(1)}&lang=sv`);

        expect(published.status()).toBe(200);
        expect(published.headers()["content-disposition"]).toContain("nyuppsattningsguide-v1-sv.pdf");
        // The route's sandbox, not the page policy, which next.config.ts would otherwise set last
        expect(published.headers()["content-security-policy"]).toBe("default-src 'none'; sandbox");
        expect((await page.request.get(`/api/guide-pdf?version=${uuidOf(10)}&lang=sv`)).status()).toBe(404);
    });
});
