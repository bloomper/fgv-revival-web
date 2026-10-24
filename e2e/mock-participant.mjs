// The participant part of the mock backend (M6a): Spexregister's spexare, positions and vocal parts, a revival's
// participants and helpers with invitations, responses, fees, dietary needs and referrals, and the participant's own
// page, with the server's rules (fgv-revival-server/src/main/resources/graphql/participant.graphqls). Participants log
// in with their FGV account: inviting gives them a participant role waiting on their email address, claimed by the
// persona with that address. Test data is fictitious.

export const POSITIONS = [
    {id: "T-ENS", name: "Ensemble", category: "Scen", hasRole: true},
    {id: "T-ORK", name: "Orkester", category: "Musik", hasRole: false},
    {id: "T-DEK", name: "Dekor", category: "Bakom scenen", hasRole: false},
];
const VOCAL_PARTS = [
    {id: "B1", name: "Bas 1"}, {id: "T1", name: "Tenor 1"}, {id: "S1", name: "Sopran 1"}, {id: "A1", name: "Alt 1"},
];

/** Spexregister's people. The spex ids are those of the mock's SPEX list. */
function spexare() {
    return [
        {id: "501", firstName: "Anna", lastName: "Andersson", nickName: "Spexis", graduation: "F 1990", deceased: false, spex: ["1"], history: ["Ali Baba 2008", "Ali Baba 1956"],
            contact: {email: "anna.andersson@example.org", phone: "070-111 22 33", streetAddress: "Spexgatan 1", postalCode: "412 58", city: "Göteborg"}, consent: null},
        {id: "502", firstName: "Bertil", lastName: "Bengtsson", nickName: null, graduation: "K 1995", deceased: false, spex: ["1"], history: ["Ali Baba 2008"],
            contact: {email: null, phone: "070-222 33 44"}, consent: null},
        {id: "503", firstName: "Cecilia", lastName: "Carlsson", nickName: null, graduation: "E 1960", deceased: true, spex: ["1"], history: ["Ali Baba 1956"],
            contact: {}, consent: null},
        {id: "504", firstName: "Erik", lastName: "Eriksson", nickName: "Kalle", graduation: "M 2001", deceased: false, spex: ["2"], history: ["Nobel 1988"],
            contact: {email: "erik@example.org"}, consent: null},
    ];
}

export function createParticipantState() {
    return {nextId: 1, spexare: spexare(), participants: [], referrals: [], settings: {}};
}

