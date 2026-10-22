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
            guide: async (seed: "none" | "published" | "two" | "draft") => {
                await request.post(`${MOCK_URL}/__guide`, {data: {seed}});
            },
            logRow: async (row: LogRow) => {
                await request.post(`${MOCK_URL}/__log`, {data: row});
            },
            templates: async () => {
                await request.post(`${MOCK_URL}/__templates`);
            },
            mail: async (setup: { failOnce?: string[]; waiting?: number }) => {
                await request.post(`${MOCK_URL}/__mail`, {data: setup});
            },
        });
    },
});

type LogRow = { revivalId: string; type: "DECISION" | "TODO" | "QUESTION"; text: string; status?: string; deadline?: string };

type Mock = {
    setStatus: (id: string, status: string) => Promise<void>;
    spexregister: (up: boolean) => Promise<void>;
    /** Resets the backend with no guide, or v1 (with "two" also a newer v2, with "draft" also a draft with id 10) published and every revival pinned to v1. */
    guide: (seed: "none" | "published" | "two" | "draft") => Promise<void>;
    /** Adds a decision log row as the steering group member. */
    logRow: (row: LogRow) => Promise<void>;
    /** After revival 1's phase checklists exist, adds the event template "Rephelg" with four items and a phase B template with one. */
    templates: () => Promise<void>;
    /** Makes the next minutes email fail for these persona ids, and adds waiting steering group members to revival 1. */
    mail: (setup: { failOnce?: string[]; waiting?: number }) => Promise<void>;
};

export async function openRevival(page: Page, title: string) {
    await page.getByRole("link", {name: title}).or(page.getByRole("row", {name: title})).first().click();
    await page.getByRole("heading", {level: 2, name: title}).waitFor();
}

export {expect} from "@playwright/test";
