// The budget part of the mock backend (M5): categories, reference figures, event type budget lines, a revival's
// budget with its lines, transactions, receipts and scenarios, and the Chalmersspex dates, with the server's rules
// (fgv-revival-server/src/main/resources/graphql/budget.graphqls, spex-calendar.graphqls). Amounts are kept in öre and
// returned as the server's decimal strings. Test data is fictitious.

const category = (id, sv, en, kind, role, position) => ({
    id,
    name: {sv, en},
    kind,
    role,
    position,
    retired: false,
    version: 0
});

export function createBudgetState() {
    return {
        nextId: 1,
        categories: [
            category("SHOW_TICKETS", "Biljetter föreställning", "Show tickets", "INCOME", "SHOW_TICKETS", 0),
            category("PARTY_TICKETS", "Biljetter kalas", "Party tickets", "INCOME", "PARTY_TICKETS", 1),
            category("FEES", "Spexpengar", "Participation fees", "INCOME", "FEES", 2),
            category("SPONSORSHIP", "Sponsring", "Sponsorship", "INCOME", null, 3),
            category("VENUE", "Lokaler", "Venues", "COST", "VENUE", 4),
            category("FOOD", "Mat och dryck", "Food and drink", "COST", null, 5),
            category("PARTY", "Kalas", "Party", "COST", "PARTY", 6),
            category("HELPERS", "Springare", "External helpers", "COST", "HELPERS", 7),
        ],
        references: [],
        typeLines: [],
        settings: {},
        lines: [],
        transactions: [],
        receipts: {},
        scenarios: [],
        spexDates: [],
    };
}

// --- Amounts ------------------------------------------------------------------------------------------------------

const toOre = value => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));

    if (!match) {
        throw new Error(`Not an amount: ${value}`);
    }
    const ore = Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0"));

    return match[1] ? -ore : ore;
};
const fromOre = ore => {
    if (ore === null || ore === undefined) {
        return null;
    }
    const sign = ore < 0 ? "-" : "";
    const absolute = Math.abs(Math.round(ore));
    const fraction = absolute % 100;

    return `${sign}${Math.floor(absolute / 100)}${fraction ? `.${String(fraction).padStart(2, "0")}` : ""}`;
};
const times = (quantity, unitOre) => Math.round(quantity * unitOre);
const sum = values => values.reduce((total, value) => total + (value ?? 0), 0);

