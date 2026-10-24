// The checklist part of the mock backend, with the server's rules (specs/004-m3-log/contracts/README.md). A revival's
// chapter checklists follow its pinned version on every read, as RevivalGuideSync does: one per chapter, with the
// requirements, and none for chapters the version no longer has.

export function createChecklistState() {
    return {checklists: [], items: [], templates: [], templateItems: [], nextId: 1};
}

const today = () => new Date().toISOString().slice(0, 10);
const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function applyDeadline(deadline, date) {
    const start = new Date(`${date}T00:00:00Z`);
    const isoWeekday = value => (value.getUTCDay() + 6) % 7;
    const format = value => value.toISOString().slice(0, 10);

    if (deadline.kind === "DAYS") {
        return format(new Date(start.getTime() + deadline.amount * DAY));
    }
    if (deadline.kind === "WORKING_DAYS") {
        let result = start;

        for (let remaining = Math.abs(deadline.amount); remaining > 0;) {
            result = new Date(result.getTime() + Math.sign(deadline.amount) * DAY);
            if (isoWeekday(result) < 5) {
                remaining--;
            }
        }
        return format(result);
    }
    return format(new Date(start.getTime() - (isoWeekday(start) + 7 - WEEKDAYS.indexOf(deadline.weekday)) * DAY));
}

export function checklistResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, personas, log, isSuperAdmin} = ctx;
    const store = () => ctx.state().checklist;
    const canWrite = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival))
        && canSee(persona, revival) && revival.status !== "ARCHIVED";
    const canWaive = (persona, revival) => roleIn(persona, revival) === "DIRECTEUR" && canSee(persona, revival) && revival.status !== "ARCHIVED";
    const chaptersOf = version => version?.chapters ?? [];
    const chapters = revival => chaptersOf(ctx.state().guide.versions.find(version => version.id === revival.guideVersionId));
    const chapterItems = chapter => [...chapter.items, ...chapter.sections.flatMap(section => section.items)];
    const chapterChecklists = revival => store().checklists.filter(checklist => checklist.revivalId === revival.id && checklist.kind === "CHAPTER");
    const sync = revival => {
        const version = chapters(revival);

        for (const chapter of version.filter(candidate => !chapterChecklists(revival).some(checklist => checklist.chapterKey === candidate.key))) {
            const checklist = {
                id: String(store().nextId++),
                revivalId: revival.id,
                kind: "CHAPTER",
                chapterKey: chapter.key,
                name: null,
                date: null,
                cancelled: false,
                version: 0
            };
            const template = activeTemplates().find(candidate => candidate.kind === "CHAPTER" && candidate.chapterKey === chapter.key);

            store().checklists.push(checklist);
            if (template) {
                addTemplateItems(revival, checklist, template);
            }
        }

        const byKey = new Map(chapterChecklists(revival).map(checklist => [checklist.chapterKey, checklist]));
        const own = new Set([...byKey.values()].map(checklist => checklist.id));

        for (const chapter of version) {
            for (const requirement of chapterItems(chapter).filter(item => item.type === "REQUIREMENT")) {
                const target = byKey.get(chapter.key);
                const existing = store().items.find(item => item.required && item.guideItemKey === requirement.key && own.has(item.checklistId));

                if (!existing) {
                    store().items.push({
                        id: String(store().nextId++),
                        checklistId: target.id,
                        required: true,
                        guideItemKey: requirement.key,
                        text: null,
                        state: "OPEN",
                        reason: null,
                        owner: null,
                        deadline: null,
                        comment: null,
                        version: 0,
                    });
                } else if (existing.checklistId !== target.id) {
                    existing.checklistId = target.id;
                }
            }
        }
        for (const checklist of chapterChecklists(revival).filter(candidate => !version.some(chapter => chapter.key === candidate.chapterKey))) {
            store().items = store().items.filter(item => item.checklistId !== checklist.id);
            store().checklists = store().checklists.filter(candidate => candidate !== checklist);
        }
    };
    const latestChapters = () => chaptersOf(ctx.state().guide.versions.filter(version => version.status === "PUBLISHED")
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]);
    const localized = value => value ? {__typename: "LocalizedText", en: null, ...value} : null;
    const activeTemplates = () => store().templates.filter(template => !template.retired);
    const templateItemsOf = template => store().templateItems.filter(item => item.templateId === template.id && !item.retired)
        .sort((a, b) => a.position - b.position);
    const deadlineFor = (templateItem, date) => templateItem.deadline && date ? applyDeadline(templateItem.deadline, date) : null;
    const addTemplateItems = (revival, checklist, template) => {
        const present = new Set(store().items.filter(item => item.checklistId === checklist.id).map(item => item.templateItemId));
        const holders = capability => ctx.state().members.filter(member => member.revivalId === revival.id && member.role === "STEERING_GROUP"
            && member.sub && member.capabilities.includes(capability));

        for (const templateItem of templateItemsOf(template).filter(candidate => !present.has(candidate.id))) {
            const owners = templateItem.defaultCapability ? holders(templateItem.defaultCapability) : [];

            store().items.push({
                id: String(store().nextId++),
                checklistId: checklist.id,
                required: false,
                guideItemKey: templateItem.guideItemKey,
                text: templateItem.text.sv,
                state: "OPEN",
                reason: null,
                owner: owners.length === 1 ? {personId: owners[0].sub} : null,
                deadline: deadlineFor(templateItem, checklist.date),
                deadlineManual: false,
                comment: null,
                version: 0,
                templateItemId: templateItem.id,
                defaultCapability: templateItem.defaultCapability,
            });
        }
    };
    const templateSummary = template => ({
        __typename: "ChecklistTemplateSummary", id: template.id, kind: template.kind, chapterKey: template.chapterKey,
        chapterTitle: localized(latestChapters().find(chapter => chapter.key === template.chapterKey)?.title),
        name: template.name ? {__typename: "LocalizedText", ...template.name} : null, retired: template.retired
    });
    const toTemplateItem = item => ({
        __typename: "ChecklistTemplateItem", ...item,
        text: {__typename: "LocalizedText", ...item.text},
        guideItem: null,
        deadline: item.deadline ? {__typename: "RelativeDeadline", amount: null, weekday: null, ...item.deadline} : null
    });
    // Retired items only for super admins, the most recently retired first, as on the server.
    const toTemplate = (template, persona) => ({
        ...templateSummary(template), __typename: "ChecklistTemplate", version: template.version,
        items: templateItemsOf(template).map(toTemplateItem),
        retiredItems: persona && isSuperAdmin(persona)
            ? store().templateItems.filter(item => item.templateId === template.id && item.retired).sort((a, b) => b.retiredAt - a.retiredAt).map(toTemplateItem)
            : [],
    });
    const superAdmin = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const findTemplate = (id, version) => {
        const template = store().templates.find(candidate => candidate.id === id);

        if (!template) {
            throw new GraphQLError("NOT_FOUND", "Mallen finns inte.");
        }
        if (version !== undefined && version !== template.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return template;
    };
    const findTemplateItem = (id, version) => {
        const item = store().templateItems.find(candidate => candidate.id === id);

        if (!item || version !== item.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return item;
    };
    const renumber = template => templateItemsOf(template).forEach((item, index) => {
        item.position = index;
    });
    const writableChecklist = (persona, id, version) => {
        const checklist = store().checklists.find(candidate => candidate.id === id);
        const revival = visibleRevival(persona, checklist?.revivalId);

        if (!canWrite(persona, revival)) {
            throw forbidden();
        }
        if (checklist.cancelled) {
            throw new GraphQLError("BAD_REQUEST", "Checklistan är struken.");
        }
        if (version !== checklist.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return {checklist, revival};
    };
    const checklistsOf = revival => {
        sync(revival);
        return store().checklists.filter(checklist => checklist.revivalId === revival.id);
    };
    const chapterTitle = (revival, checklist) => localized(chapters(revival).find(chapter => chapter.key === checklist.chapterKey)?.title);
    const chapterOrder = (revival, checklist) => checklist.kind === "CHAPTER" ? chapters(revival).findIndex(chapter => chapter.key === checklist.chapterKey) : Infinity;
    const guideItem = (revival, key) => chapters(revival).flatMap(chapterItems).find(item => item.key === key) ?? null;
    const overdue = item => item.state === "OPEN" && !!item.deadline && item.deadline < today();
    const itemsOf = checklist => store().items.filter(item => item.checklistId === checklist.id)
        .sort((a, b) => Number(b.required) - Number(a.required) || Number(a.id) - Number(b.id));
    const summary = checklist => {
        const items = itemsOf(checklist);
        const revival = ctx.state().revivals.find(candidate => candidate.id === checklist.revivalId);

        return {
            __typename: "ChecklistSummary",
            id: checklist.id,
            kind: checklist.kind,
            chapterKey: checklist.chapterKey ?? null,
            chapterTitle: checklist.kind === "CHAPTER" ? chapterTitle(revival, checklist) : null,
            name: checklist.name,
            date: checklist.date,
            cancelled: checklist.cancelled,
            openCount: items.filter(item => item.state === "OPEN").length,
            overdueCount: items.filter(overdue).length,
            totalCount: items.length,
        };
    };
    const toGuideItem = item => item ? {
        __typename: "GuideItem", ...item,
        text: {__typename: "LocalizedText", ...item.text}
    } : null;
    const toItem = (revival, item) => {
        const checklist = store().checklists.find(candidate => candidate.id === item.checklistId);
        const linked = item.guideItemKey ? guideItem(revival, item.guideItemKey) : null;

        return {
            __typename: "ChecklistItem", ...item,
            text: {
                __typename: "LocalizedText", ...(item.required ? linked?.text ?? {sv: "", en: null} : {
                    sv: item.text,
                    en: null
                })
            },
            stateChangedBy: item.stateChangedBy ? {
                __typename: "PersonRef",
                id: item.stateChangedBy,
                displayName: personas[item.stateChangedBy]?.name ?? null
            } : null,
            stateChangedAt: null,
            owner: log.toOwner(revival, item.owner),
            deadlineManual: item.deadlineManual ?? !!item.deadline,
            overdue: overdue(item),
            guideItem: toGuideItem(linked),
            defaultCapability: item.defaultCapability ?? null,
            logEntries: [],
            checklist: summary(checklist),
        };
    };
    const findItem = (persona, id, version) => {
        const item = store().items.find(candidate => candidate.id === id);

        if (!item) {
            throw new GraphQLError("NOT_FOUND", "Punkten finns inte.");
        }
        const checklist = store().checklists.find(candidate => candidate.id === item.checklistId);
        const revival = visibleRevival(persona, checklist.revivalId);

        if (!canWrite(persona, revival)) {
            throw forbidden();
        }
        if (checklist.cancelled) {
            throw new GraphQLError("BAD_REQUEST", "Checklistan är struken.");
        }
        if (version !== item.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return {item, revival};
    };
    const text = value => {
        const trimmed = (value ?? "").trim();

        if (!trimmed) {
            throw new GraphQLError("BAD_REQUEST", "Texten får inte vara tom.");
        }
        return trimmed;
    };
    const revivalHeader = (persona, revival) => ({
        __typename: "Revival", id: revival.id, title: revival.title,
        permissions: {
            __typename: "RevivalPermissions",
            canWriteLog: canWrite(persona, revival),
            canWaiveRequirement: canWaive(persona, revival)
        },
        ownerCandidates: log.candidates(revival),
    });

    return {
        ChecklistTemplates(persona, {includeRetired}) {
            if (!persona.roles.some(role => ["SUPER_ADMIN", "OBSERVER"].includes(role)) && !ctx.state().members.some(member => member.sub === persona.sub)) {
                throw forbidden();
            }
            return {checklistTemplates: store().templates.filter(template => !template.retired || (includeRetired && isSuperAdmin(persona))).map(template => toTemplate(template))};
        },
        EventChecklistTemplates() {
            return {checklistTemplates: activeTemplates().filter(template => template.kind === "EVENT").map(template => toTemplate(template))};
        },
        ChecklistTemplate(persona, {id}) {
            return {checklistTemplate: toTemplate(findTemplate(id), persona)};
        },
        ChecklistTemplateCreate(persona, {input}) {
            superAdmin(persona);
            if (input.kind === "CHAPTER" && !latestChapters().some(chapter => chapter.key === input.chapterKey)) {
                throw new GraphQLError("BAD_REQUEST", "Den senast publicerade guideversionen har inget sådant kapitel.");
            }
            if (input.kind === "CHAPTER" && activeTemplates().some(template => template.chapterKey === input.chapterKey)) {
                throw new GraphQLError("CONFLICT", "Kapitlet har redan en mall.");
            }
            const template = {
                id: `t${store().nextId++}`,
                kind: input.kind,
                chapterKey: input.chapterKey ?? null,
                name: input.name ?? null,
                retired: false,
                version: 0
            };

            store().templates.push(template);
            return {checklistTemplateCreate: {__typename: "ChecklistTemplate", id: template.id}};
        },
        ChecklistTemplateUpdate(persona, {input}) {
            superAdmin(persona);
            const template = findTemplate(input.id, input.version);

            Object.assign(template, {name: input.name ?? template.name, version: template.version + 1});
            return {checklistTemplateUpdate: {__typename: "ChecklistTemplate", id: template.id}};
        },
        ChecklistTemplateRetire(persona, {id, version}) {
            superAdmin(persona);
            const template = findTemplate(id, version);

            Object.assign(template, {retired: true, version: template.version + 1});
            return {checklistTemplateRetire: {__typename: "ChecklistTemplate", id}};
        },
        ChecklistTemplateRestore(persona, {id, version}) {
            superAdmin(persona);
            const template = findTemplate(id, version);

            if (!template.retired) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            if (template.kind === "CHAPTER" && !latestChapters().some(chapter => chapter.key === template.chapterKey)) {
                throw new GraphQLError("BAD_REQUEST", "Den senast publicerade guideversionen har inget sådant kapitel.");
            }
            if (template.kind === "CHAPTER" && activeTemplates().some(candidate => candidate.chapterKey === template.chapterKey)) {
                throw new GraphQLError("CONFLICT", "Kapitlet har redan en mall.");
            }
            Object.assign(template, {retired: false, version: template.version + 1});
            return {checklistTemplateRestore: {__typename: "ChecklistTemplate", id}};
        },
        ChecklistTemplateItemCreate(persona, {input}) {
            superAdmin(persona);
            const template = findTemplate(input.templateId);
            const item = {
                id: `ti${store().nextId++}`,
                templateId: template.id,
                position: templateItemsOf(template).length,
                text: input.text,
                guideItemKey: input.guideItemKey ?? null,
                defaultCapability: input.defaultCapability ?? null,
                deadline: input.deadline ?? null,
                retired: false,
                version: 0,
            };

            store().templateItems.push(item);
            return {checklistTemplateItemCreate: {__typename: "ChecklistTemplateItem", id: item.id}};
        },
        ChecklistTemplateItemUpdate(persona, {input}) {
            superAdmin(persona);
            const item = findTemplateItem(input.id, input.version);

            Object.assign(item, {
                text: input.text ?? item.text,
                guideItemKey: input.clearGuideItem ? null : input.guideItemKey ?? item.guideItemKey,
                defaultCapability: input.clearDefaultCapability ? null : input.defaultCapability ?? item.defaultCapability,
                deadline: input.clearDeadline ? null : input.deadline ?? item.deadline,
                version: item.version + 1,
            });
            return {checklistTemplateItemUpdate: {__typename: "ChecklistTemplateItem", id: item.id}};
        },
        ChecklistTemplateItemMove(persona, {id, version, position}) {
            superAdmin(persona);
            const item = findTemplateItem(id, version);
            const template = findTemplate(item.templateId);
            const items = templateItemsOf(template).filter(candidate => candidate !== item);

            items.splice(Math.max(0, Math.min(position, items.length)), 0, item);
            items.forEach((candidate, index) => {
                candidate.position = index;
            });
            item.version++;
            return {checklistTemplateItemMove: {__typename: "ChecklistTemplate", id: template.id}};
        },
        ChecklistTemplateItemRetire(persona, {id, version}) {
            superAdmin(persona);
            const item = findTemplateItem(id, version);

            Object.assign(item, {retired: true, retiredAt: store().nextId++, version: item.version + 1});
            renumber(findTemplate(item.templateId));
            return {checklistTemplateItemRetire: {__typename: "ChecklistTemplate", id: item.templateId}};
        },
        ChecklistTemplateItemRestore(persona, {id, version}) {
            superAdmin(persona);
            const item = findTemplateItem(id, version);
            const template = findTemplate(item.templateId);

            if (!item.retired) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            if (template.retired) {
                throw new GraphQLError("BAD_REQUEST", "Mallen är avvecklad och kan inte ändras.");
            }
            Object.assign(item, {
                retired: false,
                retiredAt: null,
                position: templateItemsOf(template).length,
                version: item.version + 1
            });
            return {checklistTemplateItemRestore: {__typename: "ChecklistTemplate", id: template.id}};
        },
        EventChecklistCreate(persona, {input}) {
            const revival = visibleRevival(persona, input.revivalId);

            if (!canWrite(persona, revival)) {
                throw forbidden();
            }
            checklistsOf(revival);
            const checklist = {
                id: String(store().nextId++),
                revivalId: revival.id,
                kind: "EVENT",
                chapterKey: null,
                name: text(input.name),
                date: input.date ?? null,
                cancelled: false,
                version: 0,
                templateId: input.templateId ?? null,
            };

            store().checklists.push(checklist);
            if (input.templateId) {
                addTemplateItems(revival, checklist, findTemplate(input.templateId));
            }
            return {eventChecklistCreate: {__typename: "Checklist", id: checklist.id}};
        },
        EventChecklistUpdate(persona, {input}) {
            const {checklist} = writableChecklist(persona, input.id, input.version);
            const date = input.clearDate ? null : input.date ?? checklist.date;

            if (input.name) {
                checklist.name = text(input.name);
            }
            if (date !== checklist.date) {
                checklist.date = date;
                store().items.filter(item => item.checklistId === checklist.id && item.templateItemId && !item.deadlineManual).forEach(item => {
                    item.deadline = deadlineFor(store().templateItems.find(candidate => candidate.id === item.templateItemId), date);
                });
            }
            checklist.version++;
            return {eventChecklistUpdate: {__typename: "Checklist", id: checklist.id}};
        },
        EventChecklistCancel(persona, {id, version}) {
            const {checklist} = writableChecklist(persona, id, version);

            Object.assign(checklist, {cancelled: true, version: checklist.version + 1});
            return {eventChecklistCancel: {__typename: "Checklist", id}};
        },
        ChecklistAddFromTemplate(persona, {input}) {
            const {checklist, revival} = writableChecklist(persona, input.checklistId, input.version);
            const template = input.templateId ? findTemplate(input.templateId)
                : activeTemplates().find(candidate => candidate.kind === "CHAPTER" && candidate.chapterKey === checklist.chapterKey);

            if (!template) {
                throw new GraphQLError("BAD_REQUEST", "Mallen passar inte den här checklistan.");
            }
            addTemplateItems(revival, checklist, template);
            return {checklistAddFromTemplate: {__typename: "Checklist", id: checklist.id}};
        },
        RevivalChecklists(persona, {id, filter, filtered, includeCancelled}) {
            const revival = visibleRevival(persona, id);
            const checklists = checklistsOf(revival);
            const matches = item => (!filter?.mine || item.owner?.personId === persona.sub) && (!filter?.open || item.state === "OPEN")
                && (!filter?.overdue || overdue(item)) && (!filter?.requiredOnly || item.required);

            return {
                revival: revivalHeader(persona, revival),
                checklists: checklists.filter(checklist => includeCancelled || !checklist.cancelled)
                    .sort((a, b) => chapterOrder(revival, a) - chapterOrder(revival, b) || (a.date ?? "9999").localeCompare(b.date ?? "9999")).map(summary),
                ...(filtered ? {checklistItems: checklists.flatMap(itemsOf).filter(matches).map(item => toItem(revival, item))} : {}),
            };
        },
        Checklist(persona, {id, revivalId}) {
            const revival = visibleRevival(persona, revivalId);
            const checklist = checklistsOf(revival).find(candidate => candidate.id === id);

            if (!checklist) {
                return {revival: revivalHeader(persona, revival), checklist: null};
            }
            const chapter = chapters(revival).find(candidate => candidate.key === checklist.chapterKey);

            return {
                revival: revivalHeader(persona, revival),
                checklist: {
                    __typename: "Checklist", ...checklist, revivalId: revival.id,
                    chapterTitle: chapter ? {__typename: "LocalizedText", ...chapter.title} : null,
                    tips: chapter ? chapterItems(chapter).filter(item => item.type === "TIP").map(toGuideItem) : [],
                    template: checklist.templateId ? templateSummary(findTemplate(checklist.templateId)) : null,
                    templatesAvailable: !canWrite(persona, revival) || checklist.cancelled ? [] : activeTemplates()
                        .filter(template => checklist.kind === "CHAPTER" ? template.kind === "CHAPTER" && template.chapterKey === checklist.chapterKey : template.kind === "EVENT")
                        .map(templateSummary),
                    items: itemsOf(checklist).map(item => toItem(revival, item)),
                },
            };
        },
        GuideChapterRemovalImpact(persona, {chapterKey}) {
            superAdmin(persona);
            const revivals = ctx.state().revivals.filter(revival => revival.status !== "ARCHIVED");

            revivals.forEach(sync);
            const checklists = store().checklists.filter(checklist => checklist.kind === "CHAPTER" && checklist.chapterKey === chapterKey
                && revivals.some(revival => revival.id === checklist.revivalId));
            const items = checklists.flatMap(itemsOf);

            return {
                guideChapterRemovalImpact: {
                    __typename: "GuideChapterRemovalImpact",
                    chapterKey,
                    revivalCount: checklists.length,
                    itemCount: items.length,
                    doneCount: items.filter(item => item.state === "DONE").length,
                },
            };
        },
        RevivalGuideVersionChangeImpact(persona, {id, toId}) {
            const revival = visibleRevival(persona, id);
            const target = ctx.state().guide.versions.find(version => version.id === String(toId) && version.status === "PUBLISHED");

            if (!target) {
                throw new GraphQLError("BAD_REQUEST", "Versionen är inte publicerad.");
            }
            sync(revival);
            const requirements = new Set(chaptersOf(target).flatMap(chapterItems).filter(item => item.type === "REQUIREMENT").map(item => item.key));
            const removed = chapterChecklists(revival).filter(checklist => !chaptersOf(target).some(chapter => chapter.key === checklist.chapterKey))
                .sort((a, b) => chapterOrder(revival, a) - chapterOrder(revival, b));

            return {
                revival: {
                    __typename: "Revival", id: revival.id,
                    guideVersionChangeImpact: removed.map(checklist => {
                        const items = itemsOf(checklist).filter(item => !item.required || !requirements.has(item.guideItemKey));
                        const ids = new Set(items.map(item => item.id));

                        return {
                            __typename: "ChecklistRemoval",
                            checklistId: checklist.id,
                            chapterKey: checklist.chapterKey,
                            chapterTitle: chapterTitle(revival, checklist),
                            itemCount: items.length,
                            doneCount: items.filter(item => item.state === "DONE").length,
                            linkedLogEntryCount: ctx.state().log.entries.filter(entry => ids.has(entry.checklistItemId)).length,
                        };
                    }),
                },
            };
        },
        ChecklistItemCreate(persona, {input}) {
            const checklist = store().checklists.find(candidate => candidate.id === input.checklistId);

            if (!checklist) {
                throw new GraphQLError("NOT_FOUND", "Checklistan finns inte.");
            }
            const revival = visibleRevival(persona, checklist.revivalId);

            if (!canWrite(persona, revival)) {
                throw forbidden();
            }
            const item = {
                id: String(store().nextId++),
                checklistId: checklist.id,
                required: false,
                guideItemKey: input.guideItemKey ?? null,
                text: text(input.text),
                state: "OPEN",
                reason: null,
                owner: log.owner(revival, input.owner),
                deadline: input.deadline ?? null,
                comment: input.comment?.trim() || null,
                version: 0,
            };

            store().items.push(item);
            return {checklistItemCreate: {__typename: "ChecklistItem", id: item.id}};
        },
        ChecklistItemUpdate(persona, {input}) {
            const {item, revival} = findItem(persona, input.id, input.version);

            if (input.text !== undefined && input.text !== null) {
                if (item.required) {
                    throw new GraphQLError("BAD_REQUEST", "Texten i ett krav från guiden kan inte ändras.");
                }
                item.text = text(input.text);
            }
            if (input.owner || input.clearOwner) {
                item.owner = input.clearOwner ? null : log.owner(revival, input.owner);
            }
            if (input.deadline || input.clearDeadline) {
                item.deadline = input.clearDeadline ? null : input.deadline;
                item.deadlineManual = true;
            }
            if (input.comment || input.clearComment) {
                item.comment = input.clearComment ? null : input.comment.trim();
            }
            item.version++;
            return {checklistItemUpdate: {__typename: "ChecklistItem", id: item.id}};
        },
        ChecklistItemSetState(persona, {input}) {
            const {item, revival} = findItem(persona, input.id, input.version);
            const reason = input.reason?.trim() || null;

            if (input.state === "NOT_APPLICABLE" && item.required) {
                if (!canWaive(persona, revival)) {
                    throw forbidden();
                }
                if (!reason) {
                    throw new GraphQLError("BAD_REQUEST", "Skriv varför kravet inte gäller.");
                }
            }
            Object.assign(item, {
                state: input.state,
                reason: input.state === "NOT_APPLICABLE" ? reason : null,
                stateChangedBy: persona.sub,
                version: item.version + 1
            });
            return {checklistItemSetState: {__typename: "ChecklistItem", id: item.id, state: item.state}};
        },
    };
}
