"use client";

import * as React from "react";
import {useMemo, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Mail, MessageCircle, MoreHorizontal, Pencil, Send, Settings, Trash2, Utensils, X} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Switch} from "@/components/ui/switch";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, selectColumn, SortableHeader} from "@/components/data-table.client";
import {AmountText} from "@/components/budget/budget-labels";
import {UrlSwitch} from "@/components/budget/url-switch.client";
import {PlainText} from "@/components/plain-text";
import {
    InvitationBadge,
    KindBadge,
    type PositionValue,
    ResponseBadge,
    type VocalPartValue
} from "@/components/participant/participant-labels";
import {ParticipantEditDialog} from "@/components/participant/participant-edit-dialog.client";
import {InviteDialog} from "@/components/participant/invite-dialog.client";
import {ParticipantAddSheet} from "@/components/participant/participant-add-sheet.client";
import {
    ParticipationSettingsDialog,
    type ParticipationSettingsValue
} from "@/components/participant/participation-settings-dialog.client";
import {
    removeParticipantAction,
    setParticipantFeePaidAction
} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ParticipantFieldsFragment} from "@/gql/graphql";
import {participantName, whatsAppUrl} from "@/lib/participant/contact";
import {INVITATION_STATES, PARTICIPANT_KINDS, PARTICIPANT_RESPONSES} from "@/lib/participant/schema";

export type ParticipantRow = ParticipantFieldsFragment;

export type ParticipantFilter = {
    query: string;
    responses: Set<string>;
    kinds: Set<string>;
    positions: Set<string>;
    invitations: Set<string>;
};

export const EMPTY_PARTICIPANT_FILTER: ParticipantFilter = {
    query: "",
    responses: new Set(),
    kinds: new Set(),
    positions: new Set(),
    invitations: new Set()
};

/** The position filter's value for participants without one. */
export const NO_POSITION = "__none__";

/**
 * Every word must appear in the name, nickname, position, role name or contact details; then the chosen answers, kinds,
 * positions and invitation states.
 */
export function filterParticipants(participants: ParticipantRow[], filter: ParticipantFilter): ParticipantRow[] {
    const words = filter.query.toLowerCase().split(/\s+/).filter(Boolean);

    return participants.filter(participant => {
        const text = [participantName(participant), participant.position?.name, participant.roleName, participant.email, participant.phone]
            .filter(Boolean).join(" ").toLowerCase();

        return words.every(word => text.includes(word))
            && (filter.responses.size === 0 || filter.responses.has(participant.response))
            && (filter.kinds.size === 0 || filter.kinds.has(participant.kind))
            && (filter.positions.size === 0 || filter.positions.has(participant.position?.id ?? NO_POSITION))
            && (filter.invitations.size === 0 || filter.invitations.has(participant.invitation));
    });
}

function NameCell({participant}: { participant: ParticipantRow }) {
    const t = useTranslations("Participants");
    const name = participantName(participant);

    return (
        <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
            <span className="flex flex-wrap items-center gap-2 font-medium">
                {name || <span className="text-muted-foreground">{t("removedPerson")}</span>}
                {participant.pending && <Badge variant="outline">{t("pendingPerson")}</Badge>}
                {participant.removed && <Badge variant="outline">{t("removed")}</Badge>}
            </span>
            {participant.comment &&
                <span className="text-xs text-muted-foreground"><PlainText text={participant.comment}/></span>}
        </div>
    );
}

function PositionCell({participant}: { participant: ParticipantRow }) {
    if (!participant.position) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <div className="flex flex-col whitespace-normal">
            <span>{participant.position.name}</span>
            {(participant.roleName || participant.vocalPart) && (
                <span
                    className="text-xs text-muted-foreground">{[participant.roleName, participant.vocalPart?.name].filter(Boolean).join(", ")}</span>
            )}
        </div>
    );
}

