// Mock Keycloak (OIDC) and Nyuppsättning's GraphQL API for the Playwright tests. The GraphQL side keeps state in
// memory and applies the same visibility and permission rules as the server,
// so each persona sees what the real server would show. Test data is fictitious.
import {createServer} from "node:http";
import {randomUUID} from "node:crypto";
import {exportJWK, generateKeyPair, SignJWT} from "jose";
import {createGuideState, guideResolvers, handleGuidePdf} from "./mock-guide.mjs";
import {createLogState, logResolvers} from "./mock-log.mjs";
import {createMeetingState, meetingResolvers} from "./mock-meeting.mjs";
import {checklistResolvers, createChecklistState} from "./mock-checklist.mjs";
import {catalogResolvers, createCatalogState, toObjects} from "./mock-catalog.mjs";
import {createEventState, eventResolvers} from "./mock-event.mjs";
import {budgetResolvers, createBudgetState} from "./mock-budget.mjs";
import {createParticipantState, participantResolvers, POSITIONS} from "./mock-participant.mjs";
import {createStaffingState, staffingResolvers} from "./mock-staffing.mjs";
import {createMaterialState, materialResolvers} from "./mock-material.mjs";
import {closingResolvers, createClosingState} from "./mock-closing.mjs";
import {createNewsState, newsResolvers} from "./mock-news.mjs";

const PORT = Number(process.env.MOCK_PORT || 4101);
const ISSUER = `http://localhost:${PORT}/realms/fgv`;
const CLIENT_ID = "fgv-revival";
const KID = "e2e-key";
const TOKEN_TTL = 3600;

const PERSONAS = {
    superadmin: {
        sub: "p-superadmin",
        name: "Sara Admin",
        email: "sara.admin@example.org",
        roles: ["USER", "SUPER_ADMIN"]
    },
    observer: {sub: "p-observer", name: "Olle Observatör", email: "olle@example.org", roles: ["USER", "OBSERVER"]},
    directeur: {sub: "p-directeur", name: "Dana Directeur", email: "dana@example.org", roles: ["USER"]},
    styrgrupp: {sub: "p-styrgrupp", name: "Stina Styrgrupp", email: "stina@example.org", roles: ["USER"]},
    noaccess: {sub: "p-noaccess", name: "Nils Nekad", email: "nils@example.org", roles: []},
    // A participant: holds no role until invited by this address
    deltagare: {sub: "p-deltagare", name: "Disa Deltagare", email: "disa@example.org", roles: ["USER"]},
};
const bySub = Object.fromEntries(Object.values(PERSONAS).map(persona => [persona.sub, persona]));

const STATUSES = ["PROPOSED", "APPROVED", "ORGANISING", "OPEN", "CLOSING", "SETTLING", "ARCHIVED", "REJECTED"];
const DIRECTEUR_STEPS = ["APPROVED", "ORGANISING", "OPEN", "CLOSING", "SETTLING"];
const VISIBLE = {
    DIRECTEUR: ["APPROVED", "ORGANISING", "OPEN", "CLOSING", "SETTLING"],
    STEERING_GROUP: ["ORGANISING", "OPEN", "CLOSING"],
    PARTICIPANT: ["OPEN"],
    HELPER: ["OPEN"],
};
const SPEX = [
    {id: "1", title: "Ali Baba", year: 1956},
    {id: "2", title: "Nobel", year: 1988},
    {id: "3", title: "Snorre", year: 1974},
];

let state;
let currentPersona = "superadmin";

