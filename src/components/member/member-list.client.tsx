"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {MemberState, RevivalRole} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {catalogChoices, catalogName, type CatalogEntryValue} from "@/components/catalog/catalog";
import {useCapabilities} from "@/components/catalog/catalog-provider.client";
import {RemoveMemberButton} from "@/components/member/remove-member-button.client";
import {addMemberAction, setCapabilitiesAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {memberAddSchema} from "@/lib/revival/schema";
import {track} from "@/utils/umami";

export type Member = {
    id: string;
    role: RevivalRole;
    capabilities?: CatalogEntryValue[] | null;
    state: MemberState;
    displayName?: string | null;
    email?: string | null;
    version?: number | null;
};

type AssignableRole = Extract<RevivalRole, "DIRECTEUR" | "STEERING_GROUP">;

function memberName(member: Member, fallback: string): string {
    return member.displayName ?? member.email ?? fallback;
}

/**
 * The member's areas of responsibility as checkboxes: the active ones, and any retired one the member still holds,
 * which stays until it is unticked.
 */
function CapabilityEditor({member}: { member: Member }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const choices = catalogChoices(useCapabilities(), member.capabilities ?? []);
    const current = new Set((member.capabilities ?? []).map(capability => capability.id));

    return (
        <div className="flex flex-wrap gap-3" role="group" aria-label={t("Members.capabilities")}>
            {choices.map(capability => (
                <label key={capability.id} className="flex items-center gap-1.5 text-sm">
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

function AddMemberForm({revivalId, role}: { revivalId: string; role: AssignableRole }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const choices = catalogChoices(useCapabilities());
    const [email, setEmail] = useState("");
    const [capabilities, setCapabilitiesState] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const label = role === "DIRECTEUR" ? t("Members.addDirecteur") : t("Members.addMember");

    return (
        <form
            className="space-y-3"
            onSubmit={(event) => {
                event.preventDefault();

                const parsed = memberAddSchema.safeParse({revivalId, email: email.trim(), role, capabilities});

                if (!parsed.success) {
                    setError(t("Validation.emailInvalid"));
                    return;
                }
                setError(null);
                startTransition(async () => {
                    if (feedback(await addMemberAction(parsed.data), t("Members.added"))) {
                        track("member-add", {role, capabilities: parsed.data.capabilities.length});
                        setEmail("");
                        setCapabilitiesState([]);
                    }
                });
            }}
        >
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder={t("Members.email")}
                    aria-label={`${label}: ${t("Members.email")}`}
                    aria-invalid={error ? true : undefined}
                    disabled={pending}
                />
                <Button type="submit" disabled={pending}>{label}</Button>
            </div>
            {role === "STEERING_GROUP" && (
                <div className="flex flex-wrap gap-3" role="group" aria-label={t("Members.capabilities")}>
                    {choices.map(capability => (
                        <label key={capability.id} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                                checked={capabilities.includes(capability.id)}
                                onCheckedChange={(checked) => setCapabilitiesState(previous =>
                                    checked ? [...previous, capability.id] : previous.filter(id => id !== capability.id))}
                            />
                            {catalogName(capability, locale)}
                        </label>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </form>
    );
}

/**
 * Directeurs or steering group members of a revival. Everyone who can see the revival sees names, roles and
 * capabilities; email addresses only arrive for super admins and directeurs (FR-019c). Controls show only when the
 * server says the user may manage them.
 */
export function MemberList({revivalId, role, members, canManage}: {
    revivalId: string;
    role: AssignableRole;
    members: Member[];
    canManage: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const shown = members.filter(member => member.role === role);
    const showEmails = shown.some(member => member.email);

    return (
        <div className="space-y-4">
            {shown.length === 0 ? (
                <p className="text-sm text-muted-foreground">{role === "DIRECTEUR" ? t("Members.noDirecteurs") : t("Members.noMembers")}</p>
            ) : (
                <ul className="divide-y rounded-md border">
                    {shown.map(member => {
                        const name = memberName(member, t("Members.waitingPerson"));

                        return (
                            <li key={member.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{name}</span>
                                        {member.state === "WAITING" && <Badge variant="outline">{t("MemberState.WAITING")}</Badge>}
                                    </div>
                                    {showEmails && member.email && member.displayName && (
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                    )}
                                    {role === "STEERING_GROUP" && !canManage && (
                                        <div className="flex flex-wrap gap-1">
                                            {(member.capabilities ?? []).map(capability => (
                                                <Badge key={capability.id} variant="secondary">{catalogName(capability, locale)}</Badge>
                                            ))}
                                        </div>
                                    )}
                                    {role === "STEERING_GROUP" && canManage && <CapabilityEditor member={member}/>}
                                </div>
                                {canManage && <RemoveMemberButton memberId={member.id} name={name}/>}
                            </li>
                        );
                    })}
                </ul>
            )}
            {canManage && <AddMemberForm revivalId={revivalId} role={role}/>}
        </div>
    );
}