function ContactCell({participant}: { participant: ParticipantRow }) {
    const t = useTranslations("Participants");
    const whatsApp = whatsAppUrl(participant.phone);

    if (!participant.email && !participant.phone) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <div className="flex flex-col gap-1 text-sm whitespace-nowrap">
            {participant.email && (
                <a href={`mailto:${participant.email}`}
                   className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                    <Mail className="size-3.5 text-muted-foreground" aria-hidden/>{participant.email}
                </a>
            )}
            {participant.phone && (
                <span className="inline-flex items-center gap-2">
                    <a href={`tel:${participant.phone.replace(/[^\d+]/g, "")}`}
                       className="underline-offset-2 hover:underline">{participant.phone}</a>
                    {whatsApp && (
                        <a href={whatsApp} target="_blank" rel="noopener noreferrer"
                           className="inline-flex text-muted-foreground hover:text-foreground"
                           aria-label={t("whatsAppTo", {name: participantName(participant)})}>
                            <MessageCircle className="size-4"/>
                        </a>
                    )}
                </span>
            )}
        </div>
    );
}

function DietaryCell({participant}: { participant: ParticipantRow }) {
    const t = useTranslations("Participants");

    if (!participant.dietary) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="icon-sm"
                                            aria-label={t("dietaryOf", {name: participantName(participant)})}/>}>
                <Utensils/>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm">
                <PlainText text={participant.dietary}/>
            </PopoverContent>
        </Popover>
    );
}

function FeeCell({participant, revivalId, canWriteBudget}: {
    participant: ParticipantRow;
    revivalId: string;
    canWriteBudget: boolean
}) {
    const t = useTranslations("Participants");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (participant.fee == null) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <div className="flex items-center gap-2">
            <AmountText value={participant.fee}/>
            {canWriteBudget && !participant.removed ? (
                <Switch checked={participant.feePaid} disabled={pending}
                        aria-label={t("feePaidFor", {name: participantName(participant)})}
                        onCheckedChange={paid => startTransition(async () => {
                            feedback(await setParticipantFeePaidAction({
                                    revivalId,
                                    id: participant.id,
                                    version: participant.version,
                                    paid
                                }),
                                paid ? t("markedPaid") : t("markedUnpaid"));
                        })}/>
            ) : (
                <Badge
                    variant={participant.feePaid ? "secondary" : "outline"}>{participant.feePaid ? t("paid") : t("unpaid")}</Badge>
            )}
        </div>
    );
}