function resetState(guideSeed = "none") {
    state = {
        spexregisterUp: true,
        guide: createGuideState(guideSeed),
        log: createLogState(),
        meeting: createMeetingState(),
        checklist: createChecklistState(),
        catalog: createCatalogState(),
        event: createEventState(),
        budget: createBudgetState(),
        participant: createParticipantState(),
        staffing: createStaffingState(),
        material: createMaterialState(),
        closing: createClosingState(),
        news: createNewsState(),
        nextId: 100,
        revivals: [
            {
                id: "1",
                spexId: "1",
                year: 2028,
                title: "Ali Baba 2028",
                premiereDate: null,
                shows: [],
                status: "APPROVED",
                version: 0,
                history: [],
                guideVersionId: null
            },
            {
                id: "2",
                spexId: "2",
                year: 2030,
                title: "Nobel 2030",
                premiereDate: null,
                shows: [],
                status: "PROPOSED",
                version: 0,
                history: [],
                guideVersionId: null
            },
            {
                id: "3",
                spexId: "3",
                year: 2027,
                title: "Snorre 2027",
                premiereDate: "2027-03-01",
                shows: [{date: "2027-03-01", time: "19:00", venue: "Kårhuset"}],
                status: "OPEN",
                version: 0,
                history: [],
                guideVersionId: null
            },
        ],
        members: [
            {
                id: "m1",
                revivalId: "1",
                role: "DIRECTEUR",
                capabilities: [],
                email: "dana@example.org",
                sub: "p-directeur",
                version: 0
            },
            {
                id: "m2",
                revivalId: "1",
                role: "STEERING_GROUP",
                capabilities: ["FINANCE"],
                email: "stina@example.org",
                sub: "p-styrgrupp",
                version: 0
            },
        ],
    };
}

resetState();

function seedGuide(seed) {
    resetState(seed);
    if (seed === "published" || seed === "two" || seed === "draft") {
        state.revivals.forEach(revival => {
            revival.guideVersionId = "1";
        });
    }
}

/**
 * After revival 1's chapter checklists exist: an event template "Rephelg" with the quickstart's four items, and a
 * template for chapter B with one item, so adding from it is not done at creation.
 */
function seedTemplates() {
    const as = PERSONAS.superadmin;

    resolvers.RevivalChecklists(PERSONAS.styrgrupp, {id: "1", filter: null, filtered: false});
    resolvers.ChecklistTemplateCreate(as, {input: {kind: "EVENT", name: {sv: "Rephelg", en: null}}});
    resolvers.ChecklistTemplateCreate(as, {input: {kind: "CHAPTER", chapterKey: "B"}});
    const [event, chapter] = state.checklist.templates;

    [
        {text: {sv: "Utskick"}, deadline: {kind: "WEEKDAY_WEEK_BEFORE", weekday: "MONDAY"}},
        {text: {sv: "Lokaler bokade"}, deadline: {kind: "DAYS", amount: -14}},
        {text: {sv: "Allergier insamlade"}, deadline: {kind: "WORKING_DAYS", amount: -5}, defaultCapability: "FINANCE"},
        {text: {sv: "Fika"}},
    ].forEach(item => resolvers.ChecklistTemplateItemCreate(as, {input: {templateId: event.id, ...item}}));
    resolvers.ChecklistTemplateItemCreate(as, {input: {templateId: chapter.id, text: {sv: "Boka kalaslokal"}}});
}

// --- Rules, as in the server's AccessPolicy ----------------------------------------------------------------------

const roleIn = (persona, revival) =>
    state.members.find(member => member.revivalId === revival.id && member.sub === persona.sub)?.role ?? null;
const isSuperAdmin = persona => persona.roles.includes("SUPER_ADMIN");
const seesEverything = persona => isSuperAdmin(persona) || persona.roles.includes("OBSERVER");

function canSee(persona, revival) {
    if (seesEverything(persona)) {
        return true;
    }
    const role = roleIn(persona, revival);
    return !!role && (VISIBLE[role] ?? []).includes(revival.status);
}

const isVisibleDirecteur = (persona, revival) => roleIn(persona, revival) === "DIRECTEUR" && VISIBLE.DIRECTEUR.includes(revival.status);
const notArchived = revival => revival.status !== "ARCHIVED";

function titleOf(spexId, year) {
    return `${SPEX.find(spex => spex.id === String(spexId))?.title ?? "Nyuppsättning"} ${year}`;
}

function permissions(persona, revival) {
    const next = DIRECTEUR_STEPS[DIRECTEUR_STEPS.indexOf(revival.status) + 1];
    const allowedStatuses = isSuperAdmin(persona)
        ? STATUSES.filter(status => status !== revival.status)
        : isVisibleDirecteur(persona, revival) && DIRECTEUR_STEPS.includes(revival.status) && next ? [next] : [];

    return {
        __typename: "RevivalPermissions",
        canEditCore: isSuperAdmin(persona) && notArchived(revival),
        canDelete: isSuperAdmin(persona),
        canEditDetails: (isSuperAdmin(persona) || isVisibleDirecteur(persona, revival)) && notArchived(revival),
        allowedStatuses,
        canManageDirecteurs: isSuperAdmin(persona) && notArchived(revival),
        canManageSteeringGroup: (isSuperAdmin(persona) || isVisibleDirecteur(persona, revival)) && notArchived(revival),
        canWriteLog: ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival) && notArchived(revival),
        canWaiveRequirement: isVisibleDirecteur(persona, revival) && notArchived(revival),
        canSubscribeCalendar: !!roleIn(persona, revival) && canSee(persona, revival),
        ...budget.permissions(persona, revival),
        ...participants.permissions(persona, revival),
        ...staffing.permissions(persona, revival),
        ...material.permissions(persona, revival),
        ...closing.permissions(persona, revival),
    };
}

