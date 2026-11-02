import {expect, test} from "./fixtures";

test.describe("maintenance", () => {
    test("the super admin runs a job", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/maintenance");

        const retention = page.getByRole("listitem").filter({hasText: "Gallring av deltagaruppgifter"});

        await expect(retention.getByText("0 15 3 * * *")).toBeVisible();
        await expect(retention.getByText("Inte sedan servern startade")).toBeVisible();

        await retention.getByRole("button", {name: "Kör nu"}).click();
        await expect(page.getByText("Gallring av deltagaruppgifter har startat. Det körs i bakgrunden.")).toBeVisible();
        await expect(retention.getByText(/^Lyckades/)).toBeVisible();
    });

    test("a running job cannot be started again", async ({page, loginAs}) => {
        await loginAs("superadmin");
        await page.goto("/admin/maintenance");

        const reminders = page.getByRole("listitem").filter({hasText: "Påminnelser om utskick"});

        await expect(reminders.getByText("Körs", {exact: true})).toBeVisible();
        await expect(reminders.getByRole("button", {name: "Kör nu"})).toBeDisabled();
    });
});
