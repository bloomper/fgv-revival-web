// The materials part of the mock backend (M8): the link services the super admin keeps, a revival's materials (links,
// recognised by their host) and its inventory, with the server's rules (fgv-revival-server/src/main/resources/graphql/
// material.graphqls). Materials and items are removed, never deleted. Test data is fictitious.

const service = (id, sv, en, hosts, position) => ({id, name: {sv, en}, hosts, homeUrl: null, position, retired: false, version: 0});

export function createMaterialState() {
    return {
        nextId: 1,
        services: [
            service("SPEXFLIX", "Spexflix", null, [], 0),
            service("MANUSARKIV", "Manusarkiv", "Script archive", [], 1),
            service("SPEXIPEDIA", "Spexipedia", null, [], 2),
            service("SPEXIFY", "Spexify", null, [], 3),
            service("LATARKIV", "Låtarkiv", "Song archive", [], 4),
            service("GOOGLE_DRIVE", "Google Drive", null, ["drive.google.com", "docs.google.com"], 5),
            service("DROPBOX", "Dropbox", null, ["dropbox.com"], 6),
            service("YOUTUBE", "YouTube", null, ["youtube.com", "youtu.be"], 7),
            service("ONEDRIVE", "OneDrive", null, ["onedrive.live.com", "1drv.ms", "sharepoint.com"], 8),
        ],
        materials: [],
        items: [],
    };
}

const HOST = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

