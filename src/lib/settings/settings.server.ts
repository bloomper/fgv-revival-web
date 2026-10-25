import "server-only";

import {graphql} from "@/gql";
import type {ApplicationSettingsInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// The application settings (settings.graphqls), which the super admin keeps.

const ApplicationSettingsQuery = graphql(`
    query ApplicationSettings {
        applicationSettings { terms { sv en } defaultParticipationFee version }
    }
`);

const ApplicationSettingsUpdateMutation = graphql(`
    mutation ApplicationSettingsUpdate($version: Int!, $input: ApplicationSettingsInput!) {
        applicationSettingsUpdate(version: $version, input: $input) { version }
    }
`);

export async function getApplicationSettings() {
    return (await runQuery(ApplicationSettingsQuery, {}))?.applicationSettings;
}

export async function updateApplicationSettings(version: number, input: ApplicationSettingsInput) {
    await runMutation(ApplicationSettingsUpdateMutation, {version, input});
}
