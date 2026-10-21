import {type Page, test as base} from "@playwright/test";
import {MOCK_URL} from "./constants";

type Persona = "superadmin" | "observer" | "directeur" | "styrgrupp" | "noaccess";

export const test = base.extend<{ resetBackend: void; loginAs: (persona: Persona) => Promise<void>; mock: Mock }>({
    resetBackend: [async ({request}, provide) => {
        await request.post(`${MOCK_URL}/__reset`);
        await provide();
    }, {auto: true}],
    loginAs: async ({page, request}, provide) => {
        await provide(async (persona: Persona) => {
            await request.post(`${MOCK_URL}/__persona`, {data: {persona}});
            await page.context().clearCookies();
            await page.goto("/api/auth/login");
            await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
            await page.getByRole("button", {name: "Jag förstår"}).click();
        });
    },
    mock: async ({request}, provide) => {
        await provide({
            setStatus: async (id: string, status: string) => {
                await request.post(`${MOCK_URL}/__status`, {data: {id, status}});
            },
            spexregister: async (up: boolean) => {
                await request.post(`${MOCK_URL}/__spexregister`, {data: {up}});
            },
        });
    },
});

type Mock = {
    setStatus: (id: string, status: string) => Promise<void>;
    spexregister: (up: boolean) => Promise<void>;
};

export async function openRevival(page: Page, title: string) {
    await page.getByRole("link", {name: title}).first().click();
    await page.getByRole("heading", {level: 2, name: title}).waitFor();
}

export {expect} from "@playwright/test";
