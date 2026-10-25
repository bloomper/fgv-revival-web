import "server-only";

import {graphql} from "@/gql";
import {runMutation, runQuery} from "@/lib/graphql.server";
import type {NewsValues} from "@/lib/news/schema";

// News (news.graphqls): everyone reads what is published, the super admin writes it and reads drafts as well.

const NewsQuery = graphql(`
    query News($all: Boolean, $limit: Int) {
        news(all: $all, limit: $limit) { id subject text visibleFrom visibleTo published createdAt lastModifiedAt version }
    }
`);

const NewsCreateMutation = graphql(`
    mutation NewsCreate($input: NewsInput!) {
        newsCreate(input: $input) { id }
    }
`);

const NewsUpdateMutation = graphql(`
    mutation NewsUpdate($id: ID!, $version: Int!, $input: NewsInput!) {
        newsUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const NewsDeleteMutation = graphql(`
    mutation NewsDelete($id: ID!, $version: Int!) {
        newsDelete(id: $id, version: $version)
    }
`);

function toInput(values: NewsValues) {
    return {
        subject: values.subject,
        text: values.text,
        visibleFrom: values.visibleFrom || null,
        visibleTo: values.visibleTo || null,
    };
}

/**
 * What is published today, newest first, at most {@code limit} of it.
 */
export async function getPublishedNews(limit?: number) {
    return (await runQuery(NewsQuery, {all: false, limit: limit ?? null}))?.news ?? [];
}

/**
 * Everything, drafts first, for the super admin.
 */
export async function getAllNews() {
    return (await runQuery(NewsQuery, {all: true, limit: null}))?.news ?? [];
}

export async function createNews(values: NewsValues) {
    await runMutation(NewsCreateMutation, {input: toInput(values)});
}

export async function updateNews(id: string, version: number, values: NewsValues) {
    await runMutation(NewsUpdateMutation, {id, version, input: toInput(values)});
}

export async function deleteNews(id: string, version: number) {
    await runMutation(NewsDeleteMutation, {id, version});
}
