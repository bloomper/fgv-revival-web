import "server-only";

import {graphql} from "@/gql";
import type {MailingAudienceInput, MailingInput, MailingTemplateInput} from "@/gql/graphql";
import {GraphQLRequestError, runMutation, runQuery} from "@/lib/graphql.server";

// Mailings, the mailing plan and its templates (M6b, contract mailing.graphqls). Nothing is sent without a person
// confirming; recipients are names only, and their addresses are looked up by the server at send time.

const MailingsQuery = graphql(`
    query Mailings($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canReadMailings canDraftMailings canSendMailings }
            mailingPlan {
                template { ...MailingTemplateFields }
                event { id title startDate }
                dueDate
                mailing { id status subject sentAt }
                due
            }
        }
        mailings(revivalId: $id) { ...MailingFields }
    }
`);

const MailingQuery = graphql(`
    query Mailing($id: ID!, $revivalId: ID!) {
        revival(id: $revivalId) {
            id
            title
            status
            permissions { canReadMailings canDraftMailings canSendMailings }
        }
        mailing(id: $id) { ...MailingFields }
    }
`);

const MailingEditorOptionsQuery = graphql(`
    query MailingEditorOptions($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canReadMailings canDraftMailings canSendMailings }
            mailingPlan { template { ...MailingTemplateFields } event { id title startDate } dueDate due }
        }
        events(revivalId: $id, includeCancelled: false) { id title startDate }
    }
`);

const MailingPositionsQuery = graphql(`
    query MailingPositions {
        positions { id name category hasRole }
    }
`);

const MailingAudiencePreviewQuery = graphql(`
    query MailingAudiencePreview($revivalId: ID!, $audience: MailingAudienceInput!) {
        mailingAudiencePreview(revivalId: $revivalId, audience: $audience) { displayName hasAddress }
    }
`);

const MailingTemplatesQuery = graphql(`
    query MailingTemplates($includeRetired: Boolean) {
        mailingTemplates(includeRetired: $includeRetired) { ...MailingTemplateFields }
    }
`);

const MailingCreateMutation = graphql(`
    mutation MailingCreate($input: MailingInput!) {
        mailingCreate(input: $input) { id }
    }
`);

const MailingUpdateMutation = graphql(`
    mutation MailingUpdate($id: ID!, $version: Int!, $input: MailingInput!) {
        mailingUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const MailingCancelMutation = graphql(`
    mutation MailingCancel($id: ID!, $version: Int!) {
        mailingCancel(id: $id, version: $version) { id }
    }
`);

const MailingSendMutation = graphql(`
    mutation MailingSend($id: ID!, $version: Int!) {
        mailingSend(id: $id, version: $version) { id recipients { status } }
    }
`);

const MailingRetryMutation = graphql(`
    mutation MailingRetry($id: ID!) {
        mailingRetry(id: $id) { id recipients { status } }
    }
`);

const MailingTemplateCreateMutation = graphql(`
    mutation MailingTemplateCreate($input: MailingTemplateInput!) {
        mailingTemplateCreate(input: $input) { id }
    }
`);

const MailingTemplateUpdateMutation = graphql(`
    mutation MailingTemplateUpdate($id: ID!, $version: Int!, $input: MailingTemplateInput!) {
        mailingTemplateUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const MailingTemplateMoveMutation = graphql(`
    mutation MailingTemplateMove($id: ID!, $version: Int!, $position: Int!) {
        mailingTemplateMove(id: $id, version: $version, position: $position) { id }
    }
`);

const MailingTemplateRetireMutation = graphql(`
    mutation MailingTemplateRetire($id: ID!, $version: Int!) {
        mailingTemplateRetire(id: $id, version: $version) { id }
    }
`);

const MailingTemplateRestoreMutation = graphql(`
    mutation MailingTemplateRestore($id: ID!, $version: Int!) {
        mailingTemplateRestore(id: $id, version: $version) { id }
    }
`);

/** The mailings tab: the plan and the mailings, newest first. Null when the revival is not visible. */
export async function getMailings(revivalId: string) {
    const data = await runQuery(MailingsQuery, {id: revivalId});

    return data?.revival ? {revival: data.revival, mailings: data.mailings} : null;
}

export async function getMailing(revivalId: string, id: string) {
    const data = await runQuery(MailingQuery, {id, revivalId});

    return data?.revival ? {revival: data.revival, mailing: data.mailing ?? null} : null;
}

/** What the editor offers: the events for an event audience and the plan, to prefill from a plan entry. */
export async function getMailingEditorOptions(revivalId: string) {
    const data = await runQuery(MailingEditorOptionsQuery, {id: revivalId});

    return data?.revival ? {revival: data.revival, events: data.events} : null;
}

/** Positions from Spexregister, for a position audience. */
export async function getMailingPositions() {
    return (await runQuery(MailingPositionsQuery, {}))?.positions ?? [];
}

/** The positions, or none when Spexregister cannot be read: a position audience then cannot be picked, the rest works. */
export async function loadMailingPositions() {
    try {
        return {positions: await getMailingPositions(), unavailable: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return {positions: [], unavailable: true};
        }
        throw error;
    }
}

export async function previewMailingAudience(revivalId: string, audience: MailingAudienceInput) {
    return (await runQuery(MailingAudiencePreviewQuery, {revivalId, audience}))?.mailingAudiencePreview ?? [];
}

export async function getMailingTemplates(includeRetired = false) {
    return (await runQuery(MailingTemplatesQuery, {includeRetired}))?.mailingTemplates ?? [];
}

export async function createMailing(input: MailingInput) {
    return (await runMutation(MailingCreateMutation, {input}))?.mailingCreate ?? null;
}

export async function updateMailing(id: string, version: number, input: MailingInput) {
    await runMutation(MailingUpdateMutation, {id, version, input});
}

export async function cancelMailing(id: string, version: number) {
    await runMutation(MailingCancelMutation, {id, version});
}

export async function sendMailing(id: string, version: number) {
    return (await runMutation(MailingSendMutation, {id, version}))?.mailingSend ?? null;
}

export async function retryMailing(id: string) {
    return (await runMutation(MailingRetryMutation, {id}))?.mailingRetry ?? null;
}

export async function createMailingTemplate(input: MailingTemplateInput) {
    await runMutation(MailingTemplateCreateMutation, {input});
}

export async function updateMailingTemplate(id: string, version: number, input: MailingTemplateInput) {
    await runMutation(MailingTemplateUpdateMutation, {id, version, input});
}

export async function moveMailingTemplate(id: string, version: number, position: number) {
    await runMutation(MailingTemplateMoveMutation, {id, version, position});
}

export async function retireMailingTemplate(id: string, version: number) {
    await runMutation(MailingTemplateRetireMutation, {id, version});
}

export async function restoreMailingTemplate(id: string, version: number) {
    await runMutation(MailingTemplateRestoreMutation, {id, version});
}
