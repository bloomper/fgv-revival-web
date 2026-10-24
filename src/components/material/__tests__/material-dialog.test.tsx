import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MaterialDialog} from "@/components/material/material-dialog.client";

const actions = vi.hoisted(() => ({createMaterialAction: vi.fn(), updateMaterialAction: vi.fn()}));
const track = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/materials/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => (result: { ok: boolean }) => result.ok}));
vi.mock("@/utils/umami", () => ({track}));

const drive = {id: "GOOGLE_DRIVE", name: {sv: "Google Drive", en: null}, hosts: ["drive.google.com", "docs.google.com"], retired: false};
const spexflix = {id: "SPEXFLIX", name: {sv: "Spexflix", en: null}, hosts: ["spexflix.example"], retired: false};
const positions = [
    {id: "T-ENS", name: "Ensemble", category: "Scen", hasRole: true},
    {id: "T-ORK", name: "Orkester", category: "Musik", hasRole: false},
];

describe("MaterialDialog", () => {
    it("says what the link is recognised as while typing", async () => {
        render(<MaterialDialog revivalId="1" services={[drive, spexflix]} positions={positions} material={null} onOpenChange={() => undefined}/>);
        const url = screen.getByLabelText("Material.url");

        await userEvent.type(url, "https://docs.google.com/document/d/1");
        expect(url).toHaveAccessibleDescription('recognised:{"service":"Google Drive"}');

        await userEvent.clear(url);
        await userEvent.type(url, "https://example.org/x");
        expect(url).toHaveAccessibleDescription('notRecognised:{"host":"example.org"}');
    });

    it("asks for a position when only some positions see it, then sends them and tracks the recognition", async () => {
        actions.createMaterialAction.mockResolvedValue({ok: true, data: {id: "9", recognised: true}});
        render(<MaterialDialog revivalId="1" services={[drive, spexflix]} positions={positions} material={null} onOpenChange={() => undefined}/>);

        await userEvent.type(screen.getByLabelText("Material.titleLabel"), "Föreställningen 1988");
        await userEvent.type(screen.getByLabelText("Material.url"), "https://spexflix.example/v/1988");
        await userEvent.selectOptions(screen.getByLabelText("Material.category"), "VIDEO");
        await userEvent.click(screen.getByRole("radio", {name: /Material.visibilities.POSITIONS/}));
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));
        expect(await screen.findByText("Validation.materialPositionsRequired")).toBeInTheDocument();
        expect(actions.createMaterialAction).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("checkbox", {name: "Ensemble"}));
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));
        await waitFor(() => expect(actions.createMaterialAction).toHaveBeenCalledWith({
            revivalId: "1",
            values: {
                title: "Föreställningen 1988", url: "https://spexflix.example/v/1988", serviceId: "", category: "VIDEO", visibility: "POSITIONS",
                positionIds: ["T-ENS"], comment: "",
            },
        }));
        expect(track).toHaveBeenCalledWith("material-create", {category: "VIDEO", recognised: true});
    });

    it("refuses a link that is not https", async () => {
        render(<MaterialDialog revivalId="1" services={[drive]} positions={[]} material={null} onOpenChange={() => undefined}/>);

        await userEvent.type(screen.getByLabelText("Material.titleLabel"), "Noter");
        await userEvent.type(screen.getByLabelText("Material.url"), "http://example.org");
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));
        expect(await screen.findByText("Validation.urlHttpsRequired")).toBeInTheDocument();
        expect(actions.createMaterialAction).not.toHaveBeenCalled();
    });

    it("shows a recognised service as recognised, and a chosen one as chosen, as the server says", () => {
        const base = {id: "5", version: 2, title: "Manus", category: "SCRIPT" as const, visibility: "STEERING_GROUP" as const, positions: [], comment: null};
        const {unmount} = render(<MaterialDialog revivalId="1" services={[drive, spexflix]} positions={[]} onOpenChange={() => undefined}
                                                 material={{...base, url: "https://drive.google.com/x", service: drive, serviceChosen: false}}/>);

        expect(screen.getByLabelText("Material.service")).toHaveValue("");
        unmount();
        render(<MaterialDialog revivalId="1" services={[drive, spexflix]} positions={[]} onOpenChange={() => undefined}
                               material={{...base, url: "https://drive.google.com/x", service: spexflix, serviceChosen: true}}/>);
        expect(screen.getByLabelText("Material.service")).toHaveValue("SPEXFLIX");
    });
});
