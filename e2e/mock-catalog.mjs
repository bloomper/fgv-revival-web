// The lists the super admin keeps in the mock backend: areas of responsibility and guide item types, with the
// server's rules (retired entries are kept, only unused ones are deleted). The rest of the mock stores their ids, as the
// server does, and toObjects() turns them into the objects GraphQL returns.

const entry = (id, sv, en, position, kind) => ({id, name: {sv, en}, position, retired: false, version: 0, ...(kind ? {kind} : {})});

export function createCatalogState() {
    return {
        nextId: 1,
        capabilities: [
            entry("FINANCE", "Ekonomi", "Finance", 0),
            entry("CATERING", "Mat", "Catering", 1),
            entry("STAFFING", "Bemanning", "Staffing", 2),
            entry("COMMS", "Kommunikation", "Communications", 3),
        ],
        itemTypes: [
            entry("TIP", "Praktiska tips", "Tip", 0, "TIP"),
            entry("REQUIREMENT", "Krav", "Requirement", 1, "REQUIREMENT"),
            entry("QUESTION", "Att ta reda på", "To find out", 2, "QUESTION"),
            entry("TEXT", "Text", "Text", 3, "TEXT"),
        ],
    };
}

/**
 * Replaces stored ids with their entries throughout a response: capabilities, default capabilities, and the types of
 * guide items, snapshots, search hits and suggestions. A guide item's text is localized, which tells its type apart
 * from a log row's.
 */
export function toObjects(catalog, value) {
    const capability = id => typeof id === "string" ? out(catalog.capabilities.find(candidate => candidate.id === id), "Capability") ?? null : id;
    const itemType = id => typeof id === "string" ? out(catalog.itemTypes.find(candidate => candidate.id === id), "GuideItemType") ?? null : id;
    const walk = node => {
        if (Array.isArray(node)) {
            return node.map(walk);
        }
        if (!node || typeof node !== "object") {
            return node;
        }
        return Object.fromEntries(Object.entries(node).map(([key, child]) => {
            if (key === "capabilities" && Array.isArray(child)) {
                return [key, child.map(capability)];
            }
            if (key === "defaultCapability") {
                return [key, capability(child)];
            }
            if (key === "itemType" || key === "proposedType" || (key === "type" && node.text && typeof node.text === "object")) {
                return [key, itemType(child)];
            }
            return [key, walk(child)];
        }));
    };

    return walk(value);
}

function out(found, typename) {
    if (!found) {
        return undefined;
    }

    const {name, ...rest} = found;

    return {__typename: typename, ...rest, name: {__typename: "LocalizedText", ...name}};
}

export function catalogResolvers({state, GraphQLError, forbidden, isSuperAdmin, used}) {
    const catalog = () => state().catalog;
    const manage = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const list = (name, includeRetired, typename) => [...catalog()[name]]
        .sort((a, b) => a.position - b.position)
        .filter(found => includeRetired || !found.retired)
        .map(found => ({...out(found, typename), inUse: used(name).has(found.id)}));
    const changeable = (name, id, version) => {
        const found = catalog()[name].find(candidate => candidate.id === id);

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Finns inte.");
        }
        if (found.version !== version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return found;
    };
    const name = (list, input, self) => {
        const sv = input.sv.trim();

        if (!sv) {
            throw new GraphQLError("BAD_REQUEST", "Namnet får inte vara tomt.");
        }
        if (list.some(other => other !== self && other.name.sv.toLowerCase() === sv.toLowerCase())) {
            throw new GraphQLError("BAD_REQUEST", `Det finns redan en med namnet ${sv}.`);
        }
        return {sv, en: input.en?.trim() || null};
    };
    const renumber = list => [...list].sort((a, b) => a.position - b.position).forEach((found, index) => {
        found.position = index;
    });
    const resolversFor = (name_, typename, prefix) => ({
        [`${prefix}Create`](persona, {input}) {
            manage(persona);
            const list_ = catalog()[name_];
            const created = {
                id: `${name_}-${catalog().nextId++}`, name: name(list_, input.name), position: list_.length, retired: false, version: 0,
                ...(input.kind ? {kind: input.kind} : {}),
            };
            list_.push(created);
            return {[`${lower(prefix)}Create`]: out(created, typename)};
        },
        [`${prefix}Update`](persona, {input}) {
            manage(persona);
            const found = changeable(name_, input.id, input.version);
            Object.assign(found, {name: name(catalog()[name_], input.name, found), version: found.version + 1});
            return {[`${lower(prefix)}Update`]: out(found, typename)};
        },
        [`${prefix}Move`](persona, {id, version, position}) {
            manage(persona);
            const found = changeable(name_, id, version);
            const ordered = [...catalog()[name_]].sort((a, b) => a.position - b.position).filter(other => other !== found);
            ordered.splice(Math.min(Math.max(position, 0), ordered.length), 0, found);
            ordered.forEach((other, index) => {
                if (other.position !== index) {
                    other.position = index;
                    other.version += 1;
                }
            });
            return {[`${lower(prefix)}Move`]: ordered.map(other => out(other, typename))};
        },
        [`${prefix}Retire`](persona, {id, version}) {
            manage(persona);
            const found = changeable(name_, id, version);
            Object.assign(found, {retired: true, version: found.version + 1});
            return {[`${lower(prefix)}Retire`]: out(found, typename)};
        },
        [`${prefix}Restore`](persona, {id, version}) {
            manage(persona);
            const found = changeable(name_, id, version);
            Object.assign(found, {retired: false, version: found.version + 1});
            return {[`${lower(prefix)}Restore`]: out(found, typename)};
        },
        [`${prefix}Delete`](persona, {id, version}) {
            manage(persona);
            changeable(name_, id, version);
            if (used(name_).has(id)) {
                throw new GraphQLError("BAD_REQUEST", "Den används och kan inte tas bort. Avveckla den i stället.");
            }
            catalog()[name_] = catalog()[name_].filter(other => other.id !== id);
            renumber(catalog()[name_]);
            return {[`${lower(prefix)}Delete`]: null};
        },
    });

    return {
        Capabilities(persona, {includeRetired}) {
            return {capabilities: list("capabilities", includeRetired, "Capability")};
        },
        GuideItemTypes(persona, {includeRetired}) {
            return {guideItemTypes: list("itemTypes", includeRetired, "GuideItemType")};
        },
        ...resolversFor("capabilities", "Capability", "Capability"),
        ...resolversFor("itemTypes", "GuideItemType", "GuideItemType"),
    };
}

const lower = text => text.charAt(0).toLowerCase() + text.slice(1);
