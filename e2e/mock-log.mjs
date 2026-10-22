// The decision log part of the mock backend, with the server's rules (specs/004-m3-log/contracts/README.md). The
// rows are fictitious.
import {recordMeetingChange} from "./mock-meeting.mjs";

const OPEN = ["OPEN", "WAITING"];

export function createLogState() {
    return {entries: [], nextId: 1, counters: {}};
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Resolvers by operation name, in the style of mock-backend.mjs. {@code ctx} gives the shared state and rules.
 */
export function logResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, personas} = ctx;
    const log = () => ctx.state().log;
    const canWrite = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival))
        && canSee(persona, revival) && revival.status !== "ARCHIVED";
    const candidates = revival => ctx.state().members
        .filter(member => member.revivalId === revival.id && member.sub && ["DIRECTEUR", "STEERING_GROUP"].includes(member.role))
        .map(member => ({__typename: "PersonRef", id: member.sub, displayName: personas[member.sub]?.name ?? null}));
    const writable = (persona, revivalId) => {
        const revival = visibleRevival(persona, revivalId);

        if (!canWrite(persona, revival)) {
            throw forbidden();
        }
        return revival;
    };
    const owner = (revival, input) => {
        if (!input || (!input.personId && !input.name)) {
            return null;
        }
        if (input.personId && input.name) {
            throw new GraphQLError("BAD_REQUEST", "Välj en medlem eller skriv ett namn, inte båda.");
        }
        if (input.personId) {
            if (!candidates(revival).some(candidate => candidate.id === input.personId)) {
                throw new GraphQLError("BAD_REQUEST", "Ansvarig måste vara directeur eller med i direktionen för nyuppsättningen.");
            }
            return {personId: input.personId};
        }
        return {name: input.name.trim()};
    };
    const toOwner = (revival, value) => value?.personId
        ? {__typename: "Owner", name: null, person: {__typename: "OwnerPerson", id: value.personId, displayName: personas[value.personId]?.name ?? null,
            active: candidates(revival).some(candidate => candidate.id === value.personId)}}
        : value?.name ? {__typename: "Owner", name: value.name, person: null} : null;
    const summary = entry => entry ? {__typename: "LogEntrySummary", id: entry.id, number: entry.number, type: entry.type, status: entry.status} : null;
    const toEntry = entry => {
        const revival = ctx.state().revivals.find(candidate => candidate.id === entry.revivalId);

        return {
            __typename: "LogEntry", ...entry, owner: toOwner(revival, entry.owner),
            overdue: OPEN.includes(entry.status) && !!entry.deadline && entry.deadline < today(),
            meeting: null, guideItem: null, checklistItem: null,
            answers: summary(log().entries.find(other => other.id === entry.answersId)),
            answeredBy: summary(log().entries.find(other => other.answersId === entry.id)),
            createdAt: "2026-10-21T10:00:00Z",
        };
    };
    const nextNumber = revivalId => {
        log().counters[revivalId] = (log().counters[revivalId] ?? 0) + 1;
        return log().counters[revivalId];
    };
    const text = value => {
        const trimmed = (value ?? "").trim();

        if (!trimmed) {
            throw new GraphQLError("BAD_REQUEST", "Texten får inte vara tom.");
        }
        return trimmed;
    };
    const create = (persona, revival, input, extra = {}) => {
        const entry = {
            id: String(log().nextId++), revivalId: revival.id, number: nextNumber(revival.id), date: input.date ?? today(), type: input.type,
            text: text(input.text), status: input.status ?? "OPEN", owner: owner(revival, input.owner), deadline: input.deadline ?? null,
            comment: input.comment?.trim() || null, tags: [...new Set((input.tags ?? []).map(tag => tag.trim()))].sort(), guideItemKey: null,
            answersId: null, origin: "MANUAL", createdBy: persona.name, version: 0, ...extra,
        };

        log().entries.push(entry);
        return entry;
    };
    const matches = (persona, filter) => entry => {
        const needle = filter?.text?.toLowerCase();

        return (!filter?.mine || entry.owner?.personId === persona.sub)
            && (!filter?.open || OPEN.includes(entry.status))
            && (!filter?.overdue || (OPEN.includes(entry.status) && entry.deadline && entry.deadline < today()))
            && (!filter?.types?.length || filter.types.includes(entry.type))
            && (!filter?.tags?.length || entry.tags.some(tag => filter.tags.includes(tag)))
            && (!needle || [entry.text, entry.comment, entry.owner?.name].some(value => value?.toLowerCase().includes(needle)));
    };

    ctx.exports.toEntry = toEntry;
    ctx.exports.toOwner = toOwner;
    ctx.exports.candidates = candidates;
    ctx.exports.owner = owner;

    return {
        RevivalLog(persona, {id, filter}) {
            const revival = visibleRevival(persona, id);
            const entries = log().entries.filter(entry => entry.revivalId === revival.id);

            return {
                revival: {
                    __typename: "Revival", id: revival.id, workingTitle: revival.workingTitle, year: revival.year, status: revival.status,
                    permissions: {
                        __typename: "RevivalPermissions", canWriteLog: canWrite(persona, revival),
                        canImportLog: roleIn(persona, revival) === "DIRECTEUR" && canSee(persona, revival) && revival.status !== "ARCHIVED"
                            && entries.length === 0 && !log().imported?.[revival.id],
                    },
                    ownerCandidates: candidates(revival),
                },
                logEntries: entries.filter(matches(persona, filter)).sort((a, b) => a.number - b.number).map(toEntry),
                logTags: [...new Set(entries.flatMap(entry => entry.tags))].sort(),
            };
        },
        RevivalLogImport(persona, {id}) {
            const revival = visibleRevival(persona, id);

            return {
                revival: {
                    __typename: "Revival", id: revival.id, workingTitle: revival.workingTitle,
                    permissions: {
                        __typename: "RevivalPermissions",
                        canImportLog: roleIn(persona, revival) === "DIRECTEUR" && canSee(persona, revival) && revival.status !== "ARCHIVED"
                            && !log().entries.some(entry => entry.revivalId === revival.id) && !log().imported?.[revival.id],
                    },
                },
                logImport: null,
            };
        },
        LogEntryCreate(persona, {input}) {
            const revival = writable(persona, input.revivalId);

            recordMeetingChange(ctx.state(), GraphQLError, input.meetingId, revival.id, null, []);
            const entry = create(persona, revival, input, {meetingId: input.meetingId ?? null});

            recordMeetingChange(ctx.state(), GraphQLError, input.meetingId, revival.id, entry.id, ["CREATED"]);
            return {logEntryCreate: toEntry(entry)};
        },
        LogEntryUpdate(persona, {input}) {
            const entry = log().entries.find(candidate => candidate.id === input.id);
            const revival = writable(persona, entry?.revivalId);

            if (entry.version !== input.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            recordMeetingChange(ctx.state(), GraphQLError, input.meetingId, revival.id, null, []);
            const ownerBefore = JSON.stringify(entry.owner);
            const statusBefore = entry.status;
            for (const field of ["type", "status", "date", "deadline", "comment"]) {
                if (input[field] !== undefined && input[field] !== null) {
                    entry[field] = input[field];
                }
            }
            if (input.text !== undefined && input.text !== null) {
                entry.text = text(input.text);
            }
            if (input.tags) {
                entry.tags = [...new Set(input.tags)].sort();
            }
            if (input.clearOwner) {
                entry.owner = null;
            } else if (input.owner) {
                entry.owner = owner(revival, input.owner);
            }
            if (input.clearDeadline) {
                entry.deadline = null;
            }
            if (input.clearComment) {
                entry.comment = null;
            }
            entry.version += 1;
            recordMeetingChange(ctx.state(), GraphQLError, input.meetingId, revival.id, entry.id, [
                ...(JSON.stringify(entry.owner) !== ownerBefore && entry.owner ? ["ASSIGNED"] : []),
                ...(entry.status !== statusBefore && ["DONE", "CANCELLED"].includes(entry.status) ? ["CLOSED"] : []),
                "UPDATED",
            ]);
            return {logEntryUpdate: toEntry(entry)};
        },
        LogEntryAnswer(persona, {input}) {
            const question = log().entries.find(candidate => candidate.id === input.questionId);
            const revival = writable(persona, question?.revivalId);

            if (question.type !== "QUESTION" || !OPEN.includes(question.status) || log().entries.some(entry => entry.answersId === question.id)) {
                throw new GraphQLError("BAD_REQUEST", "Bara en öppen fråga kan besvaras.");
            }
            const decision = create(persona, revival, {...input, type: "DECISION"}, {answersId: question.id});

            question.status = "DONE";
            question.version += 1;
            return {logEntryAnswer: {__typename: "LogEntryAnswerPayload", question: toEntry(question), decision: toEntry(decision)}};
        },
    };
}