class GraphQLError extends Error {
    constructor(classification, message) {
        super(message);
        this.classification = classification;
    }
}

const forbidden = () => new GraphQLError("FORBIDDEN", "Du har inte behörighet att göra det.");

function visibleRevival(persona, id) {
    const revival = state.revivals.find(candidate => candidate.id === String(id));

    if (!revival || !canSee(persona, revival)) {
        throw new GraphQLError("NOT_FOUND", "Nyuppsättningen finns inte.");
    }
    return revival;
}

function toRevival(persona, revival) {
    const spex = SPEX.find(candidate => candidate.id === revival.spexId);
    const showEmails = isSuperAdmin(persona) || isVisibleDirecteur(persona, revival);
    // Participants see the steering group through their own page only
    const participantOnly = participants.isParticipant(persona, revival);

    return {
        __typename: "Revival",
        id: revival.id,
        year: revival.year,
        title: revival.title,
        premiereDate: revival.premiereDate,
        shows: revival.shows.map(show => ({__typename: "RevivalShow", ...show})),
        status: revival.status,
        version: revival.version,
        anonymizedAt: revival.anonymizedAt ?? null,
        createdBy: "Sara Admin",
        createdAt: "2026-10-20T10:00:00Z",
        lastModifiedBy: null,
        lastModifiedAt: null,
        spex: {
            __typename: "Spex",
            id: revival.spexId,
            title: state.spexregisterUp ? spex?.title ?? null : null,
            year: state.spexregisterUp ? spex?.year ?? null : null,
            available: state.spexregisterUp,
        },
        myRole: roleIn(persona, revival),
        members: participantOnly ? [] : state.members.filter(member => member.revivalId === revival.id).map(member => ({
            __typename: "RevivalMember",
            id: member.id,
            role: member.role,
            capabilities: member.capabilities,
            state: member.sub ? "ACTIVE" : "WAITING",
            displayName: member.sub ? bySub[member.sub]?.name ?? null : null,
            email: showEmails ? member.email : null,
            invitedAt: member.invitedAt ?? null,
            version: member.version,
        })),
        guideVersion: (() => {
            const pinned = state.guide.versions.find(version => version.id === revival.guideVersionId);
            return pinned ? {
                __typename: "GuideVersionSummary",
                id: pinned.id,
                label: pinned.label,
                publishedAt: pinned.publishedAt
            } : null;
        })(),
        statusHistory: [...revival.history].reverse().map(change => ({__typename: "RevivalStatusChange", ...change})),
        permissions: permissions(persona, revival),
    };
}

function requireUser(persona) {
    if (!persona) {
        throw new GraphQLError("UNAUTHORIZED", "Du är inte inloggad.");
    }
    if (!persona.roles.includes("USER")) {
        throw forbidden();
    }
    return persona;
}

