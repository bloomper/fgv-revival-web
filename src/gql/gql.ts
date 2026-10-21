/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n": typeof types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n": typeof types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": typeof types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n": typeof types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n    }\n": typeof types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n": typeof types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": typeof types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": typeof types.RevivalDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": typeof types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalStatusChangeDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": typeof types.SpexSearchDocument,
};
const documents: Documents = {
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n": types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n": types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n": types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n    }\n": types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n": types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": types.RevivalDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalStatusChangeDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": types.SpexSearchDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"): (typeof documents)["\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n"): (typeof documents)["\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n    }\n"): (typeof documents)["\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n"): (typeof documents)["\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n"): (typeof documents)["\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n"): (typeof documents)["\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"): (typeof documents)["\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;