import "server-only";

import {graphql} from "@/gql";
import type {LogEntryAnswerInput, LogEntryCreateInput, LogEntryFilter, LogEntryUpdateInput} from "@/gql/graphql";
import {apiFetch} from "@/lib/api.server";
import {type ErrorCode, GraphQLRequestError, runMutation, runQuery} from "@/lib/graphql.server";

const RevivalLogQuery = graphql(`
    query RevivalLog($id: ID!, $filter: LogEntryFilter) {
        revival(id: $id) {
            id
            title
            year
            status
            permissions { canWriteLog canImportLog canWaiveRequirement }
            ownerCandidates { id displayName }
        }
        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }
        logTags(revivalId: $id)
        meetings(revivalId: $id) { id date title }
    }
`);

const RevivalLogImportQuery = graphql(`
    query RevivalLogImport($id: ID!) {
        revival(id: $id) {
            id
            title
            permissions { canImportLog canWaiveRequirement }
        }
        logImport(revivalId: $id) { fileName layout rowCount importedAt importedBy { displayName } }
    }
`);

const LogEntryCreateMutation = graphql(`
    mutation LogEntryCreate($input: LogEntryCreateInput!) {
        logEntryCreate(input: $input) { ...LogEntryFields }
    }
`);

const LogEntryUpdateMutation = graphql(`
    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {
        logEntryUpdate(input: $input) { ...LogEntryFields }
    }
`);

const LogEntryAnswerMutation = graphql(`
    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {
        logEntryAnswer(input: $input) {
            question { ...LogEntryFields }
            decision { ...LogEntryFields }
        }
    }
`);

export async function getRevivalLog(revivalId: string, filter: LogEntryFilter) {
    const data = await runQuery(RevivalLogQuery, {id: revivalId, filter});

    return data?.revival ? {revival: data.revival, entries: data.logEntries, tags: data.logTags, meetings: data.meetings} : null;
}

export async function createLogEntry(input: LogEntryCreateInput) {
    return (await runMutation(LogEntryCreateMutation, {input}))?.logEntryCreate;
}

export async function updateLogEntry(input: LogEntryUpdateInput) {
    return (await runMutation(LogEntryUpdateMutation, {input}))?.logEntryUpdate;
}

export async function answerLogEntry(input: LogEntryAnswerInput) {
    return (await runMutation(LogEntryAnswerMutation, {input}))?.logEntryAnswer;
}

export async function getRevivalLogImport(revivalId: string) {
    const data = await runQuery(RevivalLogImportQuery, {id: revivalId});

    return data?.revival ? {revival: data.revival, logImport: data.logImport ?? null} : null;
}

export type LogImportWarning = { code: string; sheetRow: number | null; detail: string | null };

/**
 * The import preview from `POST /api/revivals/{id}/log/import/preview` (contracts/http.md).
 */
export type LogImportPreview = {
    fileName: string;
    layout: "ALI_BABA" | "NOBEL";
    sheet: string;
    ignoredSheets: string[];
    rowCount: number;
    byType: Record<"DECISION" | "TODO" | "QUESTION", number>;
    byStatus: Record<"OPEN" | "DONE" | "WAITING" | "CANCELLED", number>;
    numbers: { first: number; last: number };
    owners: { name: string; rows: number; suggestedPersonId: string | number | null }[];
    members: { id: string | number; displayName: string | null }[];
    warnings: LogImportWarning[];
    guideRowsRenumbered: number;
};

export type LogImportChoices = { owners: Record<string, string | null>; nobelType?: "DECISION" | "TODO" | "QUESTION" };

const HTTP_CODES: Record<number, ErrorCode> = {400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT", 413: "BAD_REQUEST"};

async function postWorkbook<T>(path: string, file: File, choices?: LogImportChoices): Promise<T> {
    const body = new FormData();

    body.append("file", file, file.name);
    if (choices) {
        body.append("choices", new Blob([JSON.stringify(choices)], {type: "application/json"}));
    }

    const response = await apiFetch(path, {method: "POST", body});
    const json = await response.json().catch(() => ({})) as T & { code?: string; message?: string };

    if (!response.ok) {
        throw new GraphQLRequestError((json.code as ErrorCode | undefined) ?? HTTP_CODES[response.status] ?? "INTERNAL_ERROR", json.message ?? response.statusText);
    }
    return json;
}

export async function previewLogImport(revivalId: string, file: File) {
    return postWorkbook<LogImportPreview>(`/api/revivals/${encodeURIComponent(revivalId)}/log/import/preview`, file);
}

export async function importLog(revivalId: string, file: File, choices: LogImportChoices) {
    return postWorkbook<{ rowCount: number }>(`/api/revivals/${encodeURIComponent(revivalId)}/log/import`, file, choices);
}