export function budgetResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, isSuperAdmin, seesEverything, log} = ctx;
    const store = () => ctx.state().budget;
    const memberOf = (persona, revival) => ctx.state().members.find(member => member.revivalId === revival.id && member.sub === persona.sub);
    const canRead = (persona, revival) => seesEverything(persona)
        || (["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival));
    const canWrite = (persona, revival) => canSee(persona, revival) && revival.status !== "ARCHIVED"
        && (roleIn(persona, revival) === "DIRECTEUR"
            || (roleIn(persona, revival) === "STEERING_GROUP" && (memberOf(persona, revival)?.capabilities ?? []).includes("FINANCE")));
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
    const conflict = () => new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
    const superAdmin = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };

    // --- Categories -------------------------------------------------------------------------------------------------

    const orderedCategories = () => [...store().categories].sort((a, b) => a.position - b.position);
    const categoryById = id => store().categories.find(candidate => candidate.id === id);
    const usedCategories = () => new Set([
        ...store().lines.map(line => line.categoryId), ...store().transactions.map(transaction => transaction.categoryId),
        ...store().references.flatMap(reference => reference.figures.map(figure => figure.categoryId)), ...store().typeLines.map(line => line.categoryId),
    ]);
    const toCategory = found => ({
        __typename: "BudgetCategory", ...found,
        name: {__typename: "LocalizedText", ...found.name},
        inUse: usedCategories().has(found.id),
    });
    const activeCategory = id => {
        const found = categoryById(id);

        if (!found || found.retired) {
            throw new GraphQLError("BAD_REQUEST", "Välj en aktiv kategori.");
        }
        return found;
    };
    const roleFree = (role, self) => {
        if (role && store().categories.some(other => other !== self && !other.retired && other.role === role)) {
            throw new GraphQLError("BAD_REQUEST", "En annan aktiv kategori har redan den rollen.");
        }
    };
    const changeableCategory = (id, version) => {
        const found = categoryById(id);

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Kategorin finns inte.");
        }
        if (found.version !== version) {
            throw conflict();
        }
        return found;
    };
    const categoryName = (input, self) => {
        const sv = input.sv.trim();

        if (!sv) {
            throw new GraphQLError("BAD_REQUEST", "Namnet får inte vara tomt.");
        }
        if (store().categories.some(other => other !== self && other.name.sv.toLowerCase() === sv.toLowerCase())) {
            throw new GraphQLError("BAD_REQUEST", `Det finns redan en kategori som heter ${sv}.`);
        }
        return {sv, en: input.en?.trim() || null};
    };

    // --- Budget -----------------------------------------------------------------------------------------------------

    const settingsOf = revival => store().settings[revival.id]
        ?? {
            participantsPlanned: null,
            participationFee: null,
            loanAmount: null,
            loanReceivedOn: null,
            loanRepaidOn: null,
            version: 0
        };
    const linesOf = (revival, includeRemoved = false) => store().lines
        .filter(line => line.revivalId === revival.id && (includeRemoved || !line.removed))
        .sort((a, b) => categoryById(a.categoryId).position - categoryById(b.categoryId).position || Number(a.id) - Number(b.id));
    const transactionsOf = (revival, includeCancelled = false) => store().transactions
        .filter(transaction => transaction.revivalId === revival.id && (includeCancelled || !transaction.cancelled))
        .sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id));
    const eventOf = id => ctx.state().event.events.find(event => event.id === id);
    const toEventRef = id => {
        const event = id && eventOf(id);

        return event ? {
            __typename: "Event",
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            cancelled: event.cancelled
        } : null;
    };
    const toLogSummary = id => {
        const entry = id && ctx.state().log.entries.find(candidate => candidate.id === id);

        return entry ? {
            __typename: "LogEntrySummary",
            id: entry.id,
            number: entry.number,
            type: entry.type,
            status: entry.status
        } : null;
    };
    const toLine = line => ({
        __typename: "BudgetLine",
        id: line.id,
        category: toCategory(categoryById(line.categoryId)),
        description: line.description,
        quantity: line.quantity,
        unitAmount: fromOre(line.unitOre),
        amount: fromOre(times(line.quantity, line.unitOre)),
        event: toEventRef(line.eventId),
        logEntry: toLogSummary(line.logEntryId),
        comment: line.comment,
        removed: line.removed,
        version: line.version,
    });
    const receiptOf = transaction => {
        const receipt = store().receipts[transaction.id];

        return receipt ? {
            __typename: "Receipt",
            filename: receipt.filename,
            contentType: receipt.contentType,
            size: receipt.size,
            uploadedAt: receipt.uploadedAt
        } : null;
    };
    const toTransaction = (revival, transaction) => {
        const line = transaction.budgetLineId && store().lines.find(candidate => candidate.id === transaction.budgetLineId);

        return {
            __typename: "Transaction",
            id: transaction.id,
            date: transaction.date,
            amount: fromOre(transaction.amountOre),
            category: toCategory(categoryById(transaction.categoryId)),
            description: transaction.description,
            budgetLine: line ? {
                __typename: "BudgetLine",
                id: line.id,
                description: line.description,
                removed: line.removed,
                category: {__typename: "BudgetCategory", id: line.categoryId}
            } : null,
            paidBy: log.toOwner(revival, transaction.paidBy),
            reimbursed: !!transaction.reimbursedAt,
            reimbursedAt: transaction.reimbursedAt,
            receipt: receiptOf(transaction),
            cancelled: transaction.cancelled,
            version: transaction.version,
        };
    };
    const lineAmount = line => times(line.quantity, line.unitOre);
    const kindOf = categoryId => categoryById(categoryId).kind;
    const totals = revival => {
        const lines = linesOf(revival);
        const transactions = transactionsOf(revival);
        const budgeted = kind => sum(lines.filter(line => kindOf(line.categoryId) === kind).map(lineAmount));
        const actual = kind => sum(transactions.filter(transaction => kindOf(transaction.categoryId) === kind).map(transaction => transaction.amountOre));
        const unreimbursed = transactions.filter(transaction => kindOf(transaction.categoryId) === "COST" && transaction.paidBy && !transaction.reimbursedAt);

        return {
            __typename: "BudgetTotals",
            budgetedIncome: fromOre(budgeted("INCOME")),
            budgetedCost: fromOre(budgeted("COST")),
            budgetedResult: fromOre(budgeted("INCOME") - budgeted("COST")),
            actualIncome: fromOre(actual("INCOME")),
            actualCost: fromOre(actual("COST")),
            actualResult: fromOre(actual("INCOME") - actual("COST")),
            unreimbursed: fromOre(sum(unreimbursed.map(transaction => transaction.amountOre))),
            unreimbursedCount: unreimbursed.length,
            missingReceipts: transactions.filter(transaction => !store().receipts[transaction.id]).length,
        };
    };
    const references = categoryId => store().references
        .flatMap(reference => reference.figures.filter(figure => figure.categoryId === categoryId).map(figure => ({
            reference,
            figure
        })))
        .sort((a, b) => b.reference.year - a.reference.year)
        .map(({reference, figure}) => {
            const per = ore => ore !== null && reference.participants ? fromOre(Math.round(ore / reference.participants / 100) * 100) : null;

            return {
                __typename: "ReferenceFigureView",
                label: reference.label,
                year: reference.year,
                participants: reference.participants,
                budgeted: fromOre(figure.budgetedOre),
                actual: fromOre(figure.actualOre),
                budgetedPerParticipant: per(figure.budgetedOre),
                actualPerParticipant: per(figure.actualOre),
            };
        });
    const categorySummaries = revival => {
        const lines = linesOf(revival);
        const transactions = transactionsOf(revival);
        const held = new Set([...lines.map(line => line.categoryId), ...transactions.map(transaction => transaction.categoryId)]);

        return orderedCategories().filter(found => held.has(found.id) || (!found.retired && found.role)).map(found => ({
            __typename: "BudgetCategorySummary", category: toCategory(found),
            budgeted: fromOre(sum(lines.filter(line => line.categoryId === found.id).map(lineAmount))),
            actual: fromOre(sum(transactions.filter(transaction => transaction.categoryId === found.id).map(transaction => transaction.amountOre))),
            references: references(found.id),
        }));
    };
    const toTypeLine = line => ({
        __typename: "EventTypeBudgetLine",
        id: line.id,
        category: toCategory(categoryById(line.categoryId)),
        description: {__typename: "LocalizedText", ...line.description},
        quantityRule: line.quantityRule,
        quantity: line.quantity,
        unitAmount: fromOre(line.unitOre),
        version: line.version,
    });
    const proposals = revival => {
        const participants = settingsOf(revival).participantsPlanned;

        return ctx.state().event.events.filter(event => event.revivalId === revival.id && !event.cancelled && event.typeId)
            .flatMap(event => store().typeLines.filter(line => line.eventTypeId === event.typeId)
                .filter(line => !store().lines.some(added => !added.removed && added.eventId === event.id && added.eventTypeLineId === line.id))
                .map(line => {
                    const quantity = line.quantityRule === "FIXED" ? line.quantity : participants;

                    return {
                        __typename: "BudgetLineProposal", event: toEventRef(event.id), line: toTypeLine(line), quantity,
                        amount: quantity === null ? null : fromOre(times(quantity, line.unitOre)),
                    };
                }));
    };
    const parameters = values => ({__typename: "BudgetScenarioParameters", ...values});
    const calculate = (revival, input) => {
        const lines = linesOf(revival);
        const settings = settingsOf(revival);
        const ofRole = role => lines.filter(line => categoryById(line.categoryId).role === role);
        const quantityOf = role => sum(ofRole(role).map(line => line.quantity));
        const amountOf = role => sum(ofRole(role).map(lineAmount));
        const priceOf = role => quantityOf(role) ? Math.round(amountOf(role) / quantityOf(role)) : null;
        const baseline = {
            participants: settings.participantsPlanned,
            participationFee: settings.participationFee,
            showTicketPrice: fromOre(priceOf("SHOW_TICKETS")),
            showTickets: ofRole("SHOW_TICKETS").length ? Math.round(quantityOf("SHOW_TICKETS")) : null,
            partyTicketPrice: fromOre(priceOf("PARTY_TICKETS")),
            partyTickets: ofRole("PARTY_TICKETS").length ? Math.round(quantityOf("PARTY_TICKETS")) : null,
            venueCost: fromOre(amountOf("VENUE")),
            partyCost: fromOre(amountOf("PARTY")),
        };
        const used = Object.fromEntries(Object.entries(baseline).map(([key, value]) => [key, input[key] ?? value]));
        const ticketIncome = (role, ticketsKey, priceKey) => input[ticketsKey] != null || input[priceKey] != null
            ? (used[ticketsKey] ?? 0) * (toOre(used[priceKey]) ?? 0)
            : amountOf(role);
        const fees = input.participants != null || input.participationFee != null
            ? (used.participants ?? 0) * (toOre(used.participationFee) ?? 0)
            : amountOf("FEES");
        const show = ticketIncome("SHOW_TICKETS", "showTickets", "showTicketPrice");
        const party = ticketIncome("PARTY_TICKETS", "partyTickets", "partyTicketPrice");
        const roles = new Set(["SHOW_TICKETS", "PARTY_TICKETS", "FEES", "VENUE", "PARTY"]);
        const other = kind => sum(lines.filter(line => kindOf(line.categoryId) === kind && !roles.has(categoryById(line.categoryId).role)).map(lineAmount));
        const income = other("INCOME") + show + party + fees;
        const cost = other("COST") + toOre(used.venueCost) + toOre(used.partyCost);
        const price = toOre(used.showTicketPrice);

        return {
            __typename: "BudgetScenarioResult", baseline: parameters(baseline), used: parameters(used),
            income: fromOre(income), cost: fromOre(cost), result: fromOre(income - cost),
            breakEvenShowTickets: price > 0 ? Math.max(0, Math.ceil((cost - (income - show)) / price)) : null,
            partySubsidy: fromOre(toOre(used.partyCost) - party),
        };
    };
    const toScenario = (revival, scenario) => ({
        __typename: "BudgetScenario", id: scenario.id, name: scenario.name, parameters: parameters(scenario.parameters),
        result: calculate(revival, scenario.parameters), version: scenario.version,
    });
    const budgetOf = (persona, revival) => canRead(persona, revival) ? {
        __typename: "Budget", revivalId: revival.id,
        settings: {__typename: "BudgetSettings", ...settingsOf(revival)},
        totals: totals(revival),
        categories: categorySummaries(revival),
        proposals: proposals(revival),
        scenarios: store().scenarios.filter(scenario => scenario.revivalId === revival.id && !scenario.removed).map(scenario => toScenario(revival, scenario)),
    } : null;
    const permissions = (persona, revival) => ({
        __typename: "RevivalPermissions",
        canReadBudget: canRead(persona, revival),
        canWriteBudget: canWrite(persona, revival)
    });
    const revivalHead = (persona, revival) => ({
        __typename: "Revival",
        id: revival.id,
        title: revival.title,
        status: revival.status,
        permissions: permissions(persona, revival)
    });
    const findLine = (persona, id, version) => {
        const line = store().lines.find(candidate => candidate.id === String(id));

        if (!line) {
            throw new GraphQLError("NOT_FOUND", "Budgetraden finns inte.");
        }
        writable(persona, line.revivalId);
        if (line.version !== version) {
            throw conflict();
        }
        return line;
    };
    const findTransaction = (persona, id, version, {write = true} = {}) => {
        const transaction = store().transactions.find(candidate => candidate.id === String(id));

        if (!transaction) {
            throw new GraphQLError("NOT_FOUND", "Transaktionen finns inte.");
        }
        (write ? writable : readable)(persona, transaction.revivalId);
        if (version !== undefined && transaction.version !== version) {
            throw conflict();
        }
        return transaction;
    };
    const lineLinks = (revival, input) => {
        if (input.eventId) {
            const event = eventOf(input.eventId);

            if (!event || event.revivalId !== revival.id) {
                throw new GraphQLError("BAD_REQUEST", "Händelsen hör inte till nyuppsättningen.");
            }
        }
        if (input.logEntryId) {
            const entry = ctx.state().log.entries.find(candidate => candidate.id === input.logEntryId);

            if (!entry || entry.revivalId !== revival.id || entry.type !== "DECISION") {
                throw new GraphQLError("BAD_REQUEST", "Raden måste vara ett beslut i nyuppsättningens logg.");
            }
        }
    };
    const description = text => {
        const trimmed = text?.trim() ?? "";

        if (!trimmed || trimmed.length > 255) {
            throw new GraphQLError("BAD_REQUEST", "Beskrivningen måste vara 1–255 tecken.");
        }
        return trimmed;
    };
    const referenceInput = input => {
        if (!input.label.trim()) {
            throw new GraphQLError("BAD_REQUEST", "Skriv en benämning.");
        }
        return {
            label: input.label.trim(),
            year: input.year,
            participants: input.participants ?? null,
            comment: input.comment?.trim() || null,
            figures: input.figures.map(figure => ({
                categoryId: figure.categoryId,
                budgetedOre: toOre(figure.budgeted),
                actualOre: toOre(figure.actual)
            })),
        };
    };
    const toReference = reference => ({
        __typename: "ReferenceRevival", ...reference,
        figures: reference.figures.map(figure => ({
            __typename: "ReferenceFigure",
            category: toCategory(categoryById(figure.categoryId)),
            budgeted: fromOre(figure.budgetedOre),
            actual: fromOre(figure.actualOre),
        })),
    });
    const typeLineInput = input => ({
        categoryId: activeCategory(input.categoryId).id,
        description: {sv: description(input.description.sv), en: input.description.en?.trim() || null},
        quantityRule: input.quantityRule,
        quantity: input.quantityRule === "FIXED" ? input.quantity : null,
        unitOre: toOre(input.unitAmount),
    });
    const eventTypeOf = id => {
        const found = ctx.state().event.types.find(type => type.id === String(id));

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Händelsetypen finns inte.");
        }
        return found;
    };
    const spexDate = input => {
        if (!input.label?.trim()) {
            throw new GraphQLError("BAD_REQUEST", "Skriv vad som händer.");
        }
        return {date: input.date, label: input.label.trim()};
    };
    const toSpexDate = found => ({__typename: "SpexCalendarDate", ...found});
    const readSpexDates = persona => {
        if (!seesEverything(persona)) {
            throw forbidden();
        }
        return [...store().spexDates].sort((a, b) => a.date.localeCompare(b.date)).map(toSpexDate);
    };

    return {
        permissions,
        typeLinesOf: eventTypeId => store().typeLines.filter(line => line.eventTypeId === eventTypeId).map(toTypeLine),
        resolvers: {
            BudgetCategories(persona, {includeRetired}) {
                return {budgetCategories: orderedCategories().filter(found => includeRetired || !found.retired).map(toCategory)};
            },
            BudgetCategoryCreate(persona, {input}) {
                superAdmin(persona);
                roleFree(input.role);
                const created = {
                    id: `bc-${store().nextId++}`,
                    name: categoryName(input.name),
                    kind: input.kind,
                    role: input.role ?? null,
                    position: store().categories.length,
                    retired: false,
                    version: 0
                };

                store().categories.push(created);
                return {budgetCategoryCreate: toCategory(created)};
            },
            BudgetCategoryUpdate(persona, {input}) {
                superAdmin(persona);
                const found = changeableCategory(input.id, input.version);

                if (!found.retired) {
                    roleFree(input.role, found);
                }
                Object.assign(found, {
                    name: categoryName(input.name, found),
                    role: input.role ?? null,
                    version: found.version + 1
                });
                return {budgetCategoryUpdate: toCategory(found)};
            },
            BudgetCategoryMove(persona, {id, version, position}) {
                superAdmin(persona);
                const found = changeableCategory(id, version);
                const others = orderedCategories().filter(other => other !== found);

                others.splice(Math.min(Math.max(position, 0), others.length), 0, found);
                others.forEach((other, index) => {
                    if (other.position !== index) {
                        Object.assign(other, {position: index, version: other.version + 1});
                    }
                });
                return {budgetCategoryMove: others.map(toCategory)};
            },
            BudgetCategoryRetire(persona, {id, version}) {
                superAdmin(persona);
                const found = changeableCategory(id, version);

                Object.assign(found, {retired: true, version: found.version + 1});
                return {budgetCategoryRetire: toCategory(found)};
            },
            BudgetCategoryRestore(persona, {id, version}) {
                superAdmin(persona);
                const found = changeableCategory(id, version);

                roleFree(found.role, found);
                Object.assign(found, {retired: false, version: found.version + 1});
                return {budgetCategoryRestore: toCategory(found)};
            },
            BudgetCategoryDelete(persona, {id, version}) {
                superAdmin(persona);
                changeableCategory(id, version);
                if (usedCategories().has(id)) {
                    throw new GraphQLError("BAD_REQUEST", "Kategorin används och kan inte tas bort. Avveckla den i stället.");
                }
                store().categories = store().categories.filter(other => other.id !== id);
                orderedCategories().forEach((other, index) => {
                    other.position = index;
                });
                return {budgetCategoryDelete: null};
            },
            ReferenceRevivals(persona) {
                if (!seesEverything(persona) && !ctx.state().revivals.some(revival => canRead(persona, revival))) {
                    throw forbidden();
                }
                return {referenceRevivals: [...store().references].sort((a, b) => b.year - a.year).map(toReference)};
            },
            ReferenceRevivalCreate(persona, {input}) {
                superAdmin(persona);
                const created = {id: String(store().nextId++), ...referenceInput(input), automatic: false, version: 0};

                store().references.push(created);
                return {referenceRevivalCreate: toReference(created)};
            },
            ReferenceRevivalUpdate(persona, {id, version, input}) {
                superAdmin(persona);
                const found = store().references.find(candidate => candidate.id === id);

                if (!found) {
                    throw new GraphQLError("NOT_FOUND", "Referensen finns inte.");
                }
                if (found.version !== version) {
                    throw conflict();
                }
                Object.assign(found, referenceInput(input), {version: found.version + 1});
                return {referenceRevivalUpdate: toReference(found)};
            },
            ReferenceRevivalDelete(persona, {id, version}) {
                superAdmin(persona);
                const found = store().references.find(candidate => candidate.id === id);

                if (!found || found.version !== version) {
                    throw conflict();
                }
                store().references = store().references.filter(candidate => candidate !== found);
                return {referenceRevivalDelete: null};
            },
            EventTypeBudgetLineCreate(persona, {input}) {
                superAdmin(persona);
                const eventType = eventTypeOf(input.eventTypeId);

                store().typeLines.push({
                    id: `etl${store().nextId++}`,
                    eventTypeId: eventType.id, ...typeLineInput(input),
                    version: 0
                });
                return {eventTypeBudgetLineCreate: {__typename: "EventType", id: eventType.id}};
            },
            EventTypeBudgetLineUpdate(persona, {id, version, input}) {
                superAdmin(persona);
                const line = store().typeLines.find(candidate => candidate.id === id);

                if (!line || line.version !== version) {
                    throw conflict();
                }
                Object.assign(line, typeLineInput(input), {version: line.version + 1});
                return {eventTypeBudgetLineUpdate: {__typename: "EventType", id: line.eventTypeId}};
            },
            EventTypeBudgetLineRemove(persona, {id, version}) {
                superAdmin(persona);
                const line = store().typeLines.find(candidate => candidate.id === id);

                if (!line || line.version !== version) {
                    throw conflict();
                }
                store().typeLines = store().typeLines.filter(candidate => candidate !== line);
                return {eventTypeBudgetLineRemove: {__typename: "EventType", id: line.eventTypeId}};
            },
            BudgetAccess(persona, {id}) {
                return {revival: revivalHead(persona, visibleRevival(persona, id))};
            },
            BudgetOverview(persona, {id}) {
                const revival = visibleRevival(persona, id);

                return {revival: {...revivalHead(persona, revival), budget: budgetOf(persona, revival)}};
            },
            RevivalBudgetSummary(persona, {id}) {
                const revival = visibleRevival(persona, id);

                return {revival: {__typename: "Revival", id: revival.id, budget: budgetOf(persona, revival)}};
            },
            BudgetLines(persona, {id, includeRemoved}) {
                const revival = visibleRevival(persona, id);
                const budget = budgetOf(persona, revival);

                return {
                    revival: {
                        ...revivalHead(persona, revival),
                        budget: budget && {...budget, lines: linesOf(revival, includeRemoved).map(toLine)}
                    },
                    events: ctx.state().event.events.filter(event => event.revivalId === revival.id && !event.cancelled)
                        .map(event => ({
                            __typename: "Event",
                            id: event.id,
                            title: event.title,
                            startDate: event.startDate,
                            endDate: event.endDate
                        })),
                    logEntries: ctx.state().log.entries.filter(entry => entry.revivalId === revival.id && entry.type === "DECISION")
                        .map(entry => ({
                            __typename: "LogEntry",
                            id: entry.id,
                            number: entry.number,
                            text: entry.text,
                            date: entry.date
                        })),
                    budgetCategories: orderedCategories().filter(found => !found.retired).map(toCategory),
                };
            },
            BudgetTransactions(persona, {id, includeCancelled}) {
                const revival = visibleRevival(persona, id);
                const budget = budgetOf(persona, revival);

                return {
                    revival: {
                        ...revivalHead(persona, revival), ownerCandidates: log.candidates(revival),
                        budget: budget && {
                            ...budget,
                            transactions: transactionsOf(revival, includeCancelled).map(transaction => toTransaction(revival, transaction)),
                            lines: linesOf(revival).map(toLine),
                        },
                    },
                    budgetCategories: orderedCategories().filter(found => !found.retired).map(toCategory),
                };
            },
            BudgetScenarios(persona, {id}) {
                const revival = visibleRevival(persona, id);

                return {
                    revival: {...revivalHead(persona, revival), budget: budgetOf(persona, revival)},
                    budgetScenarioCalculate: canRead(persona, revival) ? calculate(revival, {}) : null,
                };
            },
            BudgetScenarioCalculate(persona, {revivalId, input}) {
                return {budgetScenarioCalculate: calculate(readable(persona, revivalId), input)};
            },
            BudgetSettingsUpdate(persona, {input}) {
                const revival = writable(persona, input.revivalId);

                if (settingsOf(revival).version !== input.version) {
                    throw conflict();
                }
                store().settings[revival.id] = {
                    participantsPlanned: input.participantsPlanned ?? null,
                    participationFee: input.participationFee ?? null,
                    loanAmount: input.loanAmount ?? null,
                    loanReceivedOn: input.loanReceivedOn ?? null,
                    loanRepaidOn: input.loanRepaidOn ?? null,
                    version: input.version + 1,
                };
                return {budgetSettingsUpdate: budgetOf(persona, revival)};
            },
            BudgetLineCreate(persona, {input}) {
                const revival = writable(persona, input.revivalId);

                activeCategory(input.categoryId);
                lineLinks(revival, input);
                if (input.eventTypeLineId && !input.eventId) {
                    throw new GraphQLError("BAD_REQUEST", "En rad från ett förslag måste höra till händelsen.");
                }
                if (input.eventTypeLineId && store().lines.some(line => !line.removed && line.eventId === input.eventId && line.eventTypeLineId === input.eventTypeLineId)) {
                    throw new GraphQLError("BAD_REQUEST", "Raden finns redan för händelsen.");
                }
                const line = {
                    id: String(store().nextId++),
                    revivalId: revival.id,
                    categoryId: input.categoryId,
                    description: description(input.description),
                    quantity: input.quantity ?? 1,
                    unitOre: toOre(input.unitAmount),
                    eventId: input.eventId ?? null,
                    logEntryId: input.logEntryId ?? null,
                    eventTypeLineId: input.eventTypeLineId ?? null,
                    comment: input.comment?.trim() || null,
                    removed: false,
                    version: 0,
                };

                store().lines.push(line);
                return {budgetLineCreate: toLine(line)};
            },
            BudgetLineUpdate(persona, {input}) {
                const line = findLine(persona, input.id, input.version);
                const revival = visibleRevival(persona, line.revivalId);

                if (input.categoryId && input.categoryId !== line.categoryId) {
                    activeCategory(input.categoryId);
                }
                lineLinks(revival, input);
                Object.assign(line, {
                    categoryId: input.categoryId ?? line.categoryId,
                    description: input.description != null ? description(input.description) : line.description,
                    quantity: input.quantity ?? line.quantity,
                    unitOre: input.unitAmount != null ? toOre(input.unitAmount) : line.unitOre,
                    eventId: input.clearEvent ? null : input.eventId ?? line.eventId,
                    logEntryId: input.clearLogEntry ? null : input.logEntryId ?? line.logEntryId,
                    comment: input.clearComment ? null : input.comment?.trim() || line.comment,
                    version: line.version + 1,
                });
                return {budgetLineUpdate: toLine(line)};
            },
            BudgetLineRemove(persona, {id, version}) {
                const line = findLine(persona, id, version);

                Object.assign(line, {removed: true, version: line.version + 1});
                return {budgetLineRemove: toLine(line)};
            },
            BudgetLineRestore(persona, {id, version}) {
                const line = findLine(persona, id, version);

                Object.assign(line, {removed: false, version: line.version + 1});
                return {budgetLineRestore: toLine(line)};
            },
            TransactionCreate(persona, {input}) {
                const revival = writable(persona, input.revivalId);
                const found = activeCategory(input.categoryId);

                if (input.paidBy && found.kind !== "COST") {
                    throw new GraphQLError("BAD_REQUEST", "Bara kostnader kan vara utlägg.");
                }
                const amountOre = toOre(input.amount);

                if (amountOre <= 0) {
                    throw new GraphQLError("BAD_REQUEST", "Beloppet måste vara större än noll.");
                }
                const transaction = {
                    id: String(store().nextId++),
                    revivalId: revival.id,
                    date: input.date,
                    amountOre,
                    categoryId: found.id,
                    description: description(input.description),
                    budgetLineId: input.budgetLineId ?? null,
                    paidBy: log.owner(revival, input.paidBy),
                    reimbursedAt: null,
                    cancelled: false,
                    version: 0,
                };

                store().transactions.push(transaction);
                return {transactionCreate: toTransaction(revival, transaction)};
            },
            TransactionUpdate(persona, {input}) {
                const transaction = findTransaction(persona, input.id, input.version);
                const revival = visibleRevival(persona, transaction.revivalId);

                if (transaction.cancelled) {
                    throw new GraphQLError("BAD_REQUEST", "En makulerad transaktion kan inte ändras.");
                }
                Object.assign(transaction, {
                    date: input.date ?? transaction.date,
                    amountOre: input.amount != null ? toOre(input.amount) : transaction.amountOre,
                    categoryId: input.categoryId ?? transaction.categoryId,
                    description: input.description != null ? description(input.description) : transaction.description,
                    budgetLineId: input.clearBudgetLine ? null : input.budgetLineId ?? transaction.budgetLineId,
                    paidBy: input.clearPaidBy ? null : input.paidBy ? log.owner(revival, input.paidBy) : transaction.paidBy,
                    version: transaction.version + 1,
                });
                return {transactionUpdate: toTransaction(revival, transaction)};
            },
            TransactionCancel(persona, {id, version}) {
                const transaction = findTransaction(persona, id, version);

                Object.assign(transaction, {cancelled: true, version: transaction.version + 1});
                return {transactionCancel: toTransaction(visibleRevival(persona, transaction.revivalId), transaction)};
            },
            TransactionSetReimbursed(persona, {id, version, reimbursed}) {
                const transaction = findTransaction(persona, id, version);

                if (!transaction.paidBy) {
                    throw new GraphQLError("BAD_REQUEST", "Bara utlägg kan betalas tillbaka.");
                }
                Object.assign(transaction, {
                    reimbursedAt: reimbursed ? new Date().toISOString() : null,
                    version: transaction.version + 1
                });
                return {transactionSetReimbursed: toTransaction(visibleRevival(persona, transaction.revivalId), transaction)};
            },
            BudgetScenarioSave(persona, {input}) {
                const revival = writable(persona, input.revivalId);
                const scenario = {
                    id: String(store().nextId++),
                    revivalId: revival.id,
                    name: input.name.trim(),
                    parameters: input.parameters,
                    removed: false,
                    version: 0
                };

                store().scenarios.push(scenario);
                return {budgetScenarioSave: toScenario(revival, scenario)};
            },
            BudgetScenarioUpdate(persona, {id, version, input}) {
                const scenario = store().scenarios.find(candidate => candidate.id === id);
                const revival = writable(persona, scenario?.revivalId);

                if (scenario.version !== version) {
                    throw conflict();
                }
                Object.assign(scenario, {
                    name: input.name.trim(),
                    parameters: input.parameters,
                    version: scenario.version + 1
                });
                return {budgetScenarioUpdate: toScenario(revival, scenario)};
            },
            BudgetScenarioRemove(persona, {id, version}) {
                const scenario = store().scenarios.find(candidate => candidate.id === id);

                writable(persona, scenario?.revivalId);
                if (scenario.version !== version) {
                    throw conflict();
                }
                Object.assign(scenario, {removed: true, version: scenario.version + 1});
                return {budgetScenarioRemove: null};
            },
            SpexCalendarDates(persona) {
                return {spexCalendarDates: readSpexDates(persona)};
            },
            RevivalTimeline(persona) {
                return {
                    revivals: ctx.state().revivals.filter(revival => canSee(persona, revival)).map(revival => ({
                        __typename: "Revival",
                        id: revival.id,
                        title: revival.title,
                        status: revival.status,
                        premiereDate: revival.premiereDate,
                        shows: revival.shows.map(show => ({__typename: "RevivalShow", ...show})),
                    })),
                    spexCalendarDates: readSpexDates(persona),
                };
            },
            SpexCalendarDateCreate(persona, {input}) {
                superAdmin(persona);
                const created = {id: String(store().nextId++), ...spexDate(input), version: 0};

                store().spexDates.push(created);
                return {spexCalendarDateCreate: toSpexDate(created)};
            },
            SpexCalendarDateUpdate(persona, {id, version, input}) {
                superAdmin(persona);
                const found = store().spexDates.find(candidate => candidate.id === id);

                if (!found || found.version !== version) {
                    throw conflict();
                }
                Object.assign(found, spexDate(input), {version: found.version + 1});
                return {spexCalendarDateUpdate: toSpexDate(found)};
            },
            SpexCalendarDateDelete(persona, {id, version}) {
                superAdmin(persona);
                const found = store().spexDates.find(candidate => candidate.id === id);

                if (!found || found.version !== version) {
                    throw conflict();
                }
                store().spexDates = store().spexDates.filter(candidate => candidate !== found);
                return {spexCalendarDateDelete: null};
            },
        },
        /** Receipts and the Excel export over plain HTTP (M5-FR-11, FR-12). Returns false when the path is not one of them. */
        handleHttp(persona, req, path, url, rawBody, res) {
            const json = (status, body) => res.writeHead(status, {"Content-Type": "application/json"}).end(JSON.stringify(body));
            const fail = error => error instanceof GraphQLError
                ? json({
                    NOT_FOUND: 404,
                    FORBIDDEN: 403,
                    CONFLICT: 409,
                    BAD_REQUEST: 400
                }[error.classification] ?? 500, {code: error.classification, message: error.message})
                : json(500, {code: "INTERNAL_ERROR", message: String(error)});
            const receipt = /^\/api\/transactions\/([^/]+)\/receipt$/.exec(path);
            const exported = /^\/api\/revivals\/([^/]+)\/budget\.xlsx$/.exec(path);

            if (!persona && (receipt || exported)) {
                json(401, {code: "UNAUTHORIZED", message: "Du är inte inloggad."});
                return true;
            }
            try {
                if (receipt && req.method === "GET") {
                    const transaction = findTransaction(persona, receipt[1], undefined, {write: false});
                    const stored = store().receipts[transaction.id];

                    if (!stored) {
                        throw new GraphQLError("NOT_FOUND", "Kvittot finns inte.");
                    }
                    res.writeHead(200, {
                        "Content-Type": stored.contentType,
                        "Content-Disposition": `attachment; filename="${stored.filename}"`,
                        "X-Content-Type-Options": "nosniff",
                        "Content-Security-Policy": "default-src 'none'; sandbox",
                    }).end(stored.content);
                    return true;
                }
                if (receipt && req.method === "POST") {
                    const transaction = findTransaction(persona, receipt[1]);
                    const file = multipartFile(req.headers["content-type"] ?? "", rawBody);

                    if (!file || !file.content.subarray(0, 4).equals(Buffer.from("%PDF")) && !file.content.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
                        && !file.content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
                        throw new GraphQLError("BAD_REQUEST", "Kvittot måste vara en PDF eller en bild.");
                    }
                    const stored = {
                        filename: file.filename.split(/[\\/]/).pop(),
                        contentType: file.contentType,
                        size: file.content.length,
                        uploadedAt: new Date().toISOString(),
                        content: file.content
                    };

                    store().receipts[transaction.id] = stored;
                    json(200, {
                        filename: stored.filename,
                        contentType: stored.contentType,
                        size: stored.size,
                        uploadedAt: stored.uploadedAt
                    });
                    return true;
                }
                if (receipt && req.method === "DELETE") {
                    const transaction = findTransaction(persona, receipt[1]);

                    delete store().receipts[transaction.id];
                    res.writeHead(204).end();
                    return true;
                }
                if (exported && req.method === "GET") {
                    const revival = readable(persona, exported[1]);
                    const lang = url.searchParams.get("lang") === "en" ? "en" : "sv";
                    // A stand-in for the workbook: the zip signature Excel files start with, and what was asked for
                    const content = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from(`budget ${revival.id} ${lang}`)]);

                    res.writeHead(200, {
                        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "Content-Disposition": `attachment; filename="budget-${revival.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx"`,
                    }).end(content);
                    return true;
                }
            } catch (error) {
                fail(error);
                return true;
            }
            return false;
        },
        /**
         * Revival 1 gets planned participants, a fee, two lines and a "Rephelg 1" event, whose type proposes a food line
         * per participant, and the library a reference revival with figures. Without finance, the steering group member
         * loses the FINANCE area.
         */
        seed({finance = true} = {}) {
            store().settings["1"] = {
                participantsPlanned: 40,
                participationFee: "800",
                loanAmount: "10000",
                loanReceivedOn: null,
                loanRepaidOn: null,
                version: 1
            };
            store().typeLines.push({
                id: `etl${store().nextId++}`,
                eventTypeId: "3",
                categoryId: "FOOD",
                description: {sv: "Mat under rephelgen", en: "Food during the weekend"},
                quantityRule: "PER_PARTICIPANT",
                quantity: null,
                unitOre: 8500,
                version: 0,
            });
            store().lines.push({
                id: String(store().nextId++),
                revivalId: "1",
                categoryId: "SHOW_TICKETS",
                description: "Biljetter, fyra föreställningar",
                quantity: 400,
                unitOre: 15000,
                eventId: null,
                logEntryId: null,
                eventTypeLineId: null,
                comment: null,
                removed: false,
                version: 0,
            }, {
                id: String(store().nextId++),
                revivalId: "1",
                categoryId: "VENUE",
                description: "Hyra Kårhuset",
                quantity: 1,
                unitOre: 4000000,
                eventId: null,
                logEntryId: null,
                eventTypeLineId: null,
                comment: null,
                removed: false,
                version: 0,
            });
            store().references.push({
                id: String(store().nextId++),
                label: "Nobel 2026",
                year: 2026,
                participants: 50,
                comment: null,
                automatic: false,
                version: 0,
                figures: [{categoryId: "VENUE", budgetedOre: 3500000, actualOre: 3800000}, {
                    categoryId: "FOOD",
                    budgetedOre: 1000000,
                    actualOre: 1200000
                }],
            });
            const events = ctx.state().event;

            events.events.push({
                id: String(events.nextId++),
                revivalId: "1",
                typeId: "3",
                title: "Rephelg 1",
                startDate: "2028-01-01",
                endDate: "2028-01-02",
                startTime: null,
                endTime: null,
                location: null,
                description: null,
                revivalPays: true,
                cancelled: false,
                checklistId: null,
                version: 0,
            });
            if (!finance) {
                const member = ctx.state().members.find(candidate => candidate.revivalId === "1" && candidate.sub === "p-styrgrupp");

                member.capabilities = member.capabilities.filter(capability => capability !== "FINANCE");
            }
        },
    };
}

/**
 * The first file part of a multipart/form-data body: its file name, type and bytes.
 */
function multipartFile(contentType, body) {
    const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);

    if (!boundary) {
        return null;
    }

    const separator = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
    let start = body.indexOf(separator);

    while (start !== -1) {
        const next = body.indexOf(separator, start + separator.length);

        if (next === -1) {
            return null;
        }
        const part = body.subarray(start + separator.length + 2, next - 2);
        const headerEnd = part.indexOf("\r\n\r\n");
        const headers = part.subarray(0, headerEnd).toString("utf8");
        const filename = /filename="([^"]*)"/.exec(headers);

        if (filename) {
            return {
                filename: filename[1],
                contentType: /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim() ?? "application/octet-stream",
                content: part.subarray(headerEnd + 4),
            };
        }
        start = next;
    }
    return null;
}
