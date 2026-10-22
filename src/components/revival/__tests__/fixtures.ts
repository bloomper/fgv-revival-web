import type {RevivalDetailFragment} from "@/gql/graphql";

export function revivalDetail(overrides: Partial<RevivalDetailFragment> = {}): RevivalDetailFragment {
    return {
        id: "1",
        year: 2028,
        title: "Ali Baba 2028",
        premiereDate: "2028-02-10",
        status: "ORGANISING",
        spex: {id: "1", title: "Ali Baba", year: 1987, available: true},
        members: [],
        permissions: {
            canEditCore: false,
            canEditDetails: false,
            allowedStatuses: [],
            canManageDirecteurs: false,
            canManageSteeringGroup: false,
            canDelete: false,
        },
        showDates: ["2028-02-10"],
        venues: ["Chalmers kårhus"],
        version: 3,
        createdBy: "Sara Admin",
        createdAt: "2026-10-20T10:00:00Z",
        lastModifiedBy: null,
        lastModifiedAt: null,
        statusHistory: [],
        guideVersion: null,
        ...overrides,
    } as RevivalDetailFragment;
}
