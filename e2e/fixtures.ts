import {expect, type Page, test as base} from "@playwright/test";
import {MOCK_URL} from "./constants";

type Persona = "superadmin" | "observer" | "directeur" | "styrgrupp" | "noaccess" | "deltagare";

export const test = base.extend<{ resetBackend: void; loginAs: (persona: Persona) => Promise<void>; mock: Mock }>({
    resetBackend: [async ({request}, provide) => {
        await request.post(`${MOCK_URL}/__reset`);
        await provide();
    }, {auto: true}],
    loginAs: async ({page, request}, provide) => {
        await provide(async (persona: Persona) => {
            await request.post(`${MOCK_URL}/__persona`, {data: {persona}});
            // A second login in one test starts afresh too: c15t also remembers the dismissed notice in local storage
            if (page.url().startsWith("http")) {
                await page.evaluate(() => localStorage.clear());
            }
            await page.context().clearCookies();
            await page.goto("/api/auth/login");
            await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
            await page.getByRole("button", {name: "Jag förstår"}).click();
            await consentStored(page);
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
            events: async () => {
                await request.post(`${MOCK_URL}/__events`);
            },
            budget: async (setup: { finance?: boolean } = {}) => {
                await request.post(`${MOCK_URL}/__budget`, {data: setup});
            },
            participants: async (setup: { people?: boolean } = {}) => {
                await request.post(`${MOCK_URL}/__participants`, {data: setup});
            },
            staffing: async (setup: { capabilities?: string[]; answered?: boolean } = {}) => {
                await request.post(`${MOCK_URL}/__staffing`, {data: setup});
            },
            materials: async (setup: { disaPosition?: string } = {}) => {
                await request.post(`${MOCK_URL}/__materials`, {data: setup});
            },
            closing: async (setup: { failOnce?: string[] } = {}) => {
                await request.post(`${MOCK_URL}/__closing`, {data: setup});
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
    /** After revival 1's chapter checklists exist, adds the event template "Rephelg" with four items and a chapter B template with one. */
    templates: () => Promise<void>;
    /** Makes the next minutes email fail for these persona ids, and adds waiting steering group members to revival 1. */
    mail: (setup: { failOnce?: string[]; waiting?: number }) => Promise<void>;
    /** Gives revival 1 the premiere 2028-03-04 with one show, and the event type "Rephelg 1" a checklist template with two items. */
    events: () => Promise<void>;
    /**
     * Gives revival 1 budget settings (40 participants), a show ticket and a venue line and a "Rephelg 1" event whose type
     * proposes food per participant, and the library the reference "Nobel 2026". {@code finance: false} takes the FINANCE
     * area from the steering group member.
     */
    budget: (setup?: { finance?: boolean }) => Promise<void>;
    /**
     * Gives revival 1 a fee of 800 kr, a loan, a Swish number, a WhatsApp link and extra terms. {@code people: true} also
     * adds Disa Deltagare (the "deltagare" persona) as an invited pending participant, the spexare Anna Andersson and a
     * referral.
     */
    participants: (setup?: { people?: boolean }) => Promise<void>;
    /**
     * After {@code participants({people: true})}: gives revival 1 a premiere 60 days from now, a "Rephelg 1" event five
     * days from now with the slot "Biljettkontroll" 18:00–20:00 on its first day, and the mailing templates "Allergier
     * inför rephelgen" (the Monday the week before each "Rephelg 1", so it is due) and "Biljetter till föreställningarna".
     * {@code capabilities} replaces the steering group member's areas; {@code answered} makes Disa answer yes,
     * available on the event's second day, and Anna Andersson answer maybe.
     */
    staffing: (setup?: { capabilities?: string[]; answered?: boolean }) => Promise<void>;
    /** After {@code participants({people: true})}: gives Disa Deltagare a position (e.g. "T-ENS", Ensemble). */
    materials: (setup?: { disaPosition?: string }) => Promise<void>;
    /**
     * After {@code participants({people: true})}: puts revival 1 in SETTLING with Anna Andersson (Ensemble, the role Ali
     * Baba), Bertil Bengtsson (Orchestra) and the pending Disa Deltagare all answering yes. {@code failOnce} makes the
     * first sync step of each listed operation (e.g. "TASK") fail.
     */
    closing: (setup?: { failOnce?: string[] }) => Promise<void>;
};

/**
 * c15t stores the dismissed cookie notice after the click, so a page opened right away would show the banner again,
 * over the bottom right corner where sheets have their buttons.
 */
export async function consentStored(page: Page) {
    await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name === "c15t-notice")).toBe(true);
}

export async function openRevival(page: Page, title: string) {
    await page.getByRole("link", {name: title}).or(page.getByRole("row", {name: title})).first().click();
    await page.getByRole("heading", {level: 2, name: title}).waitFor();
}

export {expect} from "@playwright/test";