const resolvers = {
    Me(persona) {
        return {
            me: {
                __typename: "Me",
                id: persona.sub,
                displayName: persona.name,
                email: persona.email,
                globalRoles: persona.roles.filter(role => role !== "USER"),
                revivalRoles: state.revivals.filter(revival => roleIn(persona, revival) && canSee(persona, revival)).map(revival => ({
                    __typename: "RevivalRoleAssignment",
                    role: roleIn(persona, revival),
                    capabilities: [],
                    revival: {__typename: "Revival", id: revival.id, title: revival.title},
                })),
            },
        };
    },
    Revivals(persona, {status}) {
        return {
            revivals: state.revivals
                .filter(revival => canSee(persona, revival) && (!status || status.includes(revival.status)))
                .map(revival => toRevival(persona, revival)),
        };
    },
    Revival(persona, {id}) {
        return {revival: toRevival(persona, visibleRevival(persona, id))};
    },
    RevivalShell(persona, {id}) {
        return {revival: toRevival(persona, visibleRevival(persona, id))};
    },
    RevivalWorkSummary(persona, {id}) {
        const revival = visibleRevival(persona, id);
        const today = new Date().toISOString().slice(0, 10);
        const open = state.log.entries.filter(entry => entry.revivalId === revival.id && ["OPEN", "WAITING"].includes(entry.status));
        const checklists = new Set(state.checklist.checklists.filter(checklist => checklist.revivalId === revival.id && !checklist.cancelled).map(checklist => checklist.id));
        const items = state.checklist.items.filter(item => checklists.has(item.checklistId) && item.state === "OPEN");
        const meeting = state.meeting.meetings.find(candidate => candidate.revivalId === revival.id && candidate.status === "IN_PROGRESS");

        return {
            revival: {
                __typename: "Revival", id: revival.id,
                workSummary: {
                    __typename: "RevivalWorkSummary",
                    openEntries: open.length,
                    overdueEntries: open.filter(entry => entry.deadline && entry.deadline < today).length,
                    overdueChecklistItems: items.filter(item => item.deadline && item.deadline < today).length,
                    openRequiredItems: items.filter(item => item.required).length,
                    meetingInProgress: meeting ? {
                        __typename: "MeetingSummary",
                        id: meeting.id,
                        title: meeting.title,
                        date: meeting.date
                    } : null,
                    upcomingEvents: events.upcomingEvents(revival),
                },
            },
        };
    },
    SpexSearch(persona, {query}) {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
        if (!state.spexregisterUp) {
            throw new GraphQLError("SPEXREGISTER_UNAVAILABLE", "Spexregistret är inte tillgängligt just nu.");
        }
        const needle = (query ?? "").toLowerCase();
        return {
            spexSearch: SPEX.filter(spex => spex.title.toLowerCase().includes(needle)).map(spex => ({
                __typename: "Spex", ...spex,
                available: true
            }))
        };
    },
    RevivalCreate(persona, {input}) {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
        if (!state.spexregisterUp) {
            throw new GraphQLError("SPEXREGISTER_UNAVAILABLE", "Spexregistret är inte tillgängligt just nu.");
        }
        if (state.revivals.some(revival => revival.spexId === String(input.spexId) && revival.year === Number(input.year))) {
            throw new GraphQLError("BAD_REQUEST", `Det finns redan en nyuppsättning av spexet ${input.year}.`);
        }
        const revival = {
            id: String(state.nextId++),
            spexId: String(input.spexId),
            year: Number(input.year),
            title: titleOf(input.spexId, input.year),
            premiereDate: null,
            shows: [],
            status: "PROPOSED",
            version: 0,
            history: [],
            guideVersionId: state.guide.versions.filter(version => version.status === "PUBLISHED").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]?.id ?? null,
        };
        state.revivals.push(revival);
        return {revivalCreate: toRevival(persona, revival)};
    },
    RevivalUpdate(persona, {input}) {
        const revival = visibleRevival(persona, input.id);
        const core = input.spexId != null || input.year != null;
        if (!permissions(persona, revival)[core ? "canEditCore" : "canEditDetails"]) {
            throw forbidden();
        }
        if (input.version !== revival.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        if (core) {
            const spexId = String(input.spexId ?? revival.spexId);
            const year = Number(input.year ?? revival.year);
            Object.assign(revival, {spexId, year, title: titleOf(spexId, year), version: revival.version + 1});
            return {revivalUpdate: toRevival(persona, revival)};
        }
        const premiereDate = input.clearPremiereDate ? null : input.premiereDate ?? revival.premiereDate;
        const shows = (input.shows ?? revival.shows).map(show => ({
            date: show.date,
            time: show.time?.trim() || null,
            venue: show.venue?.trim() || null
        }));
        if (premiereDate && Number(premiereDate.slice(0, 4)) !== revival.year) {
            throw new GraphQLError("BAD_REQUEST", `Premiären måste ligga år ${revival.year}, nyuppsättningens år.`);
        }
        if (shows.some(show => !premiereDate || show.date < premiereDate)) {
            throw new GraphQLError("BAD_REQUEST", "Föreställningsdatum får inte ligga före premiären.");
        }
        shows.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "~").localeCompare(b.time ?? "~") || (a.venue ?? "~").localeCompare(b.venue ?? "~"));
        Object.assign(revival, {premiereDate, shows, version: revival.version + 1});
        return {revivalUpdate: toRevival(persona, revival)};
    },
    RevivalDelete(persona, {id, version}) {
        const revival = visibleRevival(persona, id);
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
        if (version !== revival.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        state.revivals = state.revivals.filter(candidate => candidate.id !== id);
        state.members = state.members.filter(member => member.revivalId !== id);
        return {revivalDelete: id};
    },
    RevivalStatusChange(persona, {input}) {
        const revival = visibleRevival(persona, input.id);
        if (revival.status !== input.from) {
            throw new GraphQLError("CONFLICT", "Statusen har ändrats av någon annan.");
        }
        if (!permissions(persona, revival).allowedStatuses.includes(input.to)) {
            throw forbidden();
        }
        revival.history.push({
            from: revival.status,
            to: input.to,
            changedBy: persona.name,
            changedAt: new Date().toISOString()
        });
        revival.status = input.to;
        revival.version += 1;
        return {revivalStatusChange: toRevival(persona, revival)};
    },
    RevivalMemberAdd(persona, {input}) {
        const revival = visibleRevival(persona, input.revivalId);
        const allowed = input.role === "DIRECTEUR" ? permissions(persona, revival).canManageDirecteurs : permissions(persona, revival).canManageSteeringGroup;
        if (!allowed) {
            throw forbidden();
        }
        const email = input.email.trim().toLowerCase();
        const person = Object.values(PERSONAS).find(candidate => candidate.email === email);
        if (state.members.some(member => member.revivalId === revival.id && (member.email === email || (person && member.sub === person.sub)))) {
            throw new GraphQLError("BAD_REQUEST", "Personen har redan en roll i nyuppsättningen.");
        }
        // An address that is no persona's stands for one with no Keycloak user: the server creates and invites it
        const member = {
            id: `m${state.nextId++}`,
            revivalId: revival.id,
            role: input.role,
            capabilities: input.capabilities ?? [],
            email,
            sub: person?.sub ?? null,
            invitedAt: person ? null : new Date().toISOString(),
            version: 0
        };
        state.members.push(member);
        return {revivalMemberAdd: toRevival(persona, revival).members.find(candidate => candidate.id === member.id)};
    },
    RevivalMemberCandidates(persona, {revivalId, query}) {
        const revival = visibleRevival(persona, revivalId);
        if (!permissions(persona, revival).canManageSteeringGroup) {
            throw forbidden();
        }
        const words = query.trim().toLowerCase();
        if (words.length < 3) {
            return {revivalMemberCandidates: []};
        }
        return {
            revivalMemberCandidates: Object.values(PERSONAS)
                .filter(candidate => `${candidate.name} ${candidate.email}`.toLowerCase().includes(words))
                .slice(0, 10)
                .map(candidate => ({
                    __typename: "MemberCandidate",
                    email: candidate.email,
                    displayName: candidate.name,
                    hasAccess: candidate.roles.includes("USER")
                })),
        };
    },
    RevivalMemberCapabilitiesSet(persona, {input}) {
        const member = state.members.find(candidate => candidate.id === input.id);
        const revival = visibleRevival(persona, member?.revivalId);
        if (!permissions(persona, revival).canManageSteeringGroup) {
            throw forbidden();
        }
        if (member.version !== input.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        Object.assign(member, {capabilities: input.capabilities, version: member.version + 1});
        return {
            revivalMemberCapabilitiesSet: {
                __typename: "RevivalMember",
                id: member.id,
                capabilities: member.capabilities,
                version: member.version
            }
        };
    },
    RevivalMemberRemove(persona, {id}) {
        const member = state.members.find(candidate => candidate.id === id);
        const revival = visibleRevival(persona, member?.revivalId);
        const allowed = member.role === "DIRECTEUR" ? permissions(persona, revival).canManageDirecteurs : permissions(persona, revival).canManageSteeringGroup;
        if (!allowed) {
            throw forbidden();
        }
        state.members = state.members.filter(candidate => candidate.id !== id);
        return {revivalMemberRemove: null};
    },
};

const logExports = {};

Object.assign(resolvers, logResolvers({
    state: () => state, GraphQLError, forbidden, roleIn, canSee, visibleRevival, personas: bySub, exports: logExports,
}));
Object.assign(resolvers, meetingResolvers({
    state: () => state, GraphQLError, forbidden, roleIn, canSee, visibleRevival, personas: bySub, log: logExports,
}));
Object.assign(resolvers, checklistResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    personas: bySub,
    log: logExports,
    isSuperAdmin,
}));

Object.assign(resolvers, guideResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    isSuperAdmin,
    seesEverything,
    roleIn,
    canSee,
    visibleRevival,
    nameOf: sub => bySub[sub]?.name ?? null,
}));

const {upcomingEvents, eventOfChecklist, seed: seedEvents, feed: calendarFeed, ...eventOperations} = eventResolvers({
    state: () => state, GraphQLError, forbidden, roleIn, canSee, visibleRevival, isSuperAdmin, resolvers,
});
const events = {upcomingEvents, eventOfChecklist};

Object.assign(resolvers, eventOperations);

// A checklist links to the event it belongs to
const checklistResolver = resolvers.Checklist;

resolvers.Checklist = (persona, variables) => {
    const result = checklistResolver(persona, variables);

    return result.checklist ? {
        ...result,
        checklist: {...result.checklist, event: eventOfChecklist(result.checklist.id)}
    } : result;
};

// The budget; an event type carries the budget lines it proposes
const budget = budgetResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    isSuperAdmin,
    seesEverything,
    log: logExports,
});

Object.assign(resolvers, budget.resolvers);

// Participants, invitations and the participant's own page
const participants = participantResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    isSuperAdmin,
    seesEverything,
    personas: bySub,
});

Object.assign(resolvers, participants.resolvers);