function RowActions({participant, onEdit, onInvite, onRemove}: {
    participant: ParticipantRow;
    onEdit: (participant: ParticipantRow) => void;
    onInvite: (participant: ParticipantRow) => void;
    onRemove: (participant: ParticipantRow) => void;
}) {
    const t = useTranslations("Participants");

    if (participant.removed) {
        return null;
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"
                                                 aria-label={t("rowMenu", {name: participantName(participant)})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(participant)}><Pencil/>{t("edit")}</DropdownMenuItem>
                {participant.response !== "NO" && (
                    <DropdownMenuItem onClick={() => onInvite(participant)}>
                        <Send/>{participant.invitation === "NOT_INVITED" ? t("invite") : t("remind")}
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onClick={() => onRemove(participant)}><Trash2/>{t("remove")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function RemoveDialog({participant, revivalId, onOpenChange}: {
    participant: ParticipantRow;
    revivalId: string;
    onOpenChange: (open: boolean) => void
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Participants.removeTitle", {name: participantName(participant)})}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {participant.pending ? t("Participants.removePendingDescription") : t("Participants.removeDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending}
                                       onClick={() => startTransition(async () => {
                                           if (feedback(await removeParticipantAction({
                                               revivalId,
                                               id: participant.id,
                                               version: participant.version
                                           }), t("Participants.removedToast"))) {
                                               onOpenChange(false);
                                           }
                                       })}>
                        {t("Participants.remove")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function useColumns({revivalId, canWrite, canWriteBudget, canReadDietary, actions}: {
    revivalId: string;
    canWrite: boolean;
    canWriteBudget: boolean;
    canReadDietary: boolean;
    actions: Omit<React.ComponentProps<typeof RowActions>, "participant">;
}) {
    const t = useTranslations("Participants");
    const columns: DataTableColumnDef<ParticipantRow>[] = [];

    if (canWrite) {
        columns.push(selectColumn({
            all: t("selectAll"),
            row: participant => t("select", {name: participantName(participant)})
        }));
    }
    columns.push(
        {
            id: "name",
            accessorFn: participant => `${participant.lastName} ${participant.firstName}`,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("name")}/>,
            cell: ({row}) => <NameCell participant={row.original}/>,
        },
        {
            id: "kind",
            accessorFn: participant => participant.kind,
            header: () => t("kind"),
            cell: ({row}) => <KindBadge kind={row.original.kind}/>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "position",
            accessorFn: participant => participant.position?.name ?? "",
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("position")}/>,
            cell: ({row}) => <PositionCell participant={row.original}/>,
        },
        {
            id: "response",
            accessorFn: participant => PARTICIPANT_RESPONSES.indexOf(participant.response),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("response")}/>,
            cell: ({row}) => <ResponseBadge response={row.original.response}/>,
        },
        {
            id: "invitation",
            accessorFn: participant => INVITATION_STATES.indexOf(participant.invitation),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("invitationState")}/>,
            cell: ({row}) => <InvitationBadge state={row.original.invitation}/>,
            meta: {className: "hidden lg:table-cell"},
        },
        {
            id: "fee",
            header: () => t("fee"),
            cell: ({row}) => <FeeCell participant={row.original} revivalId={revivalId}
                                      canWriteBudget={canWriteBudget}/>,
        },
    );
    if (canReadDietary) {
        columns.push({
            id: "dietary",
            header: () => t("dietary"),
            cell: ({row}) => <DietaryCell participant={row.original}/>,
            meta: {className: "w-16"},
        });
    }
    columns.push({
        id: "contact",
        header: () => t("contact"),
        cell: ({row}) => <ContactCell participant={row.original}/>,
        meta: {className: "hidden xl:table-cell"},
    });
    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions participant={row.original} {...actions}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

/**
 * The revival's participants and helpers (M6a, 5.6) in one table: search, a filter per answer, kind, position and
 * invitation, removed ones on request, and the steering group's actions — adding from Spexregister or as pending
 * people, inviting, the Swish and WhatsApp settings, and a row menu to edit, remind or remove.
 */
export function ParticipantTable({
                                     revivalId,
                                     participants,
                                     positions,
                                     vocalParts,
                                     settings,
                                     canWrite,
                                     canWriteBudget,
                                     canReadDietary,
                                     showRemoved
                                 }: {
    revivalId: string;
    participants: ParticipantRow[];
    positions: PositionValue[];
    vocalParts: VocalPartValue[];
    settings: ParticipationSettingsValue | null;
    canWrite: boolean;
    canWriteBudget: boolean;
    canReadDietary: boolean;
    showRemoved: boolean;
}) {
    const t = useTranslations();
    const [filter, setFilter] = useState<ParticipantFilter>(EMPTY_PARTICIPANT_FILTER);
    const [selected, setSelected] = useState<ParticipantRow[]>([]);
    const [editing, setEditing] = useState<ParticipantRow | null>(null);
    const [removing, setRemoving] = useState<ParticipantRow | null>(null);
    const [inviting, setInviting] = useState<ParticipantRow[] | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const filtered = useMemo(() => filterParticipants(participants, filter), [participants, filter]);
    const active = filter.query.trim() !== "" || filter.responses.size > 0 || filter.kinds.size > 0 || filter.positions.size > 0 || filter.invitations.size > 0;
    const update = (changes: Partial<ParticipantFilter>) => setFilter(previous => ({...previous, ...changes}));
    const columns = useColumns({
        revivalId, canWrite, canWriteBudget, canReadDietary,
        actions: {onEdit: setEditing, onRemove: setRemoving, onInvite: participant => setInviting([participant])},
    });
    const positionOptions = useMemo(() => {
        const held = new Map(participants.filter(participant => participant.position).map(participant => [participant.position!.id, participant.position!.name]));

        return [
            ...[...held.entries()].map(([value, label]) => ({value, label})),
            ...(participants.some(participant => !participant.position) ? [{
                value: NO_POSITION,
                label: t("Participants.noPosition"),
                sortKey: "~"
            }] : []),
        ];
    }, [participants, t]);
    const invitable = (rows: ParticipantRow[]) => rows.filter(participant => !participant.removed && participant.response !== "NO");
    const inviteTargets = selected.length > 0
        ? invitable(selected)
        : invitable(participants).filter(participant => participant.invitation === "NOT_INVITED");

    return (
        <div className="flex flex-col gap-6">
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "name", desc: false}]}
                       onSelectionChange={setSelected}
                       rowClassName={participant => participant.removed && "text-muted-foreground"}
                       empty={<DataEmpty title={t("Participants.empty")}
                                         description={canWrite ? t("Participants.emptyHint") : t("Participants.emptyReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Participants.filterPlaceholder")} value={filter.query}
                                   onChange={change => update({query: change.target.value})}
                                   aria-label={t("Common.search")} className="h-8 pr-8"/>
                            {filter.query && (
                                <Button variant="ghost" size="icon"
                                        className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                        aria-label={t("Common.clearSearch")} onClick={() => update({query: ""})}>
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                        <DataFilter title={t("Participants.response")}
                                    options={PARTICIPANT_RESPONSES.map((response, index) => ({
                                        label: t(`Participants.responses.${response}`),
                                        value: response,
                                        sortKey: String(index)
                                    }))}
                                    selectedValues={filter.responses} onSelect={responses => update({responses})}
                                    onClear={() => update({responses: new Set()})}/>
                        <DataFilter title={t("Participants.kind")}
                                    options={PARTICIPANT_KINDS.map(kind => ({
                                        label: t(`Participants.kinds.${kind}`),
                                        value: kind
                                    }))}
                                    selectedValues={filter.kinds} onSelect={kinds => update({kinds})}
                                    onClear={() => update({kinds: new Set()})}/>
                        {positionOptions.length > 0 && (
                            <DataFilter title={t("Participants.position")} options={positionOptions}
                                        selectedValues={filter.positions} onSelect={positions => update({positions})}
                                        onClear={() => update({positions: new Set()})}/>
                        )}
                        <DataFilter title={t("Participants.invitationState")}
                                    options={INVITATION_STATES.map((state, index) => ({
                                        label: t(`Participants.invitation.${state}`),
                                        value: state,
                                        sortKey: String(index)
                                    }))}
                                    selectedValues={filter.invitations} onSelect={invitations => update({invitations})}
                                    onClear={() => update({invitations: new Set()})}/>
                        {active && (
                            <Button variant="ghost" onClick={() => setFilter(EMPTY_PARTICIPANT_FILTER)}
                                    className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        <UrlSwitch param="removed" shown={showRemoved} label={t("Participants.showRemoved")}/>
                    </div>
                    {canWrite && (
                        <div className="flex flex-wrap gap-2">
                            {settings && (
                                <Button variant="outline"
                                        onClick={() => setSettingsOpen(true)}><Settings/>{t("Participants.settings")}
                                </Button>
                            )}
                            <Button variant="outline" disabled={inviteTargets.length === 0}
                                    onClick={() => setInviting(inviteTargets)}>
                                <Send/>{selected.length > 0 ? t("Participants.inviteSelected", {count: inviteTargets.length}) : t("Participants.inviteAll", {count: inviteTargets.length})}
                            </Button>
                            <ParticipantAddSheet revivalId={revivalId} positions={positions}/>
                        </div>
                    )}
                </div>
            </DataTable>
            {editing && (
                <ParticipantEditDialog key={editing.id} revivalId={revivalId} participant={editing}
                                       positions={positions} vocalParts={vocalParts}
                                       onOpenChange={open => !open && setEditing(null)}/>
            )}
            {removing && <RemoveDialog participant={removing} revivalId={revivalId}
                                       onOpenChange={open => !open && setRemoving(null)}/>}
            {inviting && <InviteDialog revivalId={revivalId} participants={inviting}
                                       onOpenChange={open => !open && setInviting(null)}/>}
            {settingsOpen && settings &&
                <ParticipationSettingsDialog revivalId={revivalId} settings={settings} onOpenChange={setSettingsOpen}/>}
        </div>
    );
}
