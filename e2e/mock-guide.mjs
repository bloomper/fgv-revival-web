// The guide part of the mock backend: versions, the draft and the PDF, with the server's rules
// (specs/003-m2-guide/contracts/README.md). The guide content is fictitious. Chapters are keyed A–J in the fixture.

const KEYS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const TITLES = {
    A: "Först: godkännande och tajmning", B: "Boka lokaler och lägg fast er tidslinje", C: "Sätt budgeten",
    D: "Bygg organisationen", E: "Ordna tillgångar", F: "Repetitioner", G: "Marknadsföring och biljetter",
    H: "Föreställnings- och kalashelgen", I: "Eventuell turné", J: "Stänga nyuppsättningen",
};

let nextKey = 1;
const key = prefix => `${prefix}-${String(nextKey++).padStart(4, "0")}`;

/**
 * A fictitious version with ten chapters keyed A–J, one item of each type, and English text on some of it.
 */
export function fixtureVersion(id, {status = "PUBLISHED", label = "v1", publishedAt = "2026-11-01T10:00:00Z"} = {}) {
    let itemId = Number(id) * 1000;
    const item = (type, sv, en = null) => ({id: String(itemId++), key: key("item"), type, text: {sv, en}, version: 0});

    return {
        id: String(id),
        status,
        label: status === "PUBLISHED" ? label : null,
        note: null,
        publishedAt: status === "PUBLISHED" ? publishedAt : null,
        publishedBy: status === "PUBLISHED" ? "Sara Admin" : null,
        basedOnId: null,
        version: 0,
        introduction: {sv: "Ni funderar alltså över en nyuppsättning? **Grattis!**", en: null},
        chapters: KEYS.map((chapterKey, index) => ({
            id: `${id}-${chapterKey}`,
            key: chapterKey,
            title: {sv: TITLES[chapterKey], en: chapterKey === "A" ? "First: approval and timing" : null},
            version: 0,
            items: chapterKey === "A"
                ? [item("TEXT", "Innan något annat görs behöver ni klartecken."), item("REQUIREMENT", "Nyuppsättningen ska godkännas av JK och FGV.", "The revival must be approved by JK and FGV.")]
                : [item("TEXT", `Inledning till kapitlet ${TITLES[chapterKey]}.`)],
            sections: chapterKey === "B"
                ? [{
                    id: `${id}-B-1`, key: "sec-kalaslokal", title: {sv: "Kalaslokal", en: null}, version: 0,
                    items: [
                        item("TIP", "Kontrollera sprittillstånd i vald lokal."),
                        item("QUESTION", "Vilka datum har sittande spex?"),
                    ],
                }]
                : index === 9
                    ? [{
                        id: `${id}-J-1`,
                        key: "sec-ekonomi",
                        title: {sv: "Ekonomi", en: null},
                        version: 0,
                        items: [item("REQUIREMENT", "Ett eventuellt lån ska återbetalas.")]
                    }]
                    : [],
        })),
    };
}

export function createGuideState(seed = "none") {
    const versions = seed === "published" || seed === "two" || seed === "draft" ? [fixtureVersion(1)] : [];

    if (seed === "draft") {
        versions.push(fixtureVersion(10, {status: "DRAFT"}));
    }

    if (seed === "two") {
        const v2 = JSON.parse(JSON.stringify(versions[0]));

        Object.assign(v2, {id: "2", label: "v2", publishedAt: "2027-03-01T10:00:00Z"});
        v2.chapters.forEach(chapter => {
            chapter.id = `2-${chapter.key}`;
        });
        v2.chapters[1].sections[0].items[0].text = {
            sv: "Kontrollera sprittillstånd och ljudtillstånd i vald lokal.",
            en: null
        };
        versions.push(v2);
    }
    return {versions, nextVersionId: 20, suggestions: [], nextSuggestionId: 1};
}