// Availability, staffing and mailings; it adds the participant page's events, availability and shifts
const staffing = staffingResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    isSuperAdmin,
    personas: bySub,
    participants,
    resolvers,
});

Object.assign(resolvers, staffing.resolvers);

// Materials, the inventory and the link services; it adds the participant page's materials
const material = materialResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    isSuperAdmin,
    participants,
    positions: POSITIONS,
    log: logExports,
    resolvers,
    permissions,
});

Object.assign(resolvers, material.resolvers);

// Closing: membership marks, the sync to Spexregister and anonymization
const closing = closingResolvers({
    state: () => state,
    GraphQLError,
    forbidden,
    roleIn,
    canSee,
    visibleRevival,
    isSuperAdmin,
    participants,
    positions: POSITIONS,
    log: logExports,
    resolvers,
    permissions,
});

Object.assign(resolvers, closing.resolvers);

// News on the start page, kept by the super admin, and its history
Object.assign(resolvers, newsResolvers({state: () => state, GraphQLError, forbidden, isSuperAdmin}).resolvers);

const eventTypesResolver = resolvers.EventTypes;

resolvers.EventTypes = (persona, variables) => {
    const result = eventTypesResolver(persona, variables);

    return {
        eventTypes: result.eventTypes.map(eventType => ({
            ...eventType,
            budgetLines: budget.typeLinesOf(eventType.id)
        }))
    };
};

// What holds a catalog entry, so the mock refuses to delete it as the server does
function usedCatalogIds(name) {
    if (name === "capabilities") {
        return new Set([
            ...state.members.flatMap(member => member.capabilities),
            ...state.checklist.items.map(item => item.defaultCapability),
            ...state.checklist.templateItems.map(item => item.defaultCapability),
        ].filter(Boolean));
    }

    const items = chapter => [...chapter.items, ...chapter.sections.flatMap(section => section.items)];

    return new Set([
        ...state.guide.versions.flatMap(version => version.chapters.flatMap(items)).map(item => item.type),
        ...state.guide.suggestions.map(suggestion => suggestion.proposedType),
    ].filter(Boolean));
}

Object.assign(resolvers, catalogResolvers({
    state: () => state, GraphQLError, forbidden, isSuperAdmin, used: usedCatalogIds,
}));

function operationNameOf(query) {
    const match = /\b(query|mutation)\s+([A-Za-z0-9_]+)/.exec(query);
    return match ? match[2] : null;
}

function personaOf(req) {
    const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
        return bySub[payload.sub] ?? null;
    } catch {
        return null;
    }
}

