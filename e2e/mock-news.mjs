// The news part of the mock backend, with the server's rules (fgv-revival-server/src/main/resources/graphql/news.graphqls),
// and the history the server reads from its audit trail (audit.graphqls), which the mock keeps for news only.

const today = () => new Date().toISOString().slice(0, 10);

export function createNewsState() {
    return {nextId: 1, news: [], history: [], nextRevision: 1};
}

const published = news => !!news.visibleFrom && news.visibleFrom <= today() && (!news.visibleTo || news.visibleTo >= today());

export function newsResolvers(ctx) {
    const {GraphQLError, forbidden, isSuperAdmin} = ctx;
    const store = () => ctx.state().news;
    const toNews = news => ({__typename: "News", ...news, published: published(news)});
    const newest = (a, b) => (a.visibleFrom === b.visibleFrom ? Number(b.id) - Number(a.id)
        : !a.visibleFrom ? -1 : !b.visibleFrom ? 1 : b.visibleFrom.localeCompare(a.visibleFrom));
    const manageable = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const valid = input => {
        const subject = (input.subject ?? "").trim();
        const text = (input.text ?? "").trim();

        if (!subject || subject.length > 255 || !text || text.length > 10000
            || (input.visibleTo && (!input.visibleFrom || input.visibleTo < input.visibleFrom))) {
            throw new GraphQLError("BAD_REQUEST", "Nyheten är inte giltig.");
        }
        return {subject, text, visibleFrom: input.visibleFrom || null, visibleTo: input.visibleTo || null};
    };
    const changeable = (id, version) => {
        const news = store().news.find(candidate => candidate.id === String(id));

        if (!news) {
            throw new GraphQLError("NOT_FOUND", "Nyheten finns inte.");
        }
        if (news.version !== version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return news;
    };
    const FIELDS = ["subject", "text", "visibleFrom", "visibleTo"];
    const record = (persona, news, revisionType, before) => store().history.push({
        id: news.id,
        revision: store().nextRevision++,
        revisionType,
        modifiedAt: new Date().toISOString(),
        modifiedBy: persona.name,
        source: "WEB",
        comment: null,
        changes: revisionType === "DEL" ? [] : FIELDS
            .filter(field => (before?.[field] ?? null) !== (news[field] ?? null))
            .map(field => ({
                field,
                kind: field.startsWith("visible") ? "DATE" : "TEXT",
                oldValue: before?.[field] ?? null,
                newValue: news[field] ?? null
            })),
    });

    return {
        resolvers: {
            News: (persona, {all, limit}) => {
                if (all) {
                    manageable(persona);
                }

                const news = store().news.filter(piece => all || published(piece)).sort(newest);

                return {news: news.slice(0, limit ?? news.length).map(toNews)};
            },
            NewsCreate: (persona, {input}) => {
                manageable(persona);

                const news = {
                    id: String(store().nextId++), ...valid(input), createdAt: new Date().toISOString(),
                    lastModifiedAt: null, version: 0
                };

                store().news.push(news);
                record(persona, news, "ADD", null);
                return {newsCreate: toNews(news)};
            },
            NewsUpdate: (persona, {id, version, input}) => {
                manageable(persona);

                const news = changeable(id, version);
                const before = {...news};

                Object.assign(news, valid(input), {version: news.version + 1, lastModifiedAt: new Date().toISOString()});
                record(persona, news, "MOD", before);
                return {newsUpdate: toNews(news)};
            },
            NewsDelete: (persona, {id, version}) => {
                manageable(persona);

                const news = changeable(id, version);

                store().news = store().news.filter(candidate => candidate !== news);
                record(persona, news, "DEL", news);
                return {newsDelete: null};
            },
            Revisions: (persona, {type, id}) => {
                if (type !== "NEWS") {
                    return {revisions: []};
                }
                manageable(persona);

                const revisions = store().history.filter(revision => revision.id === String(id));

                if (revisions.length === 0) {
                    throw new GraphQLError("NOT_FOUND", "Nyheten finns inte.");
                }
                return {revisions: revisions.toReversed().map(({id: _, ...revision}) => ({__typename: "Revision", ...revision}))};
            },
        },
    };
}