const summary = version => version ? {
    __typename: "GuideVersionSummary",
    id: version.id,
    label: version.label,
    note: version.note,
    publishedAt: version.publishedAt,
    publishedBy: version.publishedBy,
    version: version.version,
} : null;
const published = guide => guide.versions.filter(version => version.status === "PUBLISHED")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function toVersion(version) {
    const items = list => list.map(entry => ({
        __typename: "GuideItem", ...entry,
        text: {__typename: "LocalizedText", ...entry.text}
    }));

    return {
        __typename: "GuideVersion",
        ...version,
        introduction: {__typename: "LocalizedText", ...version.introduction},
        basedOn: null,
        chapters: version.chapters.map(chapter => ({
            __typename: "GuideChapter", ...chapter,
            title: {__typename: "LocalizedText", ...chapter.title},
            items: items(chapter.items),
            sections: chapter.sections.map(section => ({
                __typename: "GuideSection", ...section,
                title: {__typename: "LocalizedText", ...section.title},
                items: items(section.items)
            })),
        })),
    };
}

const untranslated = version => (version.introduction.en ? 0 : 1)
    + version.chapters.reduce((sum, chapter) => sum + (chapter.title.en ? 0 : 1)
        + chapter.items.filter(entry => !entry.text.en).length
        + chapter.sections.reduce((inner, section) => inner + (section.title.en ? 0 : 1) + section.items.filter(entry => !entry.text.en).length, 0), 0);

/**
 * Resolvers by operation name, in the style of mock-backend.mjs. {@code ctx} gives the shared state and rules.
 */