/**
 * `POST /api/revivals/{id}/log/import[/preview]`. The mock cannot read Excel, so any upload is the fictitious 12-row
 * Ali Baba log of contracts/import.md; the owner choices are read from the `choices` part.
 */
export function handleLogImport(ctx, persona, path, body, res) {
    const {roleIn, canSee, personas} = ctx;
    const [, revivalId, action] = /^\/api\/revivals\/([^/]+)\/log\/import(\/preview)?$/.exec(path) ?? [];
    const revival = ctx.state().revivals.find(candidate => candidate.id === revivalId);
    const send = (status, json) => res.writeHead(status, {"content-type": "application/json"}).end(JSON.stringify(json));

    if (!persona || !revival || !canSee(persona, revival)) {
        send(404, {code: "NOT_FOUND", message: "Nyuppsättningen finns inte."});
        return;
    }
    if (roleIn(persona, revival) !== "DIRECTEUR" || revival.status === "ARCHIVED") {
        send(403, {code: "FORBIDDEN", message: "Du har inte behörighet att göra det."});
        return;
    }

    const log = ctx.state().log;

    if (log.entries.some(entry => entry.revivalId === revival.id) || log.imported?.[revival.id]) {
        send(409, {code: "CONFLICT", message: "Loggen har redan rader."});
        return;
    }

    const members = ctx.state().members.filter(member => member.revivalId === revival.id && member.sub)
        .map(member => ({id: member.sub, displayName: personas[member.sub]?.name ?? null}));

    if (action === "/preview") {
        send(200, {
            fileName: "logg.xlsx", layout: "ALI_BABA", sheet: "Logg", ignoredSheets: ["Checklistor", "Så funkar det"], rowCount: 12,
            byType: {DECISION: 7, TODO: 4, QUESTION: 1}, byStatus: {OPEN: 5, DONE: 7, WAITING: 0, CANCELLED: 0}, numbers: {first: 1, last: 12},
            owners: [{name: "Dana", rows: 8, suggestedPersonId: null}, {name: "Robin", rows: 4, suggestedPersonId: null}],
            members, warnings: [], guideRowsRenumbered: 0,
        });
        return;
    }

    const choices = JSON.parse(/name="choices"[^]*?\r\n\r\n([^]*?)\r\n--/.exec(body)?.[1] ?? "{}");
    const types = ["DECISION", "DECISION", "DECISION", "TODO", "DECISION", "DECISION", "QUESTION", "DECISION", "TODO", "DECISION", "TODO", "TODO"];

    for (let number = 1; number <= 12; number++) {
        const name = number <= 8 ? "Dana" : "Robin";
        const personId = choices.owners?.[name] ?? null;

        log.entries.push({
            id: String(log.nextId++), revivalId: revival.id, number, date: "2026-10-19", type: types[number - 1], text: `Rad ${number} i loggen`,
            status: [1, 2, 3, 4, 6, 8, 10].includes(number) ? "DONE" : "OPEN", owner: personId ? {personId} : {name}, deadline: null,
            comment: null, tags: [], guideItemKey: null, answersId: null, origin: "IMPORT", createdBy: persona.name, version: 0,
        });
    }
    log.counters[revival.id] = 12;
    log.imported = {...log.imported, [revival.id]: true};
    send(201, {fileName: "logg.xlsx", layout: "ALI_BABA", rowCount: 12, warnings: [], importedBy: {id: persona.sub, displayName: persona.name},
        importedAt: new Date().toISOString()});
}