function handleGraphql(req, body, res) {
    let payload;
    try {
        payload = JSON.parse(body);
    } catch {
        res.writeHead(400).end('{"errors":[{"message":"bad json"}]}');
        return;
    }
    const op = operationNameOf(payload.query || "");
    const resolver = op && resolvers[op];
    res.writeHead(200, {"content-type": "application/json"});
    if (!resolver) {
        res.end(JSON.stringify({data: {}}));
        return;
    }
    try {
        const persona = requireUser(personaOf(req));
        res.end(JSON.stringify({data: toObjects(state.catalog, resolver(persona, payload.variables || {}))}));
    } catch (error) {
        if (error instanceof GraphQLError) {
            res.end(JSON.stringify({
                data: null,
                errors: [{message: error.message, extensions: {classification: error.classification}}]
            }));
        } else {
            console.error(error);
            res.end(JSON.stringify({
                data: null,
                errors: [{message: String(error), extensions: {classification: "INTERNAL_ERROR"}}]
            }));
        }
    }
}

// --- OIDC ----------------------------------------------------------------------------------------------------------

const oidcConfig = {
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
    token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
    userinfo_endpoint: `${ISSUER}/protocol/openid-connect/userinfo`,
    jwks_uri: `${ISSUER}/protocol/openid-connect/certs`,
    end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
};

const {privateKey, publicKey} = await generateKeyPair("RS256", {extractable: true});
const publicJwk = {...(await exportJWK(publicKey)), kid: KID, alg: "RS256", use: "sig"};
const pendingCodes = new Map();

const userClaims = persona => ({
    sub: persona.sub,
    name: persona.name,
    email: persona.email,
    email_verified: true,
    preferred_username: persona.email
});

