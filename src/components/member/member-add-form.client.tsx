"use client";

import * as React from "react";
import {useEffect, useId, useRef, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {RevivalRole} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {catalogChoices, catalogName} from "@/components/catalog/catalog";
import {useCapabilities} from "@/components/catalog/catalog-provider.client";
import {X} from "lucide-react";
import {addMemberAction, searchMemberCandidatesAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_MEMBER_NAME, memberAddSchema, MIN_MEMBER_QUERY} from "@/lib/revival/schema";
import {track} from "@/utils/umami";

export type AssignableRole = Extract<RevivalRole, "DIRECTEUR" | "STEERING_GROUP">;

type Candidate = { email: string; displayName: string | null; hasAccess: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Searches the users of the FGV realm as the query is typed, at least {@link MIN_MEMBER_QUERY} characters, waiting a
 * moment after the last key.
 */
function useCandidates(revivalId: string, query: string) {
    const [result, setResult] = useState<{ query: string; candidates: Candidate[]; unavailable: boolean } | null>(null);
    const trimmed = query.trim();

    useEffect(() => {
        if (trimmed.length < MIN_MEMBER_QUERY) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            const found = await searchMemberCandidatesAction(revivalId, trimmed);

            if (!cancelled) {
                setResult({query: trimmed, candidates: found.ok ? found.data : [], unavailable: !found.ok});
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [revivalId, trimmed]);

    const current = result?.query === trimmed ? result : null;

    return {
        candidates: trimmed.length < MIN_MEMBER_QUERY ? [] : current?.candidates ?? [],
        searching: trimmed.length >= MIN_MEMBER_QUERY && !current,
        unavailable: !!current?.unavailable,
    };
}

/**
 * Adds a member by picking a user of the FGV realm, searched by name or email. An email that is no user's is invited:
 * the server creates an account without access and Keycloak emails them, and a super admin then grants access.
 */
export function AddMemberForm({revivalId, role, onAdded}: {
    revivalId: string;
    role: AssignableRole;
    onAdded?: (name: string) => void
}) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const choices = catalogChoices(useCapabilities());
    const listId = useId();
    const searchRef = useRef<HTMLInputElement>(null);
    const refocus = useRef(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Candidate | null>(null);
    const [name, setName] = useState({firstName: "", lastName: ""});
    const [capabilities, setCapabilitiesState] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const {candidates, searching, unavailable} = useCandidates(revivalId, selected ? "" : query);
    const label = role === "DIRECTEUR" ? t("Members.addDirecteur") : t("Members.addMember");
    const typedEmail = query.trim().toLowerCase();
    // A typed address nobody in the realm has, once the search has answered: they are invited
    const inviting = !selected && EMAIL.test(typedEmail) && !searching && !unavailable
        && !candidates.some(candidate => candidate.email.toLowerCase() === typedEmail);

    // Ready for the next person once the search is enabled again
    useEffect(() => {
        if (!pending && refocus.current) {
            refocus.current = false;
            searchRef.current?.focus();
        }
    }, [pending]);

    const reset = () => {
        setQuery("");
        setSelected(null);
        setName({firstName: "", lastName: ""});
        setCapabilitiesState([]);
    };

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();

                const parsed = memberAddSchema.safeParse({
                    revivalId, email: selected?.email ?? typedEmail, role, capabilities, ...(inviting ? name : {}),
                });

                if (!parsed.success) {
                    setError(t(selected || EMAIL.test(typedEmail) ? `Validation.${parsed.error.issues[0].message}` : "Members.pickOrType"));
                    return;
                }
                setError(null);
                const added = selected?.displayName ?? ([name.firstName, name.lastName].filter(Boolean).join(" ") || parsed.data.email);

                startTransition(async () => {
                    const result = await addMemberAction(parsed.data);

                    if (feedback(result, result.ok && result.data.invited ? t("Members.invited") : t("Members.added"))) {
                        track("member-add", {role, capabilities: parsed.data.capabilities.length});
                        reset();
                        onAdded?.(added);
                        refocus.current = true;
                    }
                });
            }}
        >
            <div className="min-w-0 space-y-1">
                {selected ? (
                    <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
                        <span className="truncate font-medium">{selected.displayName ?? selected.email}</span>
                        {selected.displayName &&
                            <span className="truncate text-muted-foreground">{selected.email}</span>}
                        <Button type="button" variant="ghost" size="icon-sm" className="ml-auto shrink-0"
                                aria-label={t("Members.changePerson")}
                                onClick={() => setSelected(null)}><X/></Button>
                    </div>
                ) : (
                    <Input
                        ref={searchRef}
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder={t("Members.searchPlaceholder")}
                        aria-label={`${label}: ${t("Members.search")}`}
                        role="combobox"
                        aria-expanded={candidates.length > 0}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-invalid={error ? true : undefined}
                        autoComplete="off"
                        disabled={pending}
                    />
                )}
                {!selected && candidates.length > 0 && (
                    <ul id={listId} role="listbox" aria-label={t("Members.candidates")}
                        className="divide-y rounded-md border">
                        {candidates.map(candidate => (
                            <li key={candidate.email} role="option" aria-selected={false}>
                                <button type="button"
                                        className="flex w-full flex-wrap items-baseline gap-x-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                        onClick={() => {
                                            setSelected(candidate);
                                            setError(null);
                                        }}>
                                    <span className="font-medium">{candidate.displayName ?? candidate.email}</span>
                                    {candidate.displayName &&
                                        <span className="text-muted-foreground">{candidate.email}</span>}
                                    {!candidate.hasAccess &&
                                        <Badge variant="outline" className="ml-auto">{t("Members.noAccessYet")}</Badge>}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {!selected && searching && <p className="text-xs text-muted-foreground">{t("Members.searching")}</p>}
                {!selected && unavailable &&
                    <p className="text-xs text-muted-foreground">{t("Members.directoryUnavailable")}</p>}
                {!selected && !searching && !unavailable && query.trim().length >= MIN_MEMBER_QUERY && candidates.length === 0 && !inviting && (
                    <p className="text-xs text-muted-foreground">{t("Members.noCandidates")}</p>
                )}
                {selected && !selected.hasAccess &&
                    <p className="text-xs text-muted-foreground">{t("Members.selectedWithoutAccess")}</p>}
            </div>
            {inviting && (
                <div className="space-y-2 rounded-md border border-dashed p-3">
                    <p className="text-sm text-muted-foreground">{t("Members.inviteDescription", {email: typedEmail})}</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input value={name.firstName} maxLength={MAX_MEMBER_NAME} placeholder={t("Members.firstName")}
                               aria-label={t("Members.firstName")}
                               onChange={event => setName({...name, firstName: event.target.value})}
                               disabled={pending}/>
                        <Input value={name.lastName} maxLength={MAX_MEMBER_NAME} placeholder={t("Members.lastName")}
                               aria-label={t("Members.lastName")}
                               onChange={event => setName({...name, lastName: event.target.value})} disabled={pending}/>
                    </div>
                </div>
            )}
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
            <div className="flex justify-end">
                <Button type="submit" disabled={pending}>{inviting ? t("Members.invite") : label}</Button>
            </div>
        </form>
    );
}