export function participantResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, isSuperAdmin, seesEverything, personas} = ctx;
    const store = () => ctx.state().participant;
    const members = () => ctx.state().members;
    const memberOf = (persona, revival) => members().find(member => member.revivalId === revival.id && member.sub === persona.sub);
    const steering = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival);
    const isParticipant = (persona, revival) => ["PARTICIPANT", "HELPER"].includes(roleIn(persona, revival)) && canSee(persona, revival);
    const notArchived = revival => revival.status !== "ARCHIVED";
    const canRead = (persona, revival) => isSuperAdmin(persona) || steering(persona, revival);
    const canWrite = (persona, revival) => steering(persona, revival) && notArchived(revival);
    const canReadDietary = (persona, revival) => canSee(persona, revival) && (roleIn(persona, revival) === "DIRECTEUR"
        || (roleIn(persona, revival) === "STEERING_GROUP" && (memberOf(persona, revival)?.capabilities ?? []).includes("CATERING")));
    const canWriteBudget = (persona, revival) => canSee(persona, revival) && notArchived(revival) && (roleIn(persona, revival) === "DIRECTEUR"
        || (roleIn(persona, revival) === "STEERING_GROUP" && (memberOf(persona, revival)?.capabilities ?? []).includes("FINANCE")));

    const unavailable = () => new GraphQLError("SPEXREGISTER_UNAVAILABLE", "Spexregistret är inte tillgängligt just nu.");
    const badRequest = message => new GraphQLError("BAD_REQUEST", message);
    const conflict = () => new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
    const up = () => ctx.state().spexregisterUp;
    const spexareById = id => store().spexare.find(person => person.id === String(id));

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
    const findParticipant = (persona, id, version) => {
        const participant = store().participants.find(candidate => candidate.id === String(id));

        if (!participant) {
            throw new GraphQLError("NOT_FOUND", "Deltagaren finns inte.");
        }
        writable(persona, participant.revivalId);
        if (version !== undefined && participant.version !== version) {
            throw conflict();
        }
        return participant;
    };

    const settingsOf = revivalId => store().settings[revivalId] ?? {swishNumber: null, whatsappLink: null, terms: null, version: 0};
    const revivalFee = revivalId => ctx.state().budget.settings[revivalId]?.participationFee ?? null;
    const loanOf = revivalId => ctx.state().budget.settings[revivalId]?.loanAmount ?? null;
    const feeOf = participant => participant.kind === "HELPER" ? null : participant.fee ?? revivalFee(participant.revivalId);
    const memberOfParticipant = participant => members().find(member => member.id === participant.memberId) ?? null;
    const invitationOf = participant => {
        const member = memberOfParticipant(participant);

        if (!member) {
            return "NOT_INVITED";
        }
        return member.sub && personas[member.sub]?.roles.includes("USER") ? "ACTIVE" : "INVITED";
    };
    const position = id => {
        const found = POSITIONS.find(candidate => candidate.id === id);

        return found ? {__typename: "Position", ...found} : null;
    };
    const vocalPart = id => {
        const found = VOCAL_PARTS.find(candidate => candidate.id === id);

        return found ? {__typename: "VocalPart", ...found} : null;
    };
    const personOf = participant => {
        if (participant.spexareId) {
            if (!up()) {
                throw unavailable();
            }
            const person = spexareById(participant.spexareId);

            return {firstName: person.firstName, lastName: person.lastName, nickName: person.nickName, email: person.contact.email ?? null,
                phone: person.contact.phone ?? null, contact: person.contact, consent: person.consent};
        }
        return participant.pendingPerson
            ? {...participant.pendingPerson, nickName: null, contact: participant.pendingPerson}
            : {firstName: "", lastName: "", nickName: null, email: null, phone: null, contact: {}};
    };

    function toParticipant(persona, revival, participant) {
        const person = personOf(participant);
        const contacts = canRead(persona, revival);
        const dietary = canReadDietary(persona, revival);

        return {
            __typename: "Participant",
            id: participant.id,
            revivalId: participant.revivalId,
            kind: participant.kind,
            spexareId: participant.spexareId,
            firstName: person.firstName,
            lastName: person.lastName,
            nickName: person.nickName,
            email: contacts ? person.email : null,
            phone: contacts ? person.phone : null,
            pending: !participant.spexareId,
            position: position(participant.positionId),
            roleName: participant.roleName,
            vocalPart: vocalPart(participant.vocalPartId),
            preferredPosition: position(participant.preferredPositionId),
            response: participant.response,
            respondedAt: participant.respondedAt,
            comment: participant.comment,
            termsAcceptedAt: participant.termsAcceptedAt,
            registerConsent: participant.registerConsent,
            invitation: invitationOf(participant),
            invitedAt: participant.invitedAt,
            dietary: dietary ? participant.dietary : null,
            dietaryReadable: dietary,
            fee: feeOf(participant),
            feeOverride: participant.kind === "HELPER" ? null : participant.fee,
            feePaid: !!participant.feePaidAt,
            feePaidAt: participant.feePaidAt,
            compensationPerShift: participant.compensationPerShift,
            membershipPaid: !!participant.membershipPaid,
            removed: !!participant.removedAt,
            version: participant.version,
        };
    }

    function newParticipant(revival, values) {
        const participant = {
            id: `p${store().nextId++}`, revivalId: revival.id, kind: values.kind ?? "PARTICIPANT", spexareId: values.spexareId ?? null,
            pendingPerson: values.pendingPerson ?? null, memberId: null, positionId: values.positionId ?? null, roleName: values.roleName ?? null,
            vocalPartId: values.vocalPartId ?? null, preferredPositionId: null, response: "PENDING", respondedAt: null, comment: null,
            termsAcceptedAt: null, registerConsent: null, invitedAt: null, dietary: null, fee: null, feePaidAt: null,
            compensationPerShift: values.compensationPerShift ?? null, removedAt: null, version: 0,
        };

        store().participants.push(participant);
        return participant;
    }

    const activeIn = revival => store().participants.filter(participant => participant.revivalId === revival.id && !participant.removedAt);
    const isAdded = (revival, spexareId) => activeIn(revival).some(participant => participant.spexareId === String(spexareId));
    const toCandidate = (revival, person) => ({
        __typename: "SpexareCandidate", spexareId: person.id, firstName: person.firstName, lastName: person.lastName, nickName: person.nickName,
        graduation: person.graduation, history: person.history, added: isAdded(revival, person.id),
    });
    const byName = (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);

    function counts(revival) {
        const active = activeIn(revival);
        const responses = ["PENDING", "YES", "MAYBE", "NO"];
        const positions = [...new Set(active.filter(participant => participant.response !== "NO").map(participant => participant.positionId ?? null))];
        const due = active.filter(participant => feeOf(participant) && participant.response === "YES");

        return {
            __typename: "ParticipantCounts",
            total: active.length,
            byResponse: responses.map(response => ({__typename: "ResponseCount", response, count: active.filter(participant => participant.response === response).length}))
                .filter(entry => entry.count > 0),
            byPosition: positions.map(id => {
                const holding = active.filter(participant => (participant.positionId ?? null) === id);

                return {
                    __typename: "PositionCount", position: position(id),
                    yes: holding.filter(participant => participant.response === "YES").length,
                    maybe: holding.filter(participant => participant.response === "MAYBE").length,
                    pending: holding.filter(participant => participant.response === "PENDING").length,
                };
            }),
            notInvited: active.filter(participant => invitationOf(participant) === "NOT_INVITED").length,
            waitingForAccess: active.filter(participant => invitationOf(participant) === "INVITED").length,
            feesPaid: due.filter(participant => participant.feePaidAt).length,
            feesUnpaid: due.filter(participant => !participant.feePaidAt).length,
            helpers: active.filter(participant => participant.kind === "HELPER").length,
        };
    }

    const toSettings = revivalId => ({__typename: "ParticipationSettings", ...settingsOf(revivalId)});

    /** The caller's own row: through their participant or helper role in the revival. */
    function own(persona, revivalId) {
        const revival = visibleRevival(persona, revivalId);
        const member = memberOf(persona, revival);
        const participant = member && store().participants.find(candidate => candidate.memberId === member.id && !candidate.removedAt);

        if (!participant || !isParticipant(persona, revival)) {
            throw new GraphQLError("NOT_FOUND", "Nyuppsättningen finns inte.");
        }
        return {revival, participant};
    }

    function swishOf(revival, participant) {
        const settings = settingsOf(revival.id);
        const fee = feeOf(participant);

        if (!settings.swishNumber || !fee || participant.feePaidAt) {
            return null;
        }
        const person = personOf(participant);
        const message = `${revival.title} ${person.firstName} ${person.lastName}`.replace(/[^\p{L}\d !?(),.\-:;]/gu, "").slice(0, 50);

        return {__typename: "SwishPayment", number: settings.swishNumber, amount: fee, message, qrAvailable: true};
    }

    function toParticipation(persona, revival, participant) {
        const settings = settingsOf(revival.id);
        const fee = feeOf(participant);
        const loan = loanOf(revival.id);
        const person = personOf(participant);
        const feed = ctx.state().event.feeds.find(candidate => candidate.revivalId === revival.id && candidate.sub === persona.sub && !candidate.revoked);

        return {
            __typename: "Participation",
            participant: toParticipant(persona, revival, participant),
            revival: {
                __typename: "Revival", id: revival.id, title: revival.title, premiereDate: revival.premiereDate,
                shows: revival.shows.map(show => ({__typename: "RevivalShow", ...show})),
                calendarFeed: feed ? {__typename: "CalendarFeed", createdAt: feed.createdAt} : null,
                permissions: {__typename: "RevivalPermissions", canSubscribeCalendar: true},
            },
            settings: toSettings(revival.id),
            terms: [
                ...(fee ? [`Deltagaravgiften är ${fee} kr.`] : []),
                ...(loan ? [`Om resultatet inte räcker till för att betala tillbaka lånet på ${loan} kr från FGV/JK delar deltagarna på det som fattas.`] : []),
                ...(settings.terms ? [settings.terms] : []),
            ],
            contact: participant.spexareId && !up() ? null : {
                __typename: "Contact", email: person.contact.email ?? null, phone: person.contact.phone ?? null,
                streetAddress: person.contact.streetAddress ?? null, postalCode: person.contact.postalCode ?? null, city: person.contact.city ?? null,
            },
            dietary: participant.dietary,
            swish: swishOf(revival, participant),
            whatsappLink: participant.response === "YES" ? settings.whatsappLink : null,
            steeringGroup: members().filter(member => member.revivalId === revival.id && ["DIRECTEUR", "STEERING_GROUP"].includes(member.role) && member.sub)
                .map(member => ({__typename: "PersonRef", id: member.sub, displayName: personas[member.sub]?.name ?? null})),
        };
    }

    const resolvers = {
        ParticipantsOverview(persona, {id}) {
            const revival = visibleRevival(persona, id);
            const reads = canRead(persona, revival);

            return {
                revival: {
                    __typename: "Revival", id: revival.id, title: revival.title, status: revival.status,
                    permissions: {
                        __typename: "RevivalPermissions", canReadParticipants: reads, canWriteParticipants: canWrite(persona, revival),
                        canReadDietary: canReadDietary(persona, revival), canWriteBudget: canWriteBudget(persona, revival),
                    },
                    participantCounts: reads ? counts(revival) : null,
                    participationSettings: reads ? toSettings(revival.id) : null,
                    referrals: reads ? store().referrals.filter(referral => referral.revivalId === revival.id).map(referral => ({__typename: "Referral", ...referral})) : [],
                },
            };
        },
        Participants(persona, {revivalId, includeRemoved}) {
            const revival = readable(persona, revivalId);

            return {
                participants: store().participants
                    .filter(participant => participant.revivalId === revival.id && (includeRemoved || !participant.removedAt))
                    .map(participant => toParticipant(persona, revival, participant)),
            };
        },
        Positions() {
            if (!up()) {
                throw unavailable();
            }
            return {positions: POSITIONS.map(found => ({__typename: "Position", ...found})), vocalParts: VOCAL_PARTS.map(found => ({__typename: "VocalPart", ...found}))};
        },
        ParticipantCandidates(persona, {revivalId}) {
            const revival = writable(persona, revivalId);

            if (!up()) {
                throw unavailable();
            }
            return {
                participantCandidates: store().spexare.filter(person => person.spex.includes(revival.spexId) && !person.deceased && !isAdded(revival, person.id))
                    .sort(byName).map(person => toCandidate(revival, person)),
            };
        },
        SpexareSearch(persona, {revivalId, query}) {
            const revival = writable(persona, revivalId);
            const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

            if (!up()) {
                throw unavailable();
            }
            if (query.trim().length < 3) {
                return {spexareSearch: []};
            }
            return {
                spexareSearch: store().spexare
                    .filter(person => !person.deceased && words.every(word => `${person.firstName} ${person.lastName} ${person.nickName ?? ""}`.toLowerCase().includes(word)))
                    .sort(byName).slice(0, 20).map(person => toCandidate(revival, person)),
            };
        },
        ParticipantAdd(persona, {input}) {
            const revival = writable(persona, input.revivalId);

            if (input.spexareId) {
                if (!spexareById(input.spexareId) || spexareById(input.spexareId).deceased || isAdded(revival, input.spexareId)) {
                    throw badRequest("Spexaren kan inte läggas till.");
                }
                return {participantAdd: toParticipant(persona, revival, newParticipant(revival, {...input, spexareId: String(input.spexareId)}))};
            }
            if (!input.firstName?.trim() || !input.lastName?.trim()) {
                throw badRequest("Ange för- och efternamn.");
            }
            if (input.kind === "PARTICIPANT" && !input.email) {
                throw badRequest("En deltagare behöver en e-postadress.");
            }
            const pendingPerson = {firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email?.toLowerCase() ?? null, phone: input.phone ?? null};

            return {participantAdd: toParticipant(persona, revival, newParticipant(revival, {...input, pendingPerson}))};
        },
        ParticipantsAddSpexare(persona, {revivalId, spexareIds}) {
            const revival = writable(persona, revivalId);

            if (!up()) {
                throw unavailable();
            }
            const added = spexareIds.filter(id => spexareById(id) && !spexareById(id).deceased && !isAdded(revival, id))
                .map(id => newParticipant(revival, {spexareId: String(id)}));

            return {participantsAddSpexare: added.map(participant => toParticipant(persona, revival, participant))};
        },
        ParticipantUpdate(persona, {input}) {
            const participant = findParticipant(persona, input.id, input.version);
            const revival = visibleRevival(persona, participant.revivalId);

            if (participant.pendingPerson) {
                const email = input.clearEmail ? null : input.email ?? participant.pendingPerson.email;
                const phone = input.clearPhone ? null : input.phone ?? participant.pendingPerson.phone;

                // A participant keeps an email address, a helper an email address or a phone number
                if (participant.kind === "PARTICIPANT" ? !email : !email && !phone) {
                    throw badRequest(participant.kind === "PARTICIPANT" ? "En deltagare behöver en e-postadress." : "Ange e-post eller telefon.");
                }
                Object.assign(participant.pendingPerson, {
                    firstName: input.firstName || participant.pendingPerson.firstName, lastName: input.lastName || participant.pendingPerson.lastName, email, phone,
                });
            }
            if (input.clearPosition) {
                participant.positionId = null;
            } else if (input.positionId) {
                participant.positionId = input.positionId;
            }
            participant.roleName = input.clearRoleName ? null : input.roleName ?? participant.roleName;
            participant.vocalPartId = input.clearVocalPart ? null : input.vocalPartId ?? participant.vocalPartId;
            participant.fee = input.clearFee ? null : input.fee ?? participant.fee;
            participant.compensationPerShift = input.compensationPerShift ?? participant.compensationPerShift;
            participant.version += 1;
            return {participantUpdate: toParticipant(persona, revival, participant)};
        },
        ParticipantRemove(persona, {id, version}) {
            const participant = findParticipant(persona, id, version);

            participant.removedAt = new Date().toISOString();
            participant.pendingPerson = null;
            participant.dietary = null;
            participant.version += 1;
            ctx.state().members = members().filter(member => member.id !== participant.memberId);
            return {participantRemove: null};
        },
        ParticipantsInvite(persona, {input}) {
            const revival = writable(persona, input.revivalId);

            if (revival.status !== "OPEN") {
                throw badRequest("Nyuppsättningen måste vara öppen för att bjuda in deltagare.");
            }
            const invited = [];
            const skipped = [];

            input.participantIds.forEach(id => {
                const participant = store().participants.find(candidate => candidate.id === String(id) && candidate.revivalId === revival.id);
                const skip = reason => skipped.push({__typename: "ParticipantSkip", participant: toParticipant(persona, revival, participant), reason});

                if (!participant) {
                    return;
                }
                if (participant.removedAt) {
                    return skip("REMOVED");
                }
                if (participant.response === "NO") {
                    return skip("DECLINED");
                }
                const person = personOf(participant);
                const email = (person.email ?? (input.participantIds.length === 1 ? input.email : null))?.toLowerCase();

                if (!email) {
                    return skip("NO_EMAIL");
                }
                if (!memberOfParticipant(participant)) {
                    const account = Object.values(personas).find(candidate => candidate.email === email);

                    if (members().some(member => member.revivalId === revival.id && (member.email === email || (account && member.sub === account.sub)))) {
                        return skip("ALREADY_MEMBER");
                    }
                    const member = {id: `m-p${participant.id}`, revivalId: revival.id, role: participant.kind, capabilities: [], email, sub: account?.sub ?? null, version: 0};

                    members().push(member);
                    participant.memberId = member.id;
                }
                participant.invitedAt = new Date().toISOString();
                participant.version += 1;
                invited.push(toParticipant(persona, revival, participant));
            });
            return {participantsInvite: {__typename: "ParticipantsInviteResult", invited, skipped}};
        },
        ParticipantFeeSetPaid(persona, {id, version, paid}) {
            const participant = store().participants.find(candidate => candidate.id === String(id));
            const revival = visibleRevival(persona, participant?.revivalId);

            if (!canWriteBudget(persona, revival)) {
                throw forbidden();
            }
            if (participant.version !== version) {
                throw conflict();
            }
            participant.feePaidAt = paid ? new Date().toISOString() : null;
            participant.version += 1;
            return {participantFeeSetPaid: toParticipant(persona, revival, participant)};
        },
        ParticipationSettingsUpdate(persona, {input}) {
            const revival = writable(persona, input.revivalId);
            const current = settingsOf(revival.id);

            if (current.version !== input.version) {
                throw conflict();
            }
            if (input.swishNumber && !/^\d{10}$/.test(input.swishNumber)) {
                throw badRequest("Swishnumret ska vara tio siffror.");
            }
            if (input.whatsappLink && !input.whatsappLink.startsWith("https://chat.whatsapp.com/")) {
                throw badRequest("Länken ska börja med https://chat.whatsapp.com/.");
            }
            store().settings[revival.id] = {swishNumber: input.swishNumber ?? null, whatsappLink: input.whatsappLink ?? null, terms: input.terms ?? null,
                version: current.version + 1};
            return {participationSettingsUpdate: toSettings(revival.id)};
        },
        ReferralHandle(persona, {id, outcome}) {
            const referral = store().referrals.find(candidate => candidate.id === String(id));
            const revival = writable(persona, referral?.revivalId);
            let created = null;

            if (outcome === "ADDED") {
                const words = referral.name.trim().split(/\s+/);
                const contact = referral.contact ?? "";

                created = newParticipant(revival, {
                    pendingPerson: {
                        firstName: words.length > 1 ? words.slice(0, -1).join(" ") : words[0], lastName: words.length > 1 ? words.at(-1) : "—",
                        email: contact.includes("@") ? contact : null, phone: contact && !contact.includes("@") ? contact : null,
                    },
                });
            }
            store().referrals = store().referrals.filter(candidate => candidate !== referral);
            return {referralHandle: created && toParticipant(persona, revival, created)};
        },
        MyParticipation(persona, {revivalId}) {
            const {revival, participant} = own(persona, revivalId);

            return {myParticipation: toParticipation(persona, revival, participant)};
        },
        ParticipationRespond(persona, {input}) {
            const {revival, participant} = own(persona, input.revivalId);
            const now = new Date().toISOString();

            if (revival.status !== "OPEN") {
                throw badRequest("Nyuppsättningen är inte öppen.");
            }
            if (input.response === "YES" && !input.termsAccepted) {
                throw badRequest("Godkänn villkoren för att svara ja.");
            }
            if (["YES", "MAYBE"].includes(input.response) && input.registerConsent == null && participant.registerConsent == null) {
                throw badRequest("Svara på frågan om Spexregistret.");
            }
            Object.assign(participant, {
                response: input.response, respondedAt: now, comment: input.comment ?? null, preferredPositionId: input.preferredPositionId ?? null,
                termsAcceptedAt: input.response === "YES" ? now : participant.termsAcceptedAt,
                registerConsent: input.registerConsent ?? participant.registerConsent,
            });
            if (input.registerConsent === true && participant.pendingPerson) {
                const {firstName, lastName, email, phone} = participant.pendingPerson;
                const id = String(600 + store().nextId++);

                store().spexare.push({id, firstName, lastName, nickName: null, graduation: null, deceased: false, spex: [], history: [],
                    contact: {email, phone}, consent: true});
                participant.spexareId = id;
                participant.pendingPerson = null;
            } else if (input.registerConsent != null && participant.spexareId) {
                spexareById(participant.spexareId).consent = input.registerConsent;
            }
            if (input.response === "NO" && participant.pendingPerson) {
                Object.assign(participant, {pendingPerson: null, dietary: null, removedAt: now});
            }
            participant.version += 1;
            return {participationRespond: toParticipation(persona, revival, participant)};
        },
        ParticipationContactUpdate(persona, {input}) {
            const {revival, participant} = own(persona, input.revivalId);
            const contact = {email: input.email ?? null, phone: input.phone ?? null, streetAddress: input.streetAddress ?? null,
                postalCode: input.postalCode ?? null, city: input.city ?? null};

            if (participant.pendingPerson) {
                Object.assign(participant.pendingPerson, contact);
            } else if (participant.registerConsent === true) {
                if (!up()) {
                    throw unavailable();
                }
                Object.assign(spexareById(participant.spexareId).contact, contact);
            } else {
                throw badRequest("Utan samtycke sparas inte dina kontaktuppgifter i Spexregistret.");
            }
            return {participationContactUpdate: toParticipation(persona, revival, participant)};
        },
        ParticipationDietarySet(persona, {revivalId, text}) {
            const {revival, participant} = own(persona, revivalId);

            if ((text ?? "").length > 1000) {
                throw badRequest("Högst 1 000 tecken.");
            }
            participant.dietary = text?.trim() || null;
            return {participationDietarySet: toParticipation(persona, revival, participant)};
        },
        ReferralCreate(persona, {input}) {
            const {revival, participant} = own(persona, input.revivalId);

            store().referrals.push({id: `r${store().nextId++}`, revivalId: revival.id, name: input.name, contact: input.contact ?? null, comment: input.comment ?? null,
                referredBy: persona.name, referredByParticipant: participant.id, createdAt: new Date().toISOString()});
            return {referralCreate: null};
        },
    };

    return {
        resolvers,
        permissions: (persona, revival) => ({
            canReadParticipants: canRead(persona, revival),
            canWriteParticipants: canWrite(persona, revival),
            canReadDietary: canReadDietary(persona, revival),
            isParticipant: isParticipant(persona, revival),
            canReadWork: seesEverything(persona) || steering(persona, revival),
        }),
        isParticipant,
        own,
        /** A participant by name and position only (ParticipantRef, M6b); the name falls back while Spexregister is down. */
        ref(participant) {
            let name;

            try {
                const person = personOf(participant);

                name = [person.firstName, person.lastName].filter(Boolean).join(" ");
            } catch {
                name = "Okänd";
            }
            return {__typename: "ParticipantRef", id: participant.id, displayName: name, kind: participant.kind, position: position(participant.positionId)};
        },
        /** The participant's email address for a mailing, or null. */
        emailOf(participant) {
            try {
                return personOf(participant).email ?? null;
            } catch {
                return null;
            }
        },
        activeIn,
        /**
         * Gives revival 1 a fee of 800 kr with a loan of 10 000 kr, a Swish number, a WhatsApp link and extra terms; with
         * {@code people}, also the pending participant Disa Deltagare (the "deltagare" persona) invited and logged in, the
         * spexare Anna Andersson not invited, and a referral.
         */
        seed({people = false} = {}) {
            const revival = ctx.state().revivals.find(candidate => candidate.id === "1");
            const budget = ctx.state().budget.settings;

            budget["1"] = {participantsPlanned: 40, participationFee: "800", loanAmount: "10000", loanReceivedOn: null, loanRepaidOn: null, version: 1, ...budget["1"]};
            store().settings["1"] = {swishNumber: "1234567890", whatsappLink: "https://chat.whatsapp.com/E2eGrupp", terms: "Repetitioner varje söndag.", version: 1};
            if (people) {
                const disa = newParticipant(revival, {pendingPerson: {firstName: "Disa", lastName: "Deltagare", email: "disa@example.org", phone: null}});
                const member = {id: "m-disa", revivalId: "1", role: "PARTICIPANT", capabilities: [], email: "disa@example.org", sub: "p-deltagare", version: 0};

                members().push(member);
                disa.memberId = member.id;
                disa.invitedAt = "2026-10-20T10:00:00Z";
                newParticipant(revival, {spexareId: "501", positionId: "T-ENS", roleName: "Ali Baba", vocalPartId: "B1"});
                store().referrals.push({id: "r0", revivalId: "1", name: "Gustav Gren", contact: "gustav@example.org", comment: "Spelade fiol 2008.",
                    referredBy: "Disa Deltagare", createdAt: "2026-10-21T09:00:00Z"});
            }
        },
        /** The participant's Swish QR code (M6-FR-19): only for the participant, with a Swish number and an unpaid fee. */
        handleHttp(persona, req, path, res) {
            const match = /^\/api\/revivals\/([^/]+)\/swish-qr$/.exec(path);

            if (req.method !== "GET" || !match) {
                return false;
            }
            try {
                const {revival, participant} = own(persona, match[1]);

                if (!swishOf(revival, participant)) {
                    throw new Error("No Swish");
                }
                res.writeHead(200, {"Content-Type": "image/svg+xml"})
                    .end("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"300\"><rect width=\"300\" height=\"300\" fill=\"#fff\"/><rect x=\"20\" y=\"20\" width=\"60\" height=\"60\"/></svg>");
            } catch {
                res.writeHead(404, {"Content-Type": "application/json"}).end(JSON.stringify({code: "NOT_FOUND", message: "Not found"}));
            }
            return true;
        },
    };
}
