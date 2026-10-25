// The reference library (library.graphqls), the application settings (settings.graphqls) and the checklist items
// assigned to a participant (checklist.graphqls) in the mock backend, with the server's rules.

export function createLibraryState() {
    return {nextId: 1, entries: [], settings: {terms: null, defaultParticipationFee: null, version: 0}};
}

const KINDS = ["VENUE", "TICKET_SERVICE", "ROLE_DESCRIPTION", "CONTACT_ROLE"];
const TEXTS = ["description", "pros", "cons", "booking", "prices", "contact"];
const ORDER = (a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.name.sv.localeCompare(b.name.sv, "sv");

export function libraryResolvers(ctx) {
    const {GraphQLError, forbidden, isSuperAdmin, roleIn, participants} = ctx;
    const store = () => ctx.state().library;
    const text = value => value ? {__typename: "LocalizedText", sv: value.sv, en: value.en ?? null} : null;
    const toEntry = entry => ({
        __typename: "LibraryEntry", ...entry, name: text(entry.name),
        ...Object.fromEntries(TEXTS.map(key => [key, text(entry[key])])),
    });
    // Whoever reads the guide: super admins, observers, and directeurs and steering group members
    const readable = persona => {
        if (!isSuperAdmin(persona) && !persona.roles.includes("OBSERVER")
            && !ctx.state().revivals.some(revival => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)))) {
            throw forbidden();
        }
    };
    const manageable = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const valid = (input, kind) => {
        const name = (input.name?.sv ?? "").trim();

        if (!name || name.length > 100 || (input.url && !/^https:\/\/\S+$/.test(input.url))) {
            throw new GraphQLError("BAD_REQUEST", "Posten är inte giltig.");
        }
        return {
            kind,
            name: {sv: name, en: input.name.en?.trim() || null},
            ...Object.fromEntries(TEXTS.map(key => [key, input[key]?.sv?.trim() ? {sv: input[key].sv.trim(), en: input[key].en?.trim() || null} : null])),
            url: input.url?.trim() || null,
        };
    };
    const changeable = (id, version) => {
        const entry = store().entries.find(candidate => candidate.id === String(id));

        if (!entry) {
            throw new GraphQLError("NOT_FOUND", "Posten finns inte.");
        }
        if (entry.version !== version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return entry;
    };
    const assigned = (persona, revivalId) => {
        const checklist = ctx.state().checklist;
        const live = new Set(checklist.checklists.filter(candidate => candidate.revivalId === revivalId && !candidate.cancelled)
            .map(candidate => candidate.id));

        return checklist.items.filter(item => live.has(item.checklistId) && item.owner?.personId === persona.sub && item.state !== "NOT_APPLICABLE");
    };
    const toAssigned = item => {
        const checklist = ctx.state().checklist.checklists.find(candidate => candidate.id === item.checklistId);

        return {
            __typename: "AssignedChecklistItem", id: item.id, text: text({sv: item.text ?? "", en: null}),
            checklistName: checklist?.name ?? null, chapterTitle: null, checklistDate: checklist?.date ?? null,
            deadline: item.deadline ?? null, overdue: false, done: item.state === "DONE", comment: item.comment ?? null,
            version: item.version,
        };
    };
    const myParticipation = ctx.resolvers.MyParticipation;

    return {
        LibraryEntries(persona, {includeRetired}) {
            readable(persona);
            return {libraryEntries: store().entries.filter(entry => includeRetired || !entry.retired).sort(ORDER).map(toEntry)};
        },
        LibraryEntryCreate(persona, {input}) {
            manageable(persona);

            const entry = {id: String(store().nextId++), ...valid(input, input.kind), retired: false, version: 0};

            store().entries.push(entry);
            return {libraryEntryCreate: toEntry(entry)};
        },
        LibraryEntryUpdate(persona, {id, version, input}) {
            manageable(persona);

            const entry = changeable(id, version);

            Object.assign(entry, valid(input, entry.kind), {version: entry.version + 1});
            return {libraryEntryUpdate: toEntry(entry)};
        },
        LibraryEntryRetire(persona, {id, version}) {
            manageable(persona);

            const entry = changeable(id, version);

            Object.assign(entry, {retired: true, version: entry.version + 1});
            return {libraryEntryRetire: toEntry(entry)};
        },
        LibraryEntryRestore(persona, {id, version}) {
            manageable(persona);

            const entry = changeable(id, version);

            Object.assign(entry, {retired: false, version: entry.version + 1});
            return {libraryEntryRestore: toEntry(entry)};
        },
        ApplicationSettings(persona) {
            manageable(persona);

            const settings = store().settings;

            return {applicationSettings: {__typename: "ApplicationSettings", ...settings, terms: text(settings.terms)}};
        },
        ApplicationSettingsUpdate(persona, {version, input}) {
            manageable(persona);

            const settings = store().settings;

            if (settings.version !== version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            Object.assign(settings, {
                terms: input.terms?.sv ? {sv: input.terms.sv, en: input.terms.en ?? null} : null,
                defaultParticipationFee: input.defaultParticipationFee ?? null,
                version: settings.version + 1,
            });
            return {applicationSettingsUpdate: {__typename: "ApplicationSettings", version: settings.version}};
        },
        // The participant page adds the checklist items assigned to them, and the application's terms
        MyParticipation(persona, variables) {
            const result = myParticipation(persona, variables);
            const terms = store().settings.terms?.sv;
            const {participant} = participants.own(persona, variables.revivalId);
            const items = participant.kind === "HELPER" ? [] : assigned(persona, variables.revivalId);

            return {
                myParticipation: {
                    ...result.myParticipation,
                    terms: terms ? [...result.myParticipation.terms, terms] : result.myParticipation.terms,
                    checklistItems: items.map(toAssigned),
                }
            };
        },
        AssignedChecklistItemSetDone(persona, {id, version, done}) {
            const item = ctx.state().checklist.items.find(candidate => candidate.id === String(id) && candidate.owner?.personId === persona.sub);
            const checklist = item && ctx.state().checklist.checklists.find(candidate => candidate.id === item.checklistId);

            if (!item || !checklist || ctx.state().revivals.find(revival => revival.id === checklist.revivalId)?.status !== "OPEN") {
                throw new GraphQLError("NOT_FOUND", "Punkten finns inte.");
            }
            if (item.version !== version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            Object.assign(item, {state: done ? "DONE" : "OPEN", stateChangedBy: persona.sub, version: item.version + 1});
            return {assignedChecklistItemSetDone: toAssigned(item)};
        },
    };
}
