// The meeting part of the mock backend, with the server's rules (specs/004-m3-log/contracts/README.md). Rows changed
// with a meetingId are recorded by mock-log.mjs in the meeting's `changes`.

export function createMeetingState() {
    return {meetings: [], nextId: 1, emails: []};
}

export function meetingResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, personas, log} = ctx;
    const meetings = () => ctx.state().meeting;
    const canWrite = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival))
        && canSee(persona, revival) && revival.status !== "ARCHIVED";
    const person = sub => ({__typename: "PersonRef", id: sub, displayName: personas[sub]?.name ?? null});
    const find = (persona, id) => {
        const meeting = meetings().meetings.find(candidate => candidate.id === String(id));

        if (!meeting) {
            throw new GraphQLError("NOT_FOUND", "Mötet finns inte.");
        }
        visibleRevival(persona, meeting.revivalId);
        return meeting;
    };
    const writable = (persona, meeting, version) => {
        if (!canWrite(persona, visibleRevival(persona, meeting.revivalId))) {
            throw forbidden();
        }
        if (version !== undefined && version !== meeting.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
    };
    const entries = revivalId => ctx.state().log.entries.filter(entry => entry.revivalId === revivalId);
    const unowned = revivalId => entries(revivalId).filter(entry => entry.type === "TODO" && ["OPEN", "WAITING"].includes(entry.status)
        && !entry.owner?.personId && !entry.owner?.name);
    const summary = meeting => ({__typename: "MeetingSummary", id: meeting.id, date: meeting.date, title: meeting.title, status: meeting.status});
    const minutesRow = entry => ({__typename: "MinutesRow", entryId: entry.id, number: entry.number, type: entry.type, text: entry.text,
        owner: log.toOwner(ctx.state().revivals.find(revival => revival.id === entry.revivalId), entry.owner), deadline: entry.deadline, status: entry.status});
    const toMeeting = (persona, meeting) => {
        const revival = ctx.state().revivals.find(candidate => candidate.id === meeting.revivalId);
        const open = meeting.status === "PLANNED" || meeting.status === "IN_PROGRESS";

        return {
            __typename: "Meeting", ...meeting, attendees: meeting.attendeeIds.map(person), recorder: meeting.recorder ? person(meeting.recorder) : null,
            startedAt: null, closedAt: null,
            canEmailMinutes: meeting.status === "CLOSED" && canWrite(persona, revival),
            openEntries: open ? entries(meeting.revivalId).filter(entry => ["OPEN", "WAITING"].includes(entry.status))
                .sort((a, b) => a.number - b.number).map(log.toEntry) : [],
            entries: entries(meeting.revivalId).filter(entry => entry.meetingId === meeting.id).map(log.toEntry),
            blockingEntries: meeting.status === "IN_PROGRESS" ? unowned(meeting.revivalId).map(entry => ({__typename: "LogEntrySummary", id: entry.id,
                number: entry.number, type: entry.type, status: entry.status})) : [],
            minutes: meeting.minutes ? {
                __typename: "Minutes", ...Object.fromEntries(["decisions", "todos", "questions", "closed"].map(key => [key, meeting.minutes[key].map(minutesRow)])),
                agendaPoints: meeting.agendaPoints, attendees: meeting.attendeeIds.map(person), othersPresent: meeting.othersPresent,
                recorder: meeting.recorder ? person(meeting.recorder) : null,
            } : null,
            emails: meetings().emails.filter(email => email.meetingId === meeting.id).map(email => ({__typename: "MinutesEmail", ...email,
                sentBy: person(email.sentBy), recipients: email.recipients.map(recipient => ({__typename: "MinutesEmailRecipient", person: person(recipient.sub),
                    status: recipient.status}))})),
        };
    };
    const revivalHeader = (persona, revival) => ({
        __typename: "Revival", id: revival.id, workingTitle: revival.workingTitle,
        permissions: {__typename: "RevivalPermissions", canWriteLog: canWrite(persona, revival)}, ownerCandidates: log.candidates(revival),
    });

    return {
        RevivalMeetings(persona, {id}) {
            const revival = visibleRevival(persona, id);

            return {
                revival: revivalHeader(persona, revival),
                meetings: meetings().meetings.filter(meeting => meeting.revivalId === revival.id).reverse().map(summary),
            };
        },
        Meeting(persona, {id, revivalId}) {
            const revival = visibleRevival(persona, revivalId);
            const meeting = find(persona, id);

            return {
                revival: revivalHeader(persona, revival),
                logTags: [...new Set(entries(revival.id).flatMap(entry => entry.tags))].sort(),
                meeting: toMeeting(persona, meeting),
            };
        },
        MeetingCreate(persona, {input}) {
            const revival = visibleRevival(persona, input.revivalId);

            if (!canWrite(persona, revival)) {
                throw forbidden();
            }
            const meeting = {
                id: String(meetings().nextId++), revivalId: revival.id, date: input.date, title: input.title || null, status: "PLANNED",
                attendeeIds: input.attendeeIds ?? [], othersPresent: input.othersPresent || null, agendaPoints: input.agendaPoints ?? [],
                recorder: null, minutes: null, version: 0, changes: [],
            };

            meetings().meetings.push(meeting);
            return {meetingCreate: {__typename: "Meeting", id: meeting.id}};
        },
        MeetingUpdate(persona, {input}) {
            const meeting = find(persona, input.id);

            writable(persona, meeting, input.version);
            Object.assign(meeting, {date: input.date ?? meeting.date, title: input.title || null, attendeeIds: input.attendeeIds ?? meeting.attendeeIds,
                othersPresent: input.othersPresent || null, agendaPoints: input.agendaPoints ?? meeting.agendaPoints, version: meeting.version + 1});
            return {meetingUpdate: {__typename: "Meeting", id: meeting.id}};
        },
        MeetingStart(persona, {id, version}) {
            const meeting = find(persona, id);

            writable(persona, meeting, version);
            if (meetings().meetings.some(other => other.revivalId === meeting.revivalId && other.status === "IN_PROGRESS")) {
                throw new GraphQLError("CONFLICT", "Ett annat möte pågår redan.");
            }
            Object.assign(meeting, {status: "IN_PROGRESS", recorder: persona.sub, version: meeting.version + 1});
            return {meetingStart: {__typename: "Meeting", id: meeting.id, status: meeting.status}};
        },
        MeetingClose(persona, {id, version}) {
            const meeting = find(persona, id);

            writable(persona, meeting, version);
            const blocking = unowned(meeting.revivalId);

            if (blocking.length > 0) {
                throw new GraphQLError("BAD_REQUEST", `Rader utan ansvarig: ${blocking.map(entry => entry.number).join(", ")}.`);
            }
            const changed = kind => [...new Set(meeting.changes.filter(change => change.kind === kind).map(change => change.entryId))];
            const rows = ids => ids.map(entryId => ctx.state().log.entries.find(entry => entry.id === entryId)).sort((a, b) => a.number - b.number);
            const created = rows(changed("CREATED"));

            meeting.minutes = {
                decisions: created.filter(entry => entry.type === "DECISION"),
                todos: rows([...new Set([...changed("CREATED"), ...changed("ASSIGNED")])]).filter(entry => entry.type === "TODO"),
                questions: created.filter(entry => entry.type === "QUESTION"),
                closed: rows(changed("CLOSED")),
            };
            Object.assign(meeting, {status: "CLOSED", version: meeting.version + 1});
            return {meetingClose: {__typename: "Meeting", id: meeting.id, status: meeting.status}};
        },
        MeetingCancel(persona, {id, version}) {
            const meeting = find(persona, id);

            writable(persona, meeting, version);
            Object.assign(meeting, {status: "CANCELLED", version: meeting.version + 1});
            return {meetingCancel: {__typename: "Meeting", id: meeting.id, status: meeting.status}};
        },
        MinutesEmailSend(persona, {input}) {
            const meeting = find(persona, input.meetingId);

            writable(persona, meeting);
            const recipients = ctx.state().members.filter(member => member.revivalId === meeting.revivalId && member.sub)
                .map(member => ({sub: member.sub, status: "SENT"}));
            const email = {id: String(meetings().emails.length + 1), meetingId: meeting.id, language: input.language, sentBy: persona.sub,
                sentAt: new Date().toISOString(), waitingLeftOut: 0, recipients};

            meetings().emails.push(email);
            return {minutesEmailSend: {__typename: "MinutesEmail", id: email.id, waitingLeftOut: 0,
                recipients: recipients.map(recipient => ({__typename: "MinutesEmailRecipient", person: person(recipient.sub), status: recipient.status}))}};
        },
    };
}

/**
 * Records a row change made from a meeting in progress, as the server's MeetingRecorder does.
 */
export function recordMeetingChange(state, GraphQLError, meetingId, revivalId, entryId, kinds) {
    if (!meetingId) {
        return;
    }
    const meeting = state.meeting.meetings.find(candidate => candidate.id === meetingId && candidate.revivalId === revivalId);

    if (!meeting || meeting.status !== "IN_PROGRESS") {
        throw new GraphQLError("BAD_REQUEST", "Mötet pågår inte.");
    }
    kinds.forEach(kind => meeting.changes.push({entryId, kind}));
}