export function guideResolvers(ctx) {
    const {GraphQLError, forbidden, isSuperAdmin, seesEverything, roleIn, canSee, visibleRevival} = ctx;
    const guide = () => ctx.state().guide;
    const withBase = version => ({
        ...toVersion(version),
        basedOn: summary(guide().versions.find(candidate => candidate.id === version.basedOnId))
    });

    const canRead = persona => seesEverything(persona) || ctx.state().revivals.some(revival =>
        ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival));
    const requireRead = persona => {
        if (!canRead(persona)) {
            throw forbidden();
        }
    };
    const requireManage = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const draft = () => guide().versions.find(version => version.status === "DRAFT") ?? null;
    const allowedVersions = (persona, revival) => {
        const pinned = guide().versions.find(version => version.id === revival.guideVersionId) ?? null;
        const directeur = roleIn(persona, revival) === "DIRECTEUR" && canSee(persona, revival);

        return revival.status === "ARCHIVED" ? [] : published(guide()).filter(version => version.id !== pinned?.id
            && (isSuperAdmin(persona) || (directeur && (!pinned || version.publishedAt > pinned.publishedAt))));
    };
    const notFound = () => new GraphQLError("NOT_FOUND", "Versionen av guiden finns inte.");
    const readable = (persona, id) => {
        const version = guide().versions.find(candidate => candidate.id === String(id));

        if (!version || (version.status === "DRAFT" ? !isSuperAdmin(persona) : !canRead(persona))) {
            throw notFound();
        }
        return version;
    };

    const toSuggestion = (persona, suggestion) => {
        const revival = ctx.state().revivals.find(candidate => candidate.id === suggestion.revivalId);
        const version = guide().versions.find(candidate => candidate.id === suggestion.versionId);
        const into = guide().versions.find(candidate => candidate.id === suggestion.acceptedInto);
        return {
            __typename: "GuideSuggestion", ...suggestion, mine: suggestion.authorSub === persona.sub,
            author: ctx.nameOf(suggestion.authorSub), sectionKey: suggestion.sectionKey, decidedAt: null,
            revival: {__typename: "GuideSuggestionRevival", id: revival.id, title: revival.title, year: revival.year},
            madeOn: summary(version), publishedIn: into?.status === "PUBLISHED" ? summary(into) : null,
        };
    };
    const this_start = persona => {
        requireManage(persona);
        if (draft()) {
            throw new GraphQLError("CONFLICT", "Det finns redan ett utkast.");
        }
        const latest = published(guide())[0];
        const id = String(guide().nextVersionId++);
        const copy = latest ? JSON.parse(JSON.stringify(latest)) : {
            ...fixtureVersion(id, {status: "DRAFT"}),
            introduction: {sv: "", en: null},
            chapters: []
        };

        Object.assign(copy, {
            id,
            status: "DRAFT",
            label: null,
            note: null,
            publishedAt: null,
            publishedBy: null,
            basedOnId: latest?.id ?? null,
            version: 0
        });
        let nextItemId = Number(id) * 1000;
        copy.chapters.forEach(chapter => {
            chapter.id = `${id}-${chapter.key}`;
            chapter.items.forEach(entry => {
                entry.id = String(nextItemId++);
            });
            chapter.sections.forEach((section, index) => {
                section.id = `${id}-${chapter.key}-${index}`;
                section.items.forEach(entry => {
                    entry.id = String(nextItemId++);
                });
            });
        });
        guide().versions.push(copy);
        return {__typename: "GuideDraft", draft: withBase(copy)};
    };

    return {
        GuideVersions(persona) {
            requireRead(persona);
            return {guideVersions: published(guide()).map(summary)};
        },
        GuideVersionsAdmin(persona) {
            requireManage(persona);
            return {
                guideVersions: published(guide()).map(version => {
                    const revivalCount = ctx.state().revivals.filter(revival => revival.guideVersionId === version.id).length;
                    const suggestionCount = guide().suggestions.filter(suggestion => suggestion.versionId === version.id).length;

                    return {
                        ...summary(version),
                        revivalCount,
                        suggestionCount,
                        deletable: revivalCount === 0 && suggestionCount === 0
                    };
                }),
            };
        },
        GuideVersionUpdate(persona, {input}) {
            requireManage(persona);
            const version = published(guide()).find(entry => entry.id === String(input.id));
            if (!version) {
                throw notFound();
            }
            if (input.version !== version.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            Object.assign(version, {note: input.note?.trim() || null, version: version.version + 1});
            return {guideVersionUpdate: summary(version)};
        },
        GuideVersionDelete(persona, {id, version}) {
            requireManage(persona);
            const found = published(guide()).find(entry => entry.id === String(id));
            if (!found) {
                throw notFound();
            }
            if (version !== found.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            if (ctx.state().revivals.some(revival => revival.guideVersionId === found.id) || guide().suggestions.some(suggestion => suggestion.versionId === found.id)) {
                throw new GraphQLError("BAD_REQUEST", "Versionen används av en nyuppsättning eller har förslag och kan inte tas bort.");
            }
            guide().versions = guide().versions.filter(entry => entry !== found);
            guide().versions.filter(entry => entry.basedOnId === found.id).forEach(entry => {
                entry.basedOnId = null;
            });
            return {guideVersionDelete: null};
        },
        GuideReadable(persona) {
            return {guideReadable: canRead(persona)};
        },
        GuideLatestVersion(persona) {
            requireRead(persona);
            const latest = published(guide())[0];
            return {guideLatestVersion: latest ? withBase(latest) : null};
        },
        GuideVersion(persona, {id}) {
            return {guideVersion: withBase(readable(persona, id))};
        },
        RevivalGuide(persona, {id}) {
            const revival = visibleRevival(persona, id);
            const pinned = guide().versions.find(version => version.id === revival.guideVersionId) ?? null;
            const latest = published(guide())[0] ?? null;
            const allowed = allowedVersions(persona, revival);

            return {
                revival: {
                    __typename: "Revival",
                    id: revival.id,
                    title: revival.title,
                    year: revival.year,
                    status: revival.status,
                    guideVersion: summary(pinned),
                    newerGuideVersion: latest && pinned && latest.publishedAt > pinned.publishedAt ? summary(latest) : null,
                    guideVersionHistory: [...(revival.guideHistory ?? [])].reverse(),
                    permissions: {
                        __typename: "RevivalPermissions",
                        canSuggestGuideChange: ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival) && revival.status !== "ARCHIVED",
                        guideVersionsAllowed: allowed.map(summary),
                    },
                },
            };
        },
        RevivalGuideVersionChange(persona, {input}) {
            const revival = visibleRevival(persona, input.revivalId);
            const pinned = guide().versions.find(version => version.id === revival.guideVersionId) ?? null;
            const target = published(guide()).find(version => version.id === String(input.toVersionId));

            if ((pinned?.id ?? null) !== (input.fromVersionId ?? null)) {
                throw new GraphQLError("CONFLICT", "Guideversionen har ändrats av någon annan.");
            }
            if (!target || !allowedVersions(persona, revival).some(version => version.id === target.id)) {
                throw forbidden();
            }
            revival.guideHistory = [...(revival.guideHistory ?? []), {
                __typename: "RevivalGuideVersionChange",
                fromLabel: pinned?.label ?? null,
                toLabel: target.label,
                changedBy: persona.name,
                changedAt: new Date().toISOString(),
            }];
            revival.guideVersionId = target.id;
            return {revivalGuideVersionChange: {__typename: "Revival", id: revival.id, guideVersion: summary(target)}};
        },
        GuideChanges(persona, {fromId, toId}) {
            const from = readable(persona, fromId);
            const to = readable(persona, toId);
            const ref = chapter => ({key: chapter.key, title: chapter.title});
            const snapshots = version => new Map(version.chapters.flatMap(chapter => [
                ...chapter.items.map(entry => [entry.key, {
                    chapter: ref(chapter),
                    sectionKey: null,
                    sectionTitle: null,
                    type: entry.type,
                    text: entry.text
                }]),
                ...chapter.sections.flatMap(section => section.items.map(entry => [entry.key, {
                    chapter: ref(chapter),
                    sectionKey: section.key,
                    sectionTitle: section.title,
                    type: entry.type,
                    text: entry.text
                }])),
            ]));
            const before = snapshots(from);
            const after = snapshots(to);
            const languages = (a, b) => [...(a.sv !== b.sv ? ["sv"] : []), ...((a.en ?? null) !== (b.en ?? null) ? ["en"] : [])];
            const items = [];

            for (const [key, current] of after) {
                const old = before.get(key);
                if (!old) {
                    items.push({
                        key,
                        kind: "ADDED",
                        reworded: [],
                        retyped: false,
                        moved: false,
                        before: null,
                        after: current
                    });
                    continue;
                }
                const reworded = languages(old.text, current.text);
                const retyped = old.type !== current.type;
                const moved = old.chapter.key !== current.chapter.key || old.sectionKey !== current.sectionKey;
                if (reworded.length || retyped || moved) {
                    items.push({key, kind: "CHANGED", reworded, retyped, moved, before: old, after: current});
                }
            }
            for (const [key, old] of before) {
                if (!after.has(key)) {
                    items.push({
                        key,
                        kind: "REMOVED",
                        reworded: [],
                        retyped: false,
                        moved: false,
                        before: old,
                        after: null
                    });
                }
            }
            return {
                guideChanges: {
                    from: summary(from), to: summary(to),
                    introductionChanged: languages(from.introduction, to.introduction),
                    chapters: [
                        ...to.chapters.map(chapter => {
                            const old = from.chapters.find(candidate => candidate.key === chapter.key);
                            const shared = version => version.chapters.filter(candidate => from.chapters.some(a => a.key === candidate.key) && to.chapters.some(b => b.key === candidate.key))
                                .map(candidate => candidate.key);

                            return old
                                ? {
                                    key: chapter.key,
                                    kind: "CHANGED",
                                    renamed: languages(old.title, chapter.title),
                                    moved: shared(from).indexOf(chapter.key) !== shared(to).indexOf(chapter.key),
                                    before: old.title,
                                    after: chapter.title
                                }
                                : {
                                    key: chapter.key,
                                    kind: "ADDED",
                                    renamed: [],
                                    moved: false,
                                    before: null,
                                    after: chapter.title
                                };
                        }).filter(change => change.kind === "ADDED" || change.renamed.length || change.moved),
                        ...from.chapters.filter(chapter => !to.chapters.some(candidate => candidate.key === chapter.key))
                            .map(chapter => ({
                                key: chapter.key,
                                kind: "REMOVED",
                                renamed: [],
                                moved: false,
                                before: chapter.title,
                                after: null
                            })),
                    ],
                    sections: [],
                    items,
                },
            };
        },
        GuideSuggestions(persona, {status, revivalId}) {
            const visible = guide().suggestions.filter(suggestion => {
                const revival = ctx.state().revivals.find(candidate => candidate.id === suggestion.revivalId);
                const mayAct = ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival);
                return (seesEverything(persona) || mayAct)
                    && (!status || status.includes(suggestion.status)) && (!revivalId || suggestion.revivalId === String(revivalId));
            });
            return {guideSuggestions: [...visible].reverse().map(suggestion => toSuggestion(persona, suggestion))};
        },
        GuideSuggestionCreate(persona, {input}) {
            const revival = visibleRevival(persona, input.revivalId);
            if (!["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) || revival.status === "ARCHIVED") {
                throw forbidden();
            }
            const version = readable(persona, input.versionId);
            const item = input.itemKey ? version.chapters.flatMap(chapter => [...chapter.items.map(entry => ({
                entry,
                chapter
            })),
                ...chapter.sections.flatMap(section => section.items.map(entry => ({
                    entry,
                    chapter
                })))]).find(found => found.entry.key === input.itemKey) : null;
            const chapter = item?.chapter ?? version.chapters.find(candidate => candidate.key === input.chapterKey);
            const suggestion = {
                id: String(guide().nextSuggestionId++),
                revivalId: revival.id,
                authorSub: persona.sub,
                versionId: version.id,
                kind: input.kind,
                itemKey: input.itemKey ?? null,
                chapterKey: chapter.key,
                chapterTitle: chapter.title,
                sectionKey: input.sectionKey ?? null,
                item: item ? {
                    chapter: {key: chapter.key, title: chapter.title},
                    sectionKey: null,
                    sectionTitle: null,
                    type: item.entry.type,
                    text: item.entry.text
                } : null,
                proposedType: input.proposedType ?? null,
                proposedText: input.proposedTextSv || input.proposedTextEn ? {
                    sv: input.proposedTextSv ?? "",
                    en: input.proposedTextEn ?? null
                } : null,
                reason: input.reason ?? null,
                status: "OPEN",
                version: 0,
                decidedBy: null,
                decisionReason: null,
                acceptedInto: null,
                reopenedAt: null,
                createdAt: new Date().toISOString(),
            };
            guide().suggestions.push(suggestion);
            return {guideSuggestionCreate: toSuggestion(persona, suggestion)};
        },
        GuideSuggestionAccept(persona, {input}) {
            requireManage(persona);
            const suggestion = guide().suggestions.find(candidate => candidate.id === input.id);
            if (!draft()) {
                this_start(persona);
            }
            const current = draft();
            if (suggestion.kind === "ADD") {
                const chapter = current.chapters.find(candidate => candidate.key === suggestion.chapterKey);

                if (!chapter) {
                    throw new GraphQLError("CONFLICT", "Kapitlet har tagits bort ur utkastet.");
                }
                chapter.items.push({
                    id: String(Date.now()),
                    key: key("item"),
                    type: suggestion.proposedType,
                    text: {sv: suggestion.proposedText.sv, en: suggestion.proposedText.en},
                    version: 0
                });
            } else {
                for (const chapter of current.chapters) {
                    for (const list of [chapter.items, ...chapter.sections.map(section => section.items)]) {
                        const index = list.findIndex(entry => entry.key === suggestion.itemKey);
                        if (index >= 0) {
                            if (suggestion.kind === "REMOVE") {
                                list.splice(index, 1);
                            } else {
                                Object.assign(list[index], {
                                    type: suggestion.proposedType ?? list[index].type,
                                    text: suggestion.proposedText ?? list[index].text
                                });
                            }
                        }
                    }
                }
            }
            Object.assign(suggestion, {
                status: "ACCEPTED",
                decidedBy: persona.name,
                decisionReason: input.note ?? null,
                acceptedInto: current.id,
                version: suggestion.version + 1
            });
            return {
                guideSuggestionAccept: {
                    __typename: "GuideSuggestion",
                    id: suggestion.id,
                    status: suggestion.status
                }
            };
        },
        GuideSuggestionReject(persona, {input}) {
            requireManage(persona);
            const suggestion = guide().suggestions.find(candidate => candidate.id === input.id);
            Object.assign(suggestion, {
                status: "REJECTED",
                decidedBy: persona.name,
                decisionReason: input.reason ?? null,
                version: suggestion.version + 1
            });
            return {
                guideSuggestionReject: {
                    __typename: "GuideSuggestion",
                    id: suggestion.id,
                    status: suggestion.status
                }
            };
        },
        GuideSuggestionWithdraw(persona, {id}) {
            const suggestion = guide().suggestions.find(candidate => candidate.id === id);
            if (suggestion.authorSub !== persona.sub) {
                throw forbidden();
            }
            Object.assign(suggestion, {status: "WITHDRAWN", version: suggestion.version + 1});
            return {
                guideSuggestionWithdraw: {
                    __typename: "GuideSuggestion",
                    id: suggestion.id,
                    status: suggestion.status
                }
            };
        },
        GuideDraftStart(persona) {
            return {guideDraftStart: this_start(persona)};
        },
        GuideIntroductionUpdate(persona, {input}) {
            requireManage(persona);
            const current = draft();
            current.introduction = {sv: input.introduction.sv, en: input.introduction.en || null};
            current.version += 1;
            return {guideIntroductionUpdate: {__typename: "GuideVersion", id: current.id, version: current.version}};
        },
        GuideChapterCreate(persona, {input}) {
            requireManage(persona);
            const current = draft();
            const chapter = {
                id: `${current.id}-c${nextKey}`,
                key: key("chapter"),
                title: {sv: input.title.sv, en: input.title.en || null},
                version: 0,
                items: [],
                sections: []
            };

            current.chapters.splice(input.position ?? current.chapters.length, 0, chapter);
            return {guideChapterCreate: {__typename: "GuideChapter", id: chapter.id, key: chapter.key}};
        },
        GuideChapterMove(persona, {input}) {
            requireManage(persona);
            const current = draft();
            const index = current.chapters.findIndex(candidate => candidate.id === input.id);
            const [chapter] = current.chapters.splice(index, 1);

            current.chapters.splice(Math.min(input.position, current.chapters.length), 0, chapter);
            chapter.version += 1;
            return {guideChapterMove: {__typename: "GuideVersion", id: current.id}};
        },
        GuideChapterRemove(persona, {id}) {
            requireManage(persona);
            const current = draft();

            current.chapters = current.chapters.filter(candidate => candidate.id !== id);
            return {guideChapterRemove: null};
        },
        GuideChapterUpdate(persona, {input}) {
            requireManage(persona);
            const chapter = draft().chapters.find(candidate => candidate.id === input.id);
            chapter.title = {sv: input.title.sv, en: input.title.en || null};
            chapter.version += 1;
            return {guideChapterUpdate: {__typename: "GuideChapter", id: chapter.id, version: chapter.version}};
        },
        GuideSectionCreate(persona, {input}) {
            requireManage(persona);
            const chapter = draft().chapters.find(candidate => candidate.id === input.chapterId);
            const section = {
                id: `${chapter.id}-s${nextKey}`,
                key: key("sec"),
                title: {sv: input.title.sv, en: input.title.en || null},
                version: 0,
                items: []
            };
            chapter.sections.push(section);
            return {guideSectionCreate: {__typename: "GuideSection", id: section.id, key: section.key}};
        },
        GuideItemCreate(persona, {input}) {
            requireManage(persona);
            const chapter = draft().chapters.find(candidate => candidate.id === input.chapterId);
            const list = input.sectionId ? chapter.sections.find(section => section.id === input.sectionId).items : chapter.items;
            const entry = {
                id: String(Date.now()),
                key: key("item"),
                type: input.type,
                text: {sv: input.text.sv, en: input.text.en || null},
                version: 0
            };
            list.splice(input.position ?? list.length, 0, entry);
            return {guideItemCreate: {__typename: "GuideItem", id: entry.id, key: entry.key}};
        },
        GuideItemUpdate(persona, {input}) {
            requireManage(persona);
            const entry = draft().chapters.flatMap(chapter => [...chapter.items, ...chapter.sections.flatMap(section => section.items)]).find(candidate => candidate.id === input.id);
            if (entry.version !== input.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            Object.assign(entry, {
                type: input.type,
                text: {sv: input.text.sv, en: input.text.en || null},
                version: entry.version + 1
            });
            return {guideItemUpdate: {__typename: "GuideItem", id: entry.id, version: entry.version}};
        },
        GuideItemMove(persona, {input}) {
            requireManage(persona);
            const current = draft();
            const lists = current.chapters.flatMap(chapter => [chapter.items, ...chapter.sections.map(section => section.items)]);
            const from = lists.find(list => list.some(entry => entry.id === input.id));
            const entry = from.splice(from.findIndex(candidate => candidate.id === input.id), 1)[0];
            const chapter = current.chapters.find(candidate => candidate.id === input.chapterId);
            const to = input.sectionId ? chapter.sections.find(section => section.id === input.sectionId).items : chapter.items;
            to.splice(Math.min(input.position, to.length), 0, entry);
            entry.version += 1;
            return {guideItemMove: {__typename: "GuideChapter", id: chapter.id}};
        },
        GuideItemRemove(persona, {id}) {
            requireManage(persona);
            draft().chapters.forEach(chapter => {
                chapter.items = chapter.items.filter(entry => entry.id !== id);
                chapter.sections.forEach(section => {
                    section.items = section.items.filter(entry => entry.id !== id);
                });
            });
            return {guideItemRemove: null};
        },
        GuideSearch(persona, {versionId, query}) {
            const version = versionId ? readable(persona, versionId) : (requireRead(persona), published(guide())[0]);
            const needle = (query ?? "").trim().toLowerCase();

            if (needle.length < 2) {
                throw new GraphQLError("BAD_REQUEST", "Sök på minst 2 tecken.");
            }
            if (!version) {
                throw notFound();
            }

            const hits = [];
            const title = text => ({__typename: "LocalizedText", ...text});

            for (const chapter of version.chapters) {
                const match = (entry, section) => {
                    const sv = entry.text.sv.toLowerCase().indexOf(needle) >= 0;
                    const en = !sv && (entry.text.en ?? "").toLowerCase().indexOf(needle) >= 0;
                    if (sv || en) {
                        hits.push({
                            __typename: "GuideSearchHit",
                            kind: "ITEM",
                            chapterKey: chapter.key,
                            chapterTitle: title(chapter.title),
                            sectionKey: section?.key ?? null,
                            sectionTitle: section ? title(section.title) : null,
                            itemKey: entry.key,
                            itemType: entry.type,
                            snippet: sv ? entry.text.sv : entry.text.en,
                            matchedLanguage: sv ? "sv" : "en",
                        });
                    }
                };
                chapter.items.forEach(entry => match(entry, null));
                chapter.sections.forEach(section => section.items.forEach(entry => match(entry, section)));
            }
            return {guideSearch: hits};
        },
        GuideDraft(persona) {
            requireManage(persona);
            const current = draft();
            return {
                guideDraft: current ? {
                    __typename: "GuideDraft", draft: withBase(current),
                    acceptedSuggestionCount: guide().suggestions.filter(suggestion => suggestion.acceptedInto === current.id && suggestion.status === "ACCEPTED").length,
                    untranslatedCount: untranslated(current),
                } : null,
            };
        },
        GuideDraftPublish(persona, {input}) {
            requireManage(persona);
            const current = draft();
            if (!current || current.id !== String(input.id)) {
                throw notFound();
            }
            if (input.version !== current.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            if (current.chapters.length === 0) {
                throw new GraphQLError("BAD_REQUEST", "Utkastet är inte klart: det saknar kapitel, eller har en tom titel eller punkt.");
            }
            const label = `v${Math.max(0, ...guide().versions.map(version => /^v\d+$/.test(version.label ?? "") ? Number(version.label.slice(1)) : 0)) + 1}`;
            Object.assign(current, {
                status: "PUBLISHED",
                label,
                note: input.note?.trim() || null,
                publishedAt: new Date().toISOString(),
                publishedBy: persona.name,
                version: current.version + 1
            });
            ctx.state().checklist.templates.filter(template => template.kind === "CHAPTER" && !template.retired
                && !current.chapters.some(chapter => chapter.key === template.chapterKey)).forEach(template => {
                template.retired = true;
            });
            ctx.state().revivals.filter(revival => !revival.guideVersionId).forEach(revival => {
                revival.guideVersionId = current.id;
            });
            return {guideDraftPublish: withBase(current)};
        },
        GuideDraftDiscard(persona, {id, version}) {
            requireManage(persona);
            const current = draft();
            if (!current || current.id !== String(id)) {
                throw notFound();
            }
            if (version !== current.version) {
                throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
            }
            guide().versions = guide().versions.filter(candidate => candidate !== current);
            guide().suggestions.filter(suggestion => suggestion.acceptedInto === current.id).forEach(suggestion => {
                Object.assign(suggestion, {
                    status: "OPEN",
                    acceptedInto: null,
                    decidedBy: null,
                    decisionReason: null,
                    reopenedAt: new Date().toISOString()
                });
            });
            return {guideDraftDiscard: null};
        },
    };
}

/**
 * GET /api/guide/versions/{id}/pdf and /api/revivals/{id}/guide/pdf. A tiny fictitious PDF with the real file name.
 */
export function handleGuidePdf(ctx, persona, path, url, res) {
    const guide = ctx.state().guide;
    const lang = url.searchParams.get("lang") ?? "sv";
    const notFound = () => res.writeHead(404, {"content-type": "application/json"}).end(JSON.stringify({
        code: "NOT_FOUND",
        message: "Finns inte."
    }));
    const canRead = persona && (ctx.seesEverything(persona) || ctx.state().revivals.some(revival =>
        ["DIRECTEUR", "STEERING_GROUP"].includes(ctx.roleIn(persona, revival)) && ctx.canSee(persona, revival)));
    let version;
    let name;

    const versionMatch = /^\/api\/guide\/versions\/(\d+)\/pdf$/.exec(path);
    const revivalMatch = /^\/api\/revivals\/(\d+)\/guide\/pdf$/.exec(path);

    if (versionMatch) {
        version = guide.versions.find(candidate => candidate.id === versionMatch[1]);
        if (!version || (version.status === "DRAFT" ? !ctx.isSuperAdmin(persona) : !canRead)) {
            return notFound();
        }
        name = version.status === "DRAFT" ? (lang === "en" ? "draft" : "utkast") : version.label;
    } else if (revivalMatch) {
        const revival = ctx.state().revivals.find(candidate => candidate.id === revivalMatch[1]);
        if (!revival || !persona || !ctx.canSee(persona, revival)) {
            return notFound();
        }
        version = guide.versions.find(candidate => candidate.id === revival.guideVersionId);
        if (!version) {
            return notFound();
        }
        name = revival.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    } else {
        return notFound();
    }
    res.writeHead(200, {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="nyuppsattningsguide-${name}-${lang}.pdf"`,
    }).end("%PDF-1.4\n%fictitious\n");
}
