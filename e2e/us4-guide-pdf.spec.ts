import {expect, test} from "./fixtures";

test.describe("Guide, user story 4: export the guide to PDF", () => {
    test("a directeur downloads the revival's guide as a PDF", async ({page, mock, loginAs}) => {
        await mock.guide("published");
        await loginAs("directeur");
        await page.goto("/revivals/1/guide");

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
        await mock.setStatus("1", "ORGANISING");
        await loginAs("styrgrupp");

        const published = await page.request.get("/api/guide-pdf?version=1&lang=sv");

        expect(published.status()).toBe(200);
        expect(published.headers()["content-disposition"]).toContain("nyuppsattningsguide-v1-sv.pdf");
        expect((await page.request.get("/api/guide-pdf?version=10&lang=sv")).status()).toBe(404);
    });
});
