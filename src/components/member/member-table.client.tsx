"use client";

import * as React from "react";
import {useMemo, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Check, MoreHorizontal, Pencil, Plus, Trash2, X} from "lucide-react";
import type {RevivalRole} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {catalogChoices, catalogName} from "@/components/catalog/catalog";
import {useCapabilities} from "@/components/catalog/catalog-provider.client";
import {type Member, memberName} from "@/components/member/member";
import {AddMemberForm, type AssignableRole} from "@/components/member/member-add-form.client";
import {RemoveMemberDialog} from "@/components/member/remove-member-dialog.client";
import {setCapabilitiesAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";
import {track} from "@/utils/umami";

export const MEMBER_ROLES: AssignableRole[] = ["DIRECTEUR", "STEERING_GROUP"];

/**
 * Every word must appear in the name, email address or one of the areas of responsibility; the role and area filters
 * must both match. A directeur holds no areas, so an area filter that is not everything leaves them out.
 */
export function filterMembers(members: Member[], query: string, roles: Set<string>, areas: Set<string> | null, locale: string, fallback: string): Member[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return members.filter(member => {
        const held = member.capabilities ?? [];
        const text = [memberName(member, fallback), member.email ?? "", ...held.map(capability => catalogName(capability, locale))].join(" ").toLowerCase();

        return roles.has(member.role)
            && (!areas || held.some(capability => areas.has(capability.id)))
            && words.every(word => text.includes(word));
    });
}

/**
 * The member's areas of responsibility as checkboxes, each saved as it is ticked: the active ones, and any retired one
 * the member still holds, which stays until it is unticked.
 */
export function CapabilityEditor({member}: { member: Member }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const choices = catalogChoices(useCapabilities(), member.capabilities ?? []);
    const current = new Set((member.capabilities ?? []).map(capability => capability.id));

    return (
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label={t("Members.capabilities")}>
            {choices.map(capability => (
                <label key={capability.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={current.has(capability.id)}
                        disabled={pending}
                        onCheckedChange={(checked) => {
                            const next = new Set(current);

                            if (checked) {
                                next.add(capability.id);
                            } else {
                                next.delete(capability.id);
                            }
                            startTransition(async () => {
                                if (feedback(await setCapabilitiesAction({
                                    id: member.id,
                                    version: member.version ?? 0,
                                    capabilities: choices.filter(choice => next.has(choice.id)).map(choice => choice.id),
                                }), t("Members.capabilitiesSaved"))) {
                                    track("member-capabilities", {count: next.size});
                                }
                            });
                        }}
                    />
                    {capability.retired ? t("Catalog.retiredName", {name: catalogName(capability, locale)}) : catalogName(capability, locale)}
                </label>
            ))}
        </div>
    );
}

/**
 * Adds members one after another: the sheet stays open after each, listing those added, until closed.
 */
function AddMemberButton({revivalId, role}: { revivalId: string; role: AssignableRole }) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);
    const [added, setAdded] = useState<string[]>([]);
    const label = role === "DIRECTEUR" ? t("Members.addDirecteur") : t("Members.addMember");

    return (
        <>
            <Button variant={role === "DIRECTEUR" ? "outline" : "default"} onClick={() => {
                setAdded([]);
                setOpen(true);
            }}><Plus/>{label}</Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[600px]">
                    <SheetHeader className="shrink-0 p-6 pb-4">
                        <SheetTitle>{label}</SheetTitle>
                        <SheetDescription>{t(role === "DIRECTEUR" ? "Members.addDirecteurDescription" : "Members.addMemberDescription")}</SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto border-t px-6 py-6">
                        {open && <AddMemberForm revivalId={revivalId} role={role}
                                                onAdded={name => setAdded(previous => [...previous, name])}/>}
                        {added.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">{t("Members.addedSoFar", {count: added.length})}</h4>
                                <ul className="space-y-1 text-sm"
                                    aria-label={t("Members.addedSoFar", {count: added.length})}>
                                    {added.map((name, index) => (
                                        <li key={index} className="flex items-center gap-2"><Check
                                            className="size-4 text-primary"/>{name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <SheetFooter className="mt-auto shrink-0 border-t bg-muted/30 p-6 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>{t("Members.done")}</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

/**
 * A revival's directeurs and steering group in one table, as the other lists are: search, a filter per role and per
 * area of responsibility, and a row menu. Everyone who can see the revival sees names, roles and areas; email addresses
 * only arrive for super admins and directeurs (FR-019c). Controls show only when the server says the user may manage
 * that role.
 */
export function MemberTable({revivalId, members, canManageDirecteurs, canManageSteeringGroup}: {
    revivalId: string;
    members: Member[];
    canManageDirecteurs: boolean;
    canManageSteeringGroup: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const fallback = t("Members.waitingPerson");
    const [query, setQuery] = useState("");
    const [roles, setRoles] = useState<Set<string>>(new Set(MEMBER_ROLES));
    const [areas, setAreas] = useState<Set<string> | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
    const [removing, setRemoving] = useState<Member | null>(null);
    const shown = useMemo(() => members.filter(member => (MEMBER_ROLES as RevivalRole[]).includes(member.role)), [members]);
    const filtered = useMemo(() => filterMembers(shown, query, roles, areas, locale, fallback), [shown, query, roles, areas, locale, fallback]);
    const active = query.trim() !== "" || roles.size < MEMBER_ROLES.length || areas !== null;
    const showEmails = shown.some(member => member.email);
    const canManage = (member: Member) => member.role === "DIRECTEUR" ? canManageDirecteurs : canManageSteeringGroup;
    // Edited by id, so the dialog follows the member as the page refreshes with each save's new version
    const editedMember = shown.find(member => member.id === editing);
    // Only the areas someone holds can match, retired ones included
    const areaOptions = shown.flatMap(member => member.capabilities ?? [])
        .filter((capability, index, all) => all.findIndex(other => other.id === capability.id) === index);

    const columns: DataTableColumnDef<Member>[] = [
        {
            id: "name",
            accessorFn: member => memberName(member, fallback),
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Members.name")}/>,
            cell: ({row}) => (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">{memberName(row.original, fallback)}</span>
                    {row.original.state === "WAITING" && <Badge variant="outline">{t("MemberState.WAITING")}</Badge>}
                    {row.original.state === "WAITING" && row.original.invitedAt && (
                        <span
                            className="text-xs text-muted-foreground">{t("Members.invitedAt", {at: formatInstant(row.original.invitedAt)?.slice(0, 10) ?? ""})}</span>
                    )}
                </div>
            ),
        },
        {
            id: "role",
            accessorFn: member => MEMBER_ROLES.indexOf(member.role as AssignableRole),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Members.role")}/>,
            cell: ({row}) => (
                <Badge
                    variant={row.original.role === "DIRECTEUR" ? "default" : "secondary"}>{t(`Role.${row.original.role}`)}</Badge>
            ),
            meta: {className: "w-36"},
        },
        ...(showEmails ? [{
            id: "email",
            accessorFn: (member: Member) => member.email ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Members.email")}/>,
            cell: ({row}) => <span className="text-muted-foreground">{row.original.email}</span>,
            meta: {className: "hidden md:table-cell"},
        } satisfies DataTableColumnDef<Member>] : []),
        {
            id: "capabilities",
            header: () => t("Members.capabilities"),
            cell: ({row}) => (
                <div className="flex flex-wrap gap-1">
                    {(row.original.capabilities ?? []).map(capability => (
                        <Badge key={capability.id} variant="outline">{catalogName(capability, locale)}</Badge>
                    ))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("Members.actions")}</span>,
            cell: ({row}) => {
                const name = memberName(row.original, fallback);

                return canManage(row.original) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"
                                                             aria-label={t("Members.openMenu", {name})}/>}>
                            <MoreHorizontal className="h-4 w-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {row.original.role === "STEERING_GROUP" && (
                                <DropdownMenuItem onClick={() => setEditing(row.original.id)}>
                                    <Pencil/>
                                    {t("Members.editCapabilities")}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => setRemoving(row.original)}>
                                <Trash2/>
                                {t("Common.remove")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            meta: {className: "w-12 text-right"},
        },
    ];

    const reset = () => {
        setQuery("");
        setRoles(new Set(MEMBER_ROLES));
        setAreas(null);
    };

    return (
        <>
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "role", desc: false}]}
                       empty={<DataEmpty title={t("Members.empty")} description={t("Members.emptyHint")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Members.filterPlaceholder")} value={query}
                                   onChange={event => setQuery(event.target.value)}
                                   aria-label={t("Common.search")} className="h-8 pr-8"/>
                            {query && (
                                <Button variant="ghost" size="icon"
                                        className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                        aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}>
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                        <DataFilter title={t("Members.role")}
                                    options={MEMBER_ROLES.map((role, index) => ({
                                        label: t(`Role.${role}`),
                                        value: role,
                                        sortKey: String(index)
                                    }))}
                                    selectedValues={roles}
                                    onSelect={setRoles}
                                    onClear={() => setRoles(new Set(MEMBER_ROLES))}/>
                        {areaOptions.length > 0 && (
                            <DataFilter title={t("Members.capabilities")}
                                        options={areaOptions.map(capability => ({
                                            label: catalogName(capability, locale),
                                            value: capability.id
                                        }))}
                                        selectedValues={areas ?? new Set()}
                                        onSelect={values => setAreas(values.size > 0 ? values : null)}
                                        onClear={() => setAreas(null)}/>
                        )}
                        {active && (
                            <Button variant="ghost" onClick={reset} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                    </div>
                    {(canManageDirecteurs || canManageSteeringGroup) && (
                        <div className="flex flex-wrap gap-2">
                            {canManageDirecteurs && <AddMemberButton revivalId={revivalId} role="DIRECTEUR"/>}
                            {canManageSteeringGroup && <AddMemberButton revivalId={revivalId} role="STEERING_GROUP"/>}
                        </div>
                    )}
                </div>
            </DataTable>
            <Sheet open={!!editedMember} onOpenChange={open => !open && setEditing(null)}>
                {editedMember && (
                    <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[600px]">
                        <SheetHeader className="shrink-0 p-6 pb-4">
                            <SheetTitle>{t("Members.editCapabilitiesTitle", {name: memberName(editedMember, fallback)})}</SheetTitle>
                            <SheetDescription>{t("Members.editCapabilitiesDescription")}</SheetDescription>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto border-t px-6 py-6">
                            <CapabilityEditor member={editedMember}/>
                        </div>
                        <SheetFooter className="mt-auto shrink-0 border-t bg-muted/30 p-6 pt-4">
                            <Button variant="outline" onClick={() => setEditing(null)}>{t("Common.close")}</Button>
                        </SheetFooter>
                    </SheetContent>
                )}
            </Sheet>
            {removing && (
                <RemoveMemberDialog memberId={removing.id} name={memberName(removing, fallback)} open
                                    onOpenChange={open => !open && setRemoving(null)}/>
            )}
        </>
    );
}