const signJwt = (persona, claims, audience) =>
    new SignJWT(claims)
        .setProtectedHeader({alg: "RS256", kid: KID, typ: "JWT"})
        .setIssuer(ISSUER)
        .setSubject(persona.sub)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_TTL}s`)
        .sign(privateKey);

function handleAuthorize(url, res) {
    const redirectUri = url.searchParams.get("redirect_uri");
    if (!redirectUri) {
        res.writeHead(400).end("missing redirect_uri");
        return;
    }
    const code = randomUUID();
    pendingCodes.set(code, {nonce: url.searchParams.get("nonce"), persona: PERSONAS[currentPersona]});
    const target = new URL(redirectUri);
    target.searchParams.set("code", code);
    const stateParam = url.searchParams.get("state");
    if (stateParam) {
        target.searchParams.set("state", stateParam);
    }
    res.writeHead(302, {location: target.toString()}).end();
}

async function handleToken(body, res) {
    const params = new URLSearchParams(body);
    let pending = {nonce: null, persona: PERSONAS[currentPersona]};

    if (params.get("grant_type") === "authorization_code") {
        const code = params.get("code");
        if (!pendingCodes.has(code)) {
            res.writeHead(400, {"content-type": "application/json"}).end(JSON.stringify({error: "invalid_grant"}));
            return;
        }
        pending = pendingCodes.get(code);
        pendingCodes.delete(code);
    }
    const {persona, nonce} = pending;
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify({
        access_token: await signJwt(persona, {
            ...userClaims(persona),
            typ: "Bearer",
            azp: CLIENT_ID,
            resource_access: {[CLIENT_ID]: {roles: persona.roles}}
        }, "account"),
        id_token: await signJwt(persona, {...userClaims(persona), ...(nonce ? {nonce} : {})}, CLIENT_ID),
        refresh_token: `refresh-${randomUUID()}`,
        token_type: "Bearer",
        expires_in: TOKEN_TTL,
        scope: "openid profile email",
    }));
}

const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", async () => {
        const url = new URL(req.url || "", `http://localhost:${PORT}`);
        const path = url.pathname;
        const rawBody = Buffer.concat(chunks);
        const body = rawBody.toString("utf8");

        if (path.endsWith("/.well-known/openid-configuration")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(oidcConfig));
        } else if (path.endsWith("/protocol/openid-connect/certs")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({keys: [publicJwk]}));
        } else if (path.endsWith("/protocol/openid-connect/auth")) {
            handleAuthorize(url, res);
        } else if (path.endsWith("/protocol/openid-connect/token")) {
            await handleToken(body, res);
        } else if (path.endsWith("/protocol/openid-connect/userinfo")) {
            const persona = personaOf(req) ?? PERSONAS[currentPersona];
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(userClaims(persona)));
        } else if (path.endsWith("/protocol/openid-connect/logout")) {
            res.writeHead(302, {location: url.searchParams.get("post_logout_redirect_uri") || `http://localhost:${PORT}/`}).end();
        } else if (req.method === "POST" && path === "/__reset") {
            resetState();
            currentPersona = "superadmin";
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__suggest") {
            const input = JSON.parse(body);
            const version = state.guide.versions.find(candidate => candidate.status === "PUBLISHED");
            const tip = version.chapters.flatMap(chapter => chapter.sections.flatMap(section => section.items)).find(entry => entry.type === "TIP");
            resolvers.GuideSuggestionCreate(PERSONAS.styrgrupp, {
                input: {
                    ...input,
                    versionId: version.id,
                    itemKey: input.kind === "ADD" ? null : tip.key
                }
            });
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__log") {
            resolvers.LogEntryCreate(PERSONAS.styrgrupp, {input: JSON.parse(body)});
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__mail") {
            const {failOnce, waiting} = JSON.parse(body);
            state.meeting.failOnce = failOnce ?? [];
            for (let index = 0; index < (waiting ?? 0); index++) {
                state.members.push({
                    id: `m${state.nextId++}`,
                    revivalId: "1",
                    role: "STEERING_GROUP",
                    capabilities: [],
                    email: `waiting${index}@example.org`,
                    sub: null,
                    version: 0
                });
            }
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__templates") {
            seedTemplates();
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__events") {
            seedEvents();
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__budget") {
            budget.seed(JSON.parse(body || "{}"));
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__participants") {
            participants.seed(JSON.parse(body || "{}"));
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__staffing") {
            staffing.seed(JSON.parse(body || "{}"));
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__closing") {
            closing.seed(JSON.parse(body || "{}"));
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__materials") {
            material.seed(JSON.parse(body || "{}"));
            res.writeHead(204).end();
        } else if (path.startsWith("/api/") && participants.handleHttp(personaOf(req), req, path, res)) {
            // The participant's Swish QR code
        } else if (path.startsWith("/api/") && budget.handleHttp(personaOf(req), req, path, url, rawBody, res)) {
            // A receipt or the budget's Excel export
        } else if (req.method === "GET" && /^\/api\/calendar\/[^/]+\.ics$/.test(path)) {
            // No token: the link is the credential
            const ics = calendarFeed(path.slice("/api/calendar/".length, -".ics".length), url.searchParams.get("lang"), sub => bySub[sub]);
            if (ics) {
                res.writeHead(200, {
                    "Content-Type": "text/calendar; charset=utf-8",
                    "Cache-Control": "private, max-age=900"
                }).end(ics);
            } else {
                res.writeHead(404, {"Content-Type": "application/json"}).end(JSON.stringify({
                    code: "NOT_FOUND",
                    message: "Not found"
                }));
            }
        } else if (req.method === "POST" && path === "/__guide") {
            seedGuide(JSON.parse(body).seed);
            res.writeHead(204).end();
        } else if (req.method === "GET" && path.endsWith("/pdf") && path.startsWith("/api/")) {
            handleGuidePdf({
                state: () => state,
                isSuperAdmin,
                seesEverything,
                roleIn,
                canSee
            }, personaOf(req), path, url, res);
        } else if (req.method === "GET" && /^\/api\/revivals\/[^/]+\/poster$/.test(path)) {
            // Revival 1's spex has a poster (a 1×1 PNG); the others have none
            const revival = state.revivals.find(candidate => candidate.id === path.split("/")[3]);
            if (!revival || !canSee(personaOf(req), revival)) {
                res.writeHead(404, {"Content-Type": "application/json"}).end(JSON.stringify({
                    code: "NOT_FOUND",
                    message: "Not found"
                }));
            } else if (revival.id === "1") {
                res.writeHead(200, {"Content-Type": "image/png"}).end(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"));
            } else {
                res.writeHead(204).end();
            }
        } else if (req.method === "POST" && path === "/__persona") {
            currentPersona = JSON.parse(body).persona;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__spexregister") {
            state.spexregisterUp = JSON.parse(body).up;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__status") {
            const {id, status} = JSON.parse(body);
            const revival = state.revivals.find(candidate => candidate.id === id);
            revival.history.push({
                from: revival.status,
                to: status,
                changedBy: "Sara Admin",
                changedAt: new Date().toISOString()
            });
            revival.status = status;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path.includes("/api/graphql")) {
            handleGraphql(req, body, res);
        } else {
            res.writeHead(404).end();
        }
    });
});

server.listen(PORT, () => {
    console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
