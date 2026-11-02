import "server-only";

import {graphql} from "@/gql";
import type {MaintenanceJob} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const MaintenanceJobsQuery = graphql(`
    query MaintenanceJobs {
        maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded }
    }
`);

const MaintenanceJobRunMutation = graphql(`
    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }
`);

/**
 * The scheduled maintenance jobs, with their schedules and latest runs.
 */
export async function getMaintenanceJobs() {
    return (await runQuery(MaintenanceJobsQuery, {}))?.maintenanceJobs ?? [];
}

/**
 * Starts a maintenance job in the background. Resolves to false when it is already running.
 */
export async function runMaintenanceJob(job: MaintenanceJob) {
    return Boolean((await runMutation(MaintenanceJobRunMutation, {job}))?.maintenanceJobRun);
}
