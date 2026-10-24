// The closing part of the mock backend (M7): the closing signals, FGV membership marks, the participation sync to
// Spexregister and anonymization, with the server's rules (fgv-revival-server/src/main/resources/graphql/closing.graphqls).
// Spexregister's side is a set of what already exists there; a run writes two steps per poll, so the web sees it
// progress. Test data is fictitious.
import {createHash} from "node:crypto";

const OPERATIONS = ["PARTICIPATION", "TASK", "ACTOR", "MEMBERSHIP"];
const MONTHS_BEFORE_ANONYMIZING = 36;

export function createClosingState() {
    return {
        nextRunId: 1,
        runs: [],
        membershipYear: {},
        spexregisterRevivals: new Set(),
        existing: new Set(),
        failOnce: []
    };
}

export function closingResolvers(ctx) {
    const {
        GraphQLError,
        forbidden,
        roleIn,
        canSee,
        visibleRevival,
        isSuperAdmin,
        participants,
        positions,
        log,
        resolvers
    } = ctx;
    const store = () => ctx.state().closing;
    const isVisibleDirecteur = (persona, revival) => roleIn(persona, revival) === "DIRECTEUR" && canSee(persona, revival);
    const steering = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival);
    const canSync = (persona, revival) => !revival.anonymizedAt && (
        (isVisibleDirecteur(persona, revival) && ["CLOSING", "SETTLING"].includes(revival.status))
        || (isSuperAdmin(persona) && !["PROPOSED", "APPROVED", "REJECTED"].includes(revival.status)));
    const canAnonymize = (persona, revival) => !revival.anonymizedAt && (
        (isVisibleDirecteur(persona, revival) && revival.status === "SETTLING")
        || (isSuperAdmin(persona) && ["SETTLING", "ARCHIVED", "REJECTED"].includes(revival.status)));
    const canReadPreview = (persona, revival) => canSync(persona, revival) || steering(persona, revival);
    const canReadWork = (persona, revival) => ctx.permissions(persona, revival).canReadWork;

    const position = id => positions.find(candidate => candidate.id === id) ?? null;
    const yesParticipants = revival => participants.activeIn(revival)
        .filter(participant => participant.kind === "PARTICIPANT" && participant.response === "YES");
    const key = (participant, operation) => `${participant.id}:${operation}`;

    /** Each participant's operations in order, with whether Spexregister already has it. */
    function operationsOf(revival, participant) {
        const found = position(participant.positionId);
        const year = store().membershipYear[revival.id] ?? null;
        const operations = [{operation: "PARTICIPATION", detail: null}];

        if (found) {
            operations.push({operation: "TASK", detail: found.name});
            if (found.hasRole && participant.roleName) {
                operations.push({operation: "ACTOR", detail: participant.roleName});
            }
        }
        if (participant.membershipPaid && year) {
            operations.push({operation: "MEMBERSHIP", detail: String(year)});
        }
        return operations.map(operation => ({
            __typename: "SyncOperationPreview", ...operation,
            exists: store().existing.has(key(participant, operation.operation))
        }));
    }

    function preview(revival) {
        if (!ctx.state().spexregisterUp) {
            throw new GraphQLError("SPEXREGISTER_UNAVAILABLE", "Spexregistret är inte tillgängligt just nu.");
        }
        const yes = yesParticipants(revival);
        const synced = yes.filter(participant => participant.spexareId);
        const entries = synced.map(participant => ({participant, operations: operationsOf(revival, participant)}));
        const exists = store().spexregisterRevivals.has(revival.id);
        const planned = [
            ...(exists ? [] : ["REVIVAL"]),
            ...entries.flatMap(entry => entry.operations.filter(operation => !operation.exists).map(operation => `${entry.participant.id}:${operation.operation}:${operation.detail ?? ""}`)),
        ];

        return {
            exists,
            entries,
            excluded: yes.filter(participant => !participant.spexareId),
            planned,
            hash: createHash("sha256").update(JSON.stringify(planned)).digest("hex"),
        };
    }

    function toRun(run) {
        const count = status => run.steps.filter(step => step.status === status).length;

        return {
            __typename: "SyncRun",
            id: run.id,
            status: run.status,
            startedBy: {__typename: "PersonRef", id: run.startedBy.sub, displayName: run.startedBy.name},
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            total: run.steps.length,
            done: count("DONE") + count("EXISTED"),
            failed: count("FAILED"),
            failures: run.steps.filter(step => step.status === "FAILED").map(step => ({
                __typename: "SyncFailure", operation: step.operation, reason: step.reason,
                participant: step.participant ? participants.ref(step.participant) : null,
            })),
        };
    }

    const lastRun = revival => store().runs.filter(run => run.revivalId === revival.id).at(-1) ?? null;

    /** Writes the next two steps; a step listed in failOnce fails the first time. */
    function advance(run) {
        run.steps.filter(step => step.status === "PENDING").slice(0, 2).forEach(step => {
            const failing = store().failOnce.indexOf(step.operation);

            if (failing >= 0) {
                store().failOnce.splice(failing, 1);
                Object.assign(step, {status: "FAILED", reason: "REFUSED"});
            } else if (step.operation === "REVIVAL") {
                store().spexregisterRevivals.add(run.revivalId);
                step.status = "DONE";
            } else {
                store().existing.add(key(step.participant, step.operation));
                step.status = "DONE";
            }
        });
        if (!run.steps.some(step => step.status === "PENDING")) {
            run.status = run.steps.some(step => step.status === "FAILED") ? "FAILED" : "DONE";
            run.finishedAt = new Date().toISOString();
        }
    }

    function autoAnonymizeOn(revival) {
        if (!["ARCHIVED", "REJECTED"].includes(revival.status) || revival.anonymizedAt) {
            return null;
        }
        const change = [...revival.history].reverse().find(entry => entry.to === revival.status);
        const date = new Date(change?.changedAt ?? Date.now());

        date.setUTCMonth(date.getUTCMonth() + MONTHS_BEFORE_ANONYMIZING);
        return date.toISOString().slice(0, 10);
    }

    function closingOf(persona, revival) {
        const settings = ctx.state().budget.settings[revival.id];
        const budget = resolvers.RevivalBudgetSummary(persona, {id: revival.id}).revival.budget;
        const decision = ctx.state().log.entries.find(entry => entry.revivalId === revival.id && entry.type === "DECISION"
            && entry.tags.some(tag => ["överskott", "surplus"].includes(tag.toLowerCase())));
        const run = lastRun(revival);

        return {
            __typename: "ClosingStatus",
            actualResult: budget?.totals?.actualResult ?? null,
            loanAmount: settings?.loanAmount ?? null,
            loanRepaid: !!settings?.loanRepaidOn,
            surplusDecision: decision ? {
                __typename: "LogEntrySummary",
                id: decision.id,
                number: decision.number,
                type: decision.type,
                status: decision.status
            } : null,
            membershipYear: store().membershipYear[revival.id] ?? null,
            membershipsPaid: yesParticipants(revival).filter(participant => participant.membershipPaid).length,
            suggestions: ctx.state().guide.suggestions.filter(suggestion => suggestion.revivalId === revival.id).length,
            lastSync: run && toRun(run),
            anonymizedAt: revival.anonymizedAt ?? null,
            autoAnonymizeOn: autoAnonymizeOn(revival),
        };
    }

    return {
        permissions: (persona, revival) => ({
            canSync: canSync(persona, revival),
            canAnonymize: canAnonymize(persona, revival),
            canSetMembership: canSync(persona, revival),
        }),
        resolvers: {
            RevivalClosing(persona, {id}) {
                const revival = visibleRevival(persona, id);
                const readable = canReadWork(persona, revival);

                return {
                    revival: {
                        __typename: "Revival",
                        id: revival.id,
                        title: revival.title,
                        year: revival.year,
                        status: revival.status,
                        version: revival.version,
                        anonymizedAt: revival.anonymizedAt ?? null,
                        permissions: {__typename: "RevivalPermissions", ...ctx.permissions(persona, revival)},
                        ownerCandidates: log.candidates(revival),
                        closing: readable ? closingOf(persona, revival) : null,
                    },
                };
            },
            RevivalSyncSignal(persona, {id}) {
                const revival = visibleRevival(persona, id);
                const run = canReadWork(persona, revival) ? lastRun(revival) : null;

                return {
                    revival: {
                        __typename: "Revival",
                        id: revival.id,
                        closing: {__typename: "ClosingStatus", lastSync: run && toRun(run)}
                    }
                };
            },
            MembershipParticipants(persona, {revivalId}) {
                return {participants: resolvers.Participants(persona, {revivalId, includeRemoved: false}).participants};
            },
            SyncPreview(persona, {revivalId}) {
                const revival = visibleRevival(persona, revivalId);

                if (!canReadPreview(persona, revival)) {
                    throw forbidden();
                }
                const {exists, entries, excluded, hash} = preview(revival);
                const run = lastRun(revival);

                return {
                    syncPreview: {
                        __typename: "SyncPreview", revivalId: revival.id, hash, spexregisterRevivalExists: exists,
                        participants: entries.map(entry => ({
                            __typename: "SyncParticipantPreview",
                            participant: participants.ref(entry.participant),
                            operations: entry.operations
                        })),
                        excluded: excluded.map(participants.ref),
                        membershipYear: store().membershipYear[revival.id] ?? null,
                        lastRun: run && toRun(run),
                    },
                };
            },
            SyncRun(persona, {id}) {
                const run = store().runs.find(candidate => candidate.id === String(id));

                if (!run) {
                    return {syncRun: null};
                }
                const revival = visibleRevival(persona, run.revivalId);

                if (!canReadPreview(persona, revival)) {
                    throw forbidden();
                }
                if (run.status === "RUNNING") {
                    advance(run);
                }
                return {syncRun: toRun(run)};
            },
            SyncStart(persona, {revivalId, previewHash}) {
                const revival = visibleRevival(persona, revivalId);

                if (!canSync(persona, revival)) {
                    throw forbidden();
                }
                if (lastRun(revival)?.status === "RUNNING") {
                    throw new GraphQLError("CONFLICT", "En synkning pågår redan.");
                }
                const {exists, entries, hash} = preview(revival);

                if (hash !== previewHash) {
                    throw new GraphQLError("CONFLICT", "Förhandsvisningen har ändrats. Ladda om och försök igen.");
                }
                const steps = [
                    ...(exists ? [] : [{participant: null, operation: "REVIVAL", status: "PENDING"}]),
                    ...entries.flatMap(entry => entry.operations.filter(operation => !operation.exists)
                        .sort((a, b) => OPERATIONS.indexOf(a.operation) - OPERATIONS.indexOf(b.operation))
                        .map(operation => ({
                            participant: entry.participant,
                            operation: operation.operation,
                            status: "PENDING"
                        }))),
                ];
                const run = {
                    id: `run-${store().nextRunId++}`,
                    revivalId: revival.id,
                    status: "RUNNING",
                    startedBy: persona,
                    startedAt: new Date().toISOString(),
                    finishedAt: null,
                    steps
                };

                store().runs.push(run);
                return {syncStart: toRun(run)};
            },
            MembershipSet(persona, {input}) {
                const revival = visibleRevival(persona, input.revivalId);

                if (!canSync(persona, revival)) {
                    throw forbidden();
                }
                const yes = yesParticipants(revival);

                if (input.participantIds.some(id => !yes.some(participant => participant.id === id))) {
                    throw new GraphQLError("BAD_REQUEST", "Bara deltagare som svarat ja kan markeras.");
                }
                store().membershipYear[revival.id] = Number(input.year);
                yes.forEach(participant => {
                    participant.membershipPaid = input.participantIds.includes(participant.id);
                    participant.version += 1;
                });
                return {
                    membershipSet: yes.map(participant => ({
                        __typename: "Participant",
                        id: participant.id,
                        membershipPaid: participant.membershipPaid
                    }))
                };
            },
            RevivalAnonymize(persona, {id, version, confirmation}) {
                const revival = visibleRevival(persona, id);

                if (!canAnonymize(persona, revival)) {
                    throw forbidden();
                }
                if (revival.version !== version) {
                    throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
                }
                const typed = confirmation.trim().toLowerCase();

                if (typed !== revival.title.toLowerCase() && typed !== revival.id) {
                    throw new GraphQLError("BAD_REQUEST", "Skriv nyuppsättningens titel för att bekräfta.");
                }
                const state = ctx.state();

                state.participant.participants = state.participant.participants.filter(participant => participant.revivalId !== revival.id);
                state.participant.referrals = state.participant.referrals.filter(referral => referral.revivalId !== revival.id);
                state.members = state.members.filter(member => member.revivalId !== revival.id || !["PARTICIPANT", "HELPER"].includes(member.role));
                state.log.entries.filter(entry => entry.revivalId === revival.id && entry.owner?.name).forEach(entry => {
                    entry.owner = null;
                });
                Object.assign(revival, {anonymizedAt: new Date().toISOString(), version: revival.version + 1});
                return {
                    revivalAnonymize: {
                        __typename: "Revival",
                        id: revival.id,
                        anonymizedAt: revival.anonymizedAt,
                        version: revival.version
                    }
                };
            },
        },
        /**
         * Puts revival 1 in SETTLING with Anna Andersson (Ensemble, the role Ali Baba), Bertil Bengtsson (Orchestra) and the
         * pending Disa Deltagare all answering yes, after {@code participants({people: true})}. {@code failOnce} makes the
         * first step of each listed operation fail.
         */
        seed({failOnce = []} = {}) {
            const revival = ctx.state().revivals.find(candidate => candidate.id === "1");
            const all = ctx.state().participant.participants;
            const anna = all.find(participant => participant.spexareId === "501");

            revival.history.push({
                from: revival.status,
                to: "SETTLING",
                changedBy: "Sara Admin",
                changedAt: new Date().toISOString()
            });
            revival.status = "SETTLING";
            all.filter(participant => participant.revivalId === "1").forEach(participant => {
                participant.response = "YES";
            });
            if (anna && !all.some(participant => participant.spexareId === "502")) {
                all.push({
                    ...anna,
                    id: `p${ctx.state().participant.nextId++}`,
                    spexareId: "502",
                    positionId: "T-ORK",
                    roleName: null,
                    vocalPartId: null,
                    memberId: null,
                    response: "YES"
                });
            }
            store().failOnce = [...failOnce];
        },
    };
}
