import {beforeEach, describe, expect, it, vi} from "vitest";
import {getMaintenanceJobs, runMaintenanceJob} from "@/lib/maintenance/maintenance.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

describe("maintenance.server", () => {
    beforeEach(() => {
        runQuery.mockReset();
        runMutation.mockReset();
    });

    it("reads the jobs, or none", async () => {
        runQuery.mockResolvedValueOnce({maintenanceJobs: [{job: "MAILING_REMINDERS", running: false}]});
        expect(await getMaintenanceJobs()).toEqual([{job: "MAILING_REMINDERS", running: false}]);

        runQuery.mockResolvedValueOnce(undefined);
        expect(await getMaintenanceJobs()).toEqual([]);
    });

    it("starts a job and says whether it started", async () => {
        runMutation.mockResolvedValueOnce({maintenanceJobRun: true}).mockResolvedValueOnce(undefined);

        expect(await runMaintenanceJob("PARTICIPANT_RETENTION")).toBe(true);
        expect(runMutation.mock.calls[0][1]).toEqual({job: "PARTICIPANT_RETENTION"});
        expect(await runMaintenanceJob("PARTICIPANT_RETENTION")).toBe(false);
    });
});
