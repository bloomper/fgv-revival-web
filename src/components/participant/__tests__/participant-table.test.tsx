import type {ReactNode} from "react";
import {describe, expect, it, vi} from "vitest";
import {render, screen, within} from "@testing-library/react";
import {
    EMPTY_PARTICIPANT_FILTER,
    filterParticipants,
    NO_POSITION,
    type ParticipantRow,
    ParticipantTable,
} from "@/components/participant/participant-table.client";
import {ParticipantDashboard, participantTiles} from "@/components/participant/participant-dashboard";

vi.mock("next/navigation", () => ({
    useRouter: () => ({push: vi.fn(), replace: vi.fn(), refresh: vi.fn()}),
    usePathname: () => "/revivals/1/participants",
    useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", () => ({
    default: ({children, href, ...props}: { children?: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("@/app/(app)/revivals/[id]/participants/actions.server", () => ({
    participantCandidatesAction: vi.fn(), spexareSearchAction: vi.fn(), addSpexareParticipantsAction: vi.fn(), addPendingParticipantAction: vi.fn(),
    updateParticipantAction: vi.fn(), removeParticipantAction: vi.fn(), inviteParticipantsAction: vi.fn(), setParticipantFeePaidAction: vi.fn(),
    updateParticipationSettingsAction: vi.fn(), handleReferralAction: vi.fn(),
}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const ensemble = {id: "T1", name: "Ensemble", category: "Scen", hasRole: true};
const row = (values: Partial<ParticipantRow>): ParticipantRow => ({
    id: "1", revivalId: "1", kind: "PARTICIPANT", spexareId: "100", firstName: "Anna", lastName: "Andersson", nickName: null, email: null, phone: null,
    pending: false, position: null, roleName: null, vocalPart: null, preferredPosition: null, response: "PENDING", respondedAt: null, comment: null,
    termsAcceptedAt: null, registerConsent: null, invitation: "NOT_INVITED", invitedAt: null, dietary: null, dietaryReadable: false, fee: "800", feeOverride: null,
    feePaid: false, feePaidAt: null, compensationPerShift: null, removed: false, version: 0, ...values,
});
const participants: ParticipantRow[] = [
    row({id: "1", nickName: "Spexis", position: ensemble, roleName: "Ali Baba", vocalPart: {id: "B1", name: "Bas 1"}, response: "YES", invitation: "ACTIVE",
        email: "anna@example.org", phone: "070-123 45 67", dietary: "Vegetarian", dietaryReadable: true, feePaid: true}),
    row({id: "2", firstName: "Bo", lastName: "Berg", spexareId: null, pending: true, email: "bo@example.org"}),
    row({id: "3", firstName: "Cia", lastName: "Carlsson", kind: "HELPER", fee: null, phone: "0709876543", response: "MAYBE", invitation: "INVITED"}),
];

describe("filterParticipants", () => {
    it("matches every word in names, positions and contact details", () => {
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, query: "spexis ensemble"}).map(p => p.id)).toEqual(["1"]);
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, query: "bo@example"}).map(p => p.id)).toEqual(["2"]);
    });

    it("filters by answer, kind, position and invitation", () => {
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, responses: new Set(["PENDING", "MAYBE"])}).map(p => p.id)).toEqual(["2", "3"]);
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, kinds: new Set(["HELPER"])}).map(p => p.id)).toEqual(["3"]);
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, positions: new Set([NO_POSITION])}).map(p => p.id)).toEqual(["2", "3"]);
        expect(filterParticipants(participants, {...EMPTY_PARTICIPANT_FILTER, invitations: new Set(["NOT_INVITED"])}).map(p => p.id)).toEqual(["2"]);
    });
});

describe("ParticipantTable", () => {
    const render_ = (props: Partial<Parameters<typeof ParticipantTable>[0]> = {}) => render(
        <ParticipantTable revivalId="1" participants={participants} positions={[ensemble]} vocalParts={[]} settings={{version: 0}} canWrite canWriteBudget
                          canReadDietary showRemoved={false} {...props}/>,
    );

    it("shows names, positions, answers, fees, dietary needs and contact links", () => {
        render_();

        const anna = screen.getByRole("row", {name: /Anna "Spexis" Andersson/});

        expect(within(anna).getByText("Ensemble")).toBeInTheDocument();
        expect(within(anna).getByText("Ali Baba, Bas 1")).toBeInTheDocument();
        expect(within(anna).getByText("responses.YES")).toBeInTheDocument();
        expect(within(anna).getByText("invitation.ACTIVE")).toBeInTheDocument();
        expect(within(anna).getByRole("switch", {name: /feePaidFor/})).toBeChecked();
        expect(within(anna).getByRole("button", {name: /dietaryOf/})).toBeInTheDocument();
        expect(within(anna).getByRole("link", {name: /anna@example.org/})).toHaveAttribute("href", "mailto:anna@example.org");
        expect(within(anna).getByRole("link", {name: /whatsAppTo/})).toHaveAttribute("href", "https://wa.me/46701234567");

        const bo = screen.getByRole("row", {name: /Bo Berg/});

        expect(within(bo).getByText("pendingPerson")).toBeInTheDocument();
        expect(within(screen.getByRole("row", {name: /Cia Carlsson/})).getByText("kinds.HELPER")).toBeInTheDocument();
    });

    it("offers inviting everyone not yet invited, and the steering group's actions", () => {
        render_();

        expect(screen.getByRole("button", {name: /Participants.inviteAll.*"count":1/})).toBeEnabled();
        expect(screen.getByRole("button", {name: "add"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Participants.settings"})).toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: /rowMenu/})).toHaveLength(3);
    });

    it("shows readers no actions, no fee switches and no dietary column without the right", () => {
        render_({canWrite: false, canWriteBudget: false, canReadDietary: false});

        expect(screen.queryByRole("button", {name: "add"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /rowMenu/})).not.toBeInTheDocument();
        expect(screen.queryByRole("switch", {name: /feePaidFor/})).not.toBeInTheDocument();
        expect(screen.queryByRole("columnheader", {name: "dietary"})).not.toBeInTheDocument();
        expect(within(screen.getByRole("row", {name: /Anna/})).getByText("paid")).toBeInTheDocument();
    });
});

describe("ParticipantDashboard", () => {
    const counts = {
        total: 5,
        byResponse: [{response: "YES" as const, count: 2}, {response: "NO" as const, count: 1}, {response: "PENDING" as const, count: 2}],
        byPosition: [{position: ensemble, yes: 2, maybe: 0, pending: 1}, {position: null, yes: 0, maybe: 0, pending: 1}],
        notInvited: 2, waitingForAccess: 1, feesPaid: 1, feesUnpaid: 1, helpers: 1,
    };

    it("counts every answer, zero for those nobody gave", () => {
        expect(participantTiles(counts)).toEqual([
            {key: "responses.YES", count: 2}, {key: "responses.MAYBE", count: 0}, {key: "responses.PENDING", count: 2}, {key: "responses.NO", count: 1},
            {key: "notInvited", count: 2}, {key: "waitingForAccess", count: 1}, {key: "feesPaid", count: 1}, {key: "feesUnpaid", count: 1}, {key: "helpers", count: 1},
        ]);
    });

    it("shows the positions table with a row for those without one", () => {
        render(<ParticipantDashboard counts={counts}/>);

        expect(screen.getByRole("row", {name: "Ensemble 2 0 1"})).toBeInTheDocument();
        expect(screen.getByRole("row", {name: "noPosition 0 0 1"})).toBeInTheDocument();
    });
});