export function materialResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, isSuperAdmin, participants, positions, log} = ctx;
    const store = () => ctx.state().material;
    const steering = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival);
    const canRead = (persona, revival) => isSuperAdmin(persona) || steering(persona, revival);
    const canWrite = (persona, revival) => steering(persona, revival) && revival.status !== "ARCHIVED";
    const badRequest = message => new GraphQLError("BAD_REQUEST", message);
    const conflict = () => new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");

    const readable = (persona, revivalId) => {
        const revival = visibleRevival(persona, revivalId);

        if (!canRead(persona, revival)) {
            throw forbidden();
        }
        return revival;
    };
    const writable = (persona, revivalId) => {
        const revival = visibleRevival(persona, revivalId);

        if (!canWrite(persona, revival)) {
            throw forbidden();
        }
        return revival;
    };
    const ordered = () => [...store().services].sort((a, b) => a.position - b.position);
    const used = () => new Set(store().materials.map(material => material.serviceId).filter(Boolean));
    const toService = found => found && {__typename: "LinkService", ...found, name: {__typename: "LocalizedText", ...found.name}, inUse: used().has(found.id)};
    const toPosition = id => {
        const found = positions.find(candidate => candidate.id === id);

        return found ? {__typename: "Position", ...found} : null;
    };

    // The URL rules of M8-FR-3: an absolute https URL with a host and no credentials
    const checkUrl = url => {
        let parsed;

        try {
            parsed = new URL(url.trim());
        } catch {
            throw badRequest("Länken måste vara en hel https-adress.");
        }
        if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password || url.length > 2000) {
            throw badRequest("Länken måste vara en hel https-adress utan användarnamn eller lösenord.");
        }
        return parsed.hostname.toLowerCase();
    };
    const recognise = host => ordered().find(found => !found.retired && found.hosts.some(candidate => host === candidate || host.endsWith(`.${candidate}`))) ?? null;

    const toMaterial = material => ({
        __typename: "Material", id: material.id, title: material.title, url: material.url,
        service: toService(store().services.find(found => found.id === material.serviceId)) ?? null,
        serviceChosen: !!material.serviceChosen,
        category: material.category, visibility: material.visibility,
        positions: material.visibility === "POSITIONS" ? material.positionIds.map(toPosition).filter(Boolean) : [],
        comment: material.comment, removed: !!material.removedAt, version: material.version,
    });
    const toItem = (revival, item) => ({
        __typename: "InventoryItem", id: item.id, name: item.name, kind: item.kind, quantity: item.quantity, status: item.status,
        location: item.location, locationNote: item.locationNote, owner: log.toOwner(revival, item.owner), comment: item.comment,
        material: item.materialId ? toMaterial(store().materials.find(material => material.id === item.materialId)) : null,
        removed: !!item.removedAt, version: item.version,
    });

    const materialFields = (revival, input, existing) => {
        const title = input.title?.trim();

        if (!title || title.length > 200) {
            throw badRequest("Titeln ska ha 1–200 tecken.");
        }
        const host = checkUrl(input.url);
        const positionIds = input.visibility === "POSITIONS" ? [...new Set(input.positionIds ?? [])] : [];

        if (input.visibility === "POSITIONS" && positionIds.length === 0) {
            throw badRequest("Välj minst en befattning.");
        }
        if (positionIds.some(id => !positions.some(position => position.id === id) && !existing?.positionIds.includes(id))) {
            throw badRequest("Befattningen finns inte i Spexregistret.");
        }
        if (input.serviceId && !store().services.some(found => found.id === input.serviceId)) {
            throw badRequest("Tjänsten finns inte.");
        }
        return {
            revivalId: revival.id, title, url: input.url.trim(), serviceId: input.serviceId ?? recognise(host)?.id ?? null, serviceChosen: !!input.serviceId, category: input.category,
            visibility: input.visibility, positionIds, comment: input.comment?.trim() || null,
        };
    };
    const itemFields = (revival, input) => {
        const name = input.name?.trim();

        if (!name || name.length > 200) {
            throw badRequest("Namnet ska ha 1–200 tecken.");
        }
        if ((input.quantity ?? 1) < 1) {
            throw badRequest("Antalet ska vara minst 1.");
        }
        if (input.materialId && !store().materials.some(material => material.id === input.materialId && material.revivalId === revival.id)) {
            throw badRequest("Materialet finns inte i nyuppsättningen.");
        }
        return {
            revivalId: revival.id, name, kind: input.kind, quantity: input.quantity ?? 1, status: input.status, location: input.location ?? null,
            locationNote: input.locationNote?.trim() || null, owner: log.owner(revival, input.owner), comment: input.comment?.trim() || null,
            materialId: input.materialId ?? null,
        };
    };
    const changeable = (persona, list, id, version) => {
        const found = list.find(candidate => candidate.id === String(id));

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Finns inte.");
        }
        const revival = writable(persona, found.revivalId);

        if (found.version !== version) {
            throw conflict();
        }
        return {found, revival};
    };

    // Link services, as the other lists the super admin keeps
    const manage = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const serviceInput = (input, self) => {
        const sv = input.name.sv.trim();

        if (!sv) {
            throw badRequest("Namnet får inte vara tomt.");
        }
        if (store().services.some(other => other !== self && other.name.sv.toLowerCase() === sv.toLowerCase())) {
            throw badRequest(`Det finns redan en med namnet ${sv}.`);
        }
        if (input.hosts.length > 10 || input.hosts.some(host => !HOST.test(host))) {
            throw badRequest("Högst tio värdnamn, med små bokstäver.");
        }
        const taken = input.hosts.find(host => store().services.some(other => other !== self && !other.retired && other.hosts.includes(host)));

        if (taken) {
            throw badRequest(`${taken} hör redan till en annan tjänst.`);
        }
        if (input.homeUrl && !input.homeUrl.startsWith("https://")) {
            throw badRequest("Startsidan måste börja med https://.");
        }
        return {name: {sv, en: input.name.en?.trim() || null}, hosts: input.hosts, homeUrl: input.homeUrl || null};
    };
    const changeableService = (id, version) => {
        const found = store().services.find(candidate => candidate.id === id);

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Finns inte.");
        }
        if (found.version !== version) {
            throw conflict();
        }
        return found;
    };

    const resolvers = {
        LinkServices(persona, {includeRetired}) {
            return {linkServices: ordered().filter(found => includeRetired || !found.retired).map(toService)};
        },
        LinkServiceCreate(persona, {input}) {
            manage(persona);
            const created = {id: `ls-${store().nextId++}`, ...serviceInput(input), position: store().services.length, retired: false, version: 0};

            store().services.push(created);
            return {linkServiceCreate: toService(created)};
        },
        LinkServiceUpdate(persona, {id, version, input}) {
            manage(persona);
            const found = changeableService(id, version);

            Object.assign(found, serviceInput(input, found), {version: found.version + 1});
            return {linkServiceUpdate: toService(found)};
        },
        LinkServiceMove(persona, {id, version, position}) {
            manage(persona);
            const found = changeableService(id, version);
            const rest = ordered().filter(other => other !== found);

            rest.splice(Math.min(Math.max(position, 0), rest.length), 0, found);
            rest.forEach((other, index) => {
                if (other.position !== index) {
                    Object.assign(other, {position: index, version: other.version + 1});
                }
            });
            return {linkServiceMove: rest.map(toService)};
        },
        LinkServiceRetire(persona, {id, version}) {
            manage(persona);
            const found = changeableService(id, version);

            Object.assign(found, {retired: true, version: found.version + 1});
            return {linkServiceRetire: toService(found)};
        },
        LinkServiceRestore(persona, {id, version}) {
            manage(persona);
            const found = changeableService(id, version);

            Object.assign(found, {retired: false, version: found.version + 1});
            return {linkServiceRestore: toService(found)};
        },
        LinkServiceDelete(persona, {id, version}) {
            manage(persona);
            changeableService(id, version);
            if (used().has(id)) {
                throw badRequest("Den används och kan inte tas bort. Avveckla den i stället.");
            }
            store().services = store().services.filter(other => other.id !== id);
            return {linkServiceDelete: null};
        },

        MaterialsAccess(persona, {id}) {
            const revival = visibleRevival(persona, id);

            return {
                revival: {
                    __typename: "Revival", id: revival.id, status: revival.status,
                    permissions: {__typename: "RevivalPermissions", ...ctx.permissions(persona, revival)},
                },
            };
        },
        RevivalMaterials(persona, {id, includeRemoved}) {
            const revival = readable(persona, id);
            const removed = includeRemoved && canWrite(persona, revival);

            return {
                revival: {__typename: "Revival", id: revival.id, status: revival.status,
                    permissions: {__typename: "RevivalPermissions", canWriteMaterials: canWrite(persona, revival)}},
                materials: store().materials.filter(material => material.revivalId === revival.id && (removed || !material.removedAt)).map(toMaterial),
                linkServices: ordered().filter(found => !found.retired).map(toService),
            };
        },
        RevivalInventory(persona, {id, includeRemoved}) {
            const revival = readable(persona, id);
            const removed = includeRemoved && canWrite(persona, revival);

            return {
                revival: {__typename: "Revival", id: revival.id, status: revival.status,
                    permissions: {__typename: "RevivalPermissions", canWriteMaterials: canWrite(persona, revival)}, ownerCandidates: log.candidates(revival)},
                inventory: store().items.filter(item => item.revivalId === revival.id && (removed || !item.removedAt)).map(item => toItem(revival, item)),
                materials: store().materials.filter(material => material.revivalId === revival.id && !material.removedAt).map(toMaterial),
            };
        },
        MaterialCreate(persona, {input}) {
            const revival = writable(persona, input.revivalId);
            const created = {id: `mat-${store().nextId++}`, ...materialFields(revival, input), removedAt: null, version: 0};

            store().materials.push(created);
            return {materialCreate: toMaterial(created)};
        },
        MaterialUpdate(persona, {id, version, input}) {
            const {found, revival} = changeable(persona, store().materials, id, version);

            Object.assign(found, materialFields(revival, input, found), {version: found.version + 1});
            return {materialUpdate: toMaterial(found)};
        },
        MaterialRemove(persona, {id, version}) {
            const {found} = changeable(persona, store().materials, id, version);

            Object.assign(found, {removedAt: new Date().toISOString(), version: found.version + 1});
            return {materialRemove: toMaterial(found)};
        },
        MaterialRestore(persona, {id, version}) {
            const {found} = changeable(persona, store().materials, id, version);

            Object.assign(found, {removedAt: null, version: found.version + 1});
            return {materialRestore: toMaterial(found)};
        },
        InventoryItemCreate(persona, {input}) {
            const revival = writable(persona, input.revivalId);
            const created = {id: `inv-${store().nextId++}`, ...itemFields(revival, input), removedAt: null, version: 0};

            store().items.push(created);
            return {inventoryItemCreate: toItem(revival, created)};
        },
        InventoryItemUpdate(persona, {id, version, input}) {
            const {found, revival} = changeable(persona, store().items, id, version);

            Object.assign(found, itemFields(revival, input), {version: found.version + 1});
            return {inventoryItemUpdate: toItem(revival, found)};
        },
        InventoryItemRemove(persona, {id, version}) {
            const {found, revival} = changeable(persona, store().items, id, version);

            Object.assign(found, {removedAt: new Date().toISOString(), version: found.version + 1});
            return {inventoryItemRemove: toItem(revival, found)};
        },
        InventoryItemRestore(persona, {id, version}) {
            const {found, revival} = changeable(persona, store().items, id, version);

            Object.assign(found, {removedAt: null, version: found.version + 1});
            return {inventoryItemRestore: toItem(revival, found)};
        },
    };

    // The participant sees the materials for every participant and those for their position (M8-FR-5, FR-6)
    const myParticipation = ctx.resolvers.MyParticipation;

    resolvers.MyParticipation = (persona, variables) => {
        const result = myParticipation(persona, variables);
        const {revival, participant} = participants.own(persona, variables.revivalId);
        const materials = store().materials.filter(material => material.revivalId === revival.id && !material.removedAt
            && (material.visibility === "PARTICIPANTS" || (material.visibility === "POSITIONS" && material.positionIds.includes(participant.positionId))));

        return {myParticipation: {...result.myParticipation, materials: materials.map(toMaterial)}};
    };

    return {
        resolvers,
        permissions: (persona, revival) => ({canWriteMaterials: canWrite(persona, revival), canReadMaterials: canRead(persona, revival)}),
        /** Gives Disa Deltagare (the "deltagare" persona) a position, after {@code participants({people: true})}. */
        seed({disaPosition} = {}) {
            const disa = ctx.state().participant.participants.find(participant => participant.memberId === "m-disa");

            if (disa && disaPosition) {
                disa.positionId = disaPosition;
            }
        },
    };
}
