import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {LinkServiceEditor} from "@/components/material/link-service-editor.client";

const actions = vi.hoisted(() => ({
    createLinkServiceAction: vi.fn(),
    updateLinkServiceAction: vi.fn(),
    moveLinkServiceAction: vi.fn(),
    retireLinkServiceAction: vi.fn(),
    restoreLinkServiceAction: vi.fn(),
    deleteLinkServiceAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/admin/link-services/actions.server", () => actions);

const spexflix = {
    id: "SPEXFLIX",
    name: {sv: "Spexflix", en: null},
    hosts: [],
    homeUrl: null,
    retired: false,
    position: 0,
    inUse: true,
    version: 1
};
const drive = {
    id: "GOOGLE_DRIVE",
    name: {sv: "Google Drive", en: null},
    hosts: ["drive.google.com", "docs.google.com"],
    homeUrl: null,
    retired: false,
    position: 1,
    inUse: false,
    version: 0,
};

describe("LinkServiceEditor", () => {
    it("lists each service's hosts, or says it has none", () => {
        render(<LinkServiceEditor entries={[spexflix, drive]}/>);

        expect(screen.getByText("LinkServiceAdmin.noHosts")).toBeInTheDocument();
        expect(screen.getByText("drive.google.com, docs.google.com")).toBeInTheDocument();
    });

    it("adds hosts as chips, from a pasted link too, refuses a repeated one, and saves them with the start page", async () => {
        actions.updateLinkServiceAction.mockResolvedValue({ok: true, data: null});
        render(<LinkServiceEditor entries={[spexflix, drive]}/>);

        await userEvent.click(screen.getByRole("button", {name: 'Catalog.editEntry:{"name":"Spexflix"}'}));
        const sheet = screen.getByRole("dialog");
        const hosts = within(sheet).getByLabelText("LinkServiceAdmin.hosts", {selector: "input"});

        await userEvent.type(hosts, "https://Spexflix.example/film/1{Enter}");
        expect(within(sheet).getByText("spexflix.example")).toBeInTheDocument();
        await userEvent.type(hosts, "spexflix.example{Enter}");
        expect(within(sheet).getByRole("alert")).toHaveTextContent("Validation.hostDuplicate");
        await userEvent.clear(hosts);
        await userEvent.type(hosts, "media.spexflix.example,");
        await userEvent.click(within(sheet).getByRole("button", {name: 'LinkServiceAdmin.removeHost:{"host":"spexflix.example"}'}));
        await userEvent.type(within(sheet).getByLabelText("LinkServiceAdmin.homeUrl"), "https://spexflix.example");
        await userEvent.click(within(sheet).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.updateLinkServiceAction).toHaveBeenCalledWith({
            id: "SPEXFLIX", version: 1, name: {sv: "Spexflix", en: ""},
            details: {hosts: ["media.spexflix.example"], homeUrl: "https://spexflix.example"},
        }));
    });

    it("refuses an http start page", async () => {
        render(<LinkServiceEditor entries={[drive]}/>);

        await userEvent.click(screen.getByRole("button", {name: 'Catalog.editEntry:{"name":"Google Drive"}'}));
        await userEvent.type(screen.getByLabelText("LinkServiceAdmin.homeUrl"), "http://drive.google.com");
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(await screen.findByText("Validation.urlHttpsRequired")).toBeInTheDocument();
        expect(actions.updateLinkServiceAction).not.toHaveBeenCalled();
    });
});
