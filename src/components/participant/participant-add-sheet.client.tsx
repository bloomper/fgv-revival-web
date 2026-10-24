"use client";

import * as React from "react";
import {useCallback, useEffect, useId, useMemo, useRef, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Plus, UserPlus} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Spinner} from "@/components/ui/spinner";
import {PositionSelect, type PositionValue} from "@/components/participant/participant-labels";
import {
    addPendingParticipantAction,
    addSpexareParticipantsAction,
    participantCandidatesAction,
    spexareSearchAction,
} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {SpexareCandidateFieldsFragment} from "@/gql/graphql";
import {participantName} from "@/lib/participant/contact";
import {
    MIN_SPEXARE_QUERY,
    PARTICIPANT_KINDS,
    type PendingPersonValues,
    pendingPersonValuesSchema
} from "@/lib/participant/schema";
import {track} from "@/utils/umami";
import {cn} from "@/utils/utils";

type Candidate = SpexareCandidateFieldsFragment;
type TabKey = "candidates" | "search" | "pending";

const TABS: TabKey[] = ["candidates", "search", "pending"];

function CandidateText({candidate}: { candidate: Candidate }) {
    const t = useTranslations("Participants");

    return (
        <span className="flex min-w-0 flex-col">
            <span className="font-medium">{participantName(candidate)}</span>
            <span className="text-xs text-muted-foreground">
                {[candidate.graduation && t("graduation", {graduation: candidate.graduation}), candidate.history.join(", ")].filter(Boolean).join(" · ")}
            </span>
        </span>
    );
}

/**
 * Spexare who took part in the spex or its earlier revivals, with checkboxes to add several at once.
 */
function CandidatesTab({revivalId}: { revivalId: string }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [state, setState] = useState<{ candidates: Candidate[]; unavailable: boolean } | null>(null);
    const [chosen, setChosen] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState("");

    const load = useCallback(async () => {
        const result = await participantCandidatesAction(revivalId);

        setState({candidates: result.ok ? result.data : [], unavailable: !result.ok});
    }, [revivalId]);

    useEffect(() => {
        let cancelled = false;

        participantCandidatesAction(revivalId).then(result => {
            if (!cancelled) {
                setState({candidates: result.ok ? result.data : [], unavailable: !result.ok});
            }
        });
        return () => {
            cancelled = true;
        };
    }, [revivalId]);

    const shown = useMemo(() => {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);

        return (state?.candidates ?? []).filter(candidate => !candidate.added)
            .filter(candidate => words.every(word => `${participantName(candidate)} ${candidate.history.join(" ")}`.toLowerCase().includes(word)));
    }, [state, query]);

    if (!state) {
        return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner/>{t("Common.loading")}</p>;
    }
    if (state.unavailable) {
        return <Alert><AlertDescription>{t("Errors.SPEXREGISTER_UNAVAILABLE")}</AlertDescription></Alert>;
    }

    const add = () => startTransition(async () => {
        const result = await addSpexareParticipantsAction({revivalId, spexareIds: [...chosen]});

        if (feedback(result, t("Participants.addedCount", {count: result.ok ? result.data.count : 0}))) {
            track("participant-add", {count: result.data.count, pending: false});
            setChosen(new Set());
            await load();
        }
    });

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("Participants.candidatesHint")}</p>
            <Input placeholder={t("Participants.filterCandidates")} aria-label={t("Participants.filterCandidates")}
                   value={query}
                   onChange={change => setQuery(change.target.value)}/>
            {shown.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Participants.noCandidates")}</p>
            ) : (
                <>
                    <label className="flex min-h-11 items-center gap-3 border-b px-1 text-sm font-medium">
                        <input type="checkbox" className="size-4 accent-primary"
                               checked={shown.every(candidate => chosen.has(candidate.spexareId))}
                               onChange={change => setChosen(change.target.checked ? new Set(shown.map(candidate => candidate.spexareId)) : new Set())}/>
                        {t("Participants.chooseAll", {count: shown.length})}
                    </label>
                    <ul className="flex flex-col" aria-label={t("Participants.candidates")}>
                        {shown.map(candidate => (
                            <li key={candidate.spexareId}>
                                <label
                                    className="flex min-h-11 items-center gap-3 rounded-md px-1 py-1.5 hover:bg-accent">
                                    <input type="checkbox" className="size-4 shrink-0 accent-primary"
                                           checked={chosen.has(candidate.spexareId)}
                                           aria-label={participantName(candidate)}
                                           onChange={change => setChosen(previous => {
                                               const next = new Set(previous);

                                               if (change.target.checked) {
                                                   next.add(candidate.spexareId);
                                               } else {
                                                   next.delete(candidate.spexareId);
                                               }
                                               return next;
                                           })}/>
                                    <CandidateText candidate={candidate}/>
                                </label>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <Button className="self-end" disabled={pending || chosen.size === 0} onClick={add}>
                <Plus/>{t("Participants.addSelected", {count: chosen.size})}
            </Button>
        </div>
    );
}

/**
 * Searches Spexregister by name as it is typed, at least {@link MIN_SPEXARE_QUERY} characters, waiting a moment after
 * the last key.
 */
function SearchTab({revivalId}: { revivalId: string }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<{ query: string; candidates: Candidate[]; unavailable: boolean } | null>(null);
    const [added, setAdded] = useState<Set<string>>(new Set());
    const trimmed = query.trim();

    useEffect(() => {
        if (trimmed.length < MIN_SPEXARE_QUERY) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            const found = await spexareSearchAction({revivalId, query: trimmed});

            if (!cancelled) {
                setResult({query: trimmed, candidates: found.ok ? found.data : [], unavailable: !found.ok});
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [revivalId, trimmed]);

    const current = trimmed.length >= MIN_SPEXARE_QUERY && result?.query === trimmed ? result : null;

    return (
        <div className="flex flex-col gap-3">
            <div className="space-y-2">
                <Label htmlFor={`${id}-query`}>{t("Participants.searchSpexregister")}</Label>
                <Input id={`${id}-query`} type="search" autoComplete="off" value={query}
                       onChange={change => setQuery(change.target.value)}
                       aria-describedby={`${id}-hint`}/>
                <p id={`${id}-hint`}
                   className="text-xs text-muted-foreground">{t("Participants.searchHint", {count: MIN_SPEXARE_QUERY})}</p>
            </div>
            {trimmed.length >= MIN_SPEXARE_QUERY && !current && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner/>{t("Participants.searching")}</p>
            )}
            {current?.unavailable &&
                <Alert><AlertDescription>{t("Errors.SPEXREGISTER_UNAVAILABLE")}</AlertDescription></Alert>}
            {current && !current.unavailable && (current.candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground" role="status">{t("Participants.noMatches")}</p>
            ) : (
                <ul className="flex flex-col divide-y" aria-label={t("Participants.searchResults")}>
                    {current.candidates.map(candidate => {
                        const isAdded = candidate.added || added.has(candidate.spexareId);

                        return (
                            <li key={candidate.spexareId}
                                className="flex min-h-11 items-center justify-between gap-3 py-1.5">
                                <CandidateText candidate={candidate}/>
                                {isAdded ? <Badge variant="secondary">{t("Participants.alreadyAdded")}</Badge> : (
                                    <Button size="sm" variant="outline" disabled={pending}
                                            aria-label={t("Participants.addName", {name: participantName(candidate)})}
                                            onClick={() => startTransition(async () => {
                                                const outcome = await addSpexareParticipantsAction({
                                                    revivalId,
                                                    spexareIds: [candidate.spexareId]
                                                });

                                                if (feedback(outcome, t("Participants.addedName", {name: participantName(candidate)}))) {
                                                    track("participant-add", {count: 1, pending: false});
                                                    setAdded(previous => new Set(previous).add(candidate.spexareId));
                                                }
                                            })}>
                                        <Plus/>{t("Common.add")}
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ))}
        </div>
    );
}

const EMPTY_PENDING: PendingPersonValues = {
    kind: "PARTICIPANT",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    positionId: "",
    compensationPerShift: ""
};

/**
 * Someone who is not in Spexregister: a participant to be invited by email, or a helper reached by email or phone.
 */
function PendingTab({revivalId, positions}: { revivalId: string; positions: PositionValue[] }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<PendingPersonValues>({
        resolver: zodResolver(pendingPersonValuesSchema),
        defaultValues: EMPTY_PENDING
    });
    const {errors} = form.formState;
    const kind = useWatch({control: form.control, name: "kind"});
    const field = (name: string) => `${id}-${name}`;
    const error = (name: string, message?: string) => message &&
        <p id={`${field(name)}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const described = (name: string, message?: string) => message ? {
        "aria-invalid": true,
        "aria-describedby": `${field(name)}-error`
    } : {};

    return (
        <form className="flex flex-col gap-4" noValidate
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  const result = await addPendingParticipantAction({revivalId, values});

                  if (feedback(result, t("Participants.addedName", {name: `${values.firstName} ${values.lastName}`}))) {
                      track("participant-add", {count: 1, pending: true});
                      // Keeps the registered inputs: the React Compiler does not register them again after a reset
                      form.reset({...EMPTY_PENDING, kind: values.kind}, {keepFieldsRef: true});
                  }
              }))}>
            <p className="text-sm text-muted-foreground">{t("Participants.pendingHint")}</p>
            <div className="space-y-2">
                <Label htmlFor={field("kind")}>{t("Participants.kind")}</Label>
                <NativeSelect id={field("kind")} className="w-full" {...form.register("kind")}>
                    {PARTICIPANT_KINDS.map(value => <option key={value}
                                                            value={value}>{t(`Participants.kinds.${value}`)}</option>)}
                </NativeSelect>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={field("first")}>{t("Participants.firstName")}</Label>
                    <Input id={field("first")}
                           autoComplete="off" {...described("first", errors.firstName?.message)} {...form.register("firstName")}/>
                    {error("first", errors.firstName?.message)}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={field("last")}>{t("Participants.lastName")}</Label>
                    <Input id={field("last")}
                           autoComplete="off" {...described("last", errors.lastName?.message)} {...form.register("lastName")}/>
                    {error("last", errors.lastName?.message)}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={field("email")}>{t("Participants.email")}</Label>
                    <Input id={field("email")} type="email"
                           autoComplete="off" {...described("email", errors.email?.message)} {...form.register("email")}/>
                    {error("email", errors.email?.message)}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={field("phone")}>{t("Participants.phone")}</Label>
                    <Input id={field("phone")} type="tel"
                           autoComplete="off" {...described("phone", errors.phone?.message)} {...form.register("phone")}/>
                    {error("phone", errors.phone?.message)}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={field("position")}>{t("Participants.plannedPosition")}</Label>
                <PositionSelect id={field("position")} positions={positions}
                                emptyLabel={t("Participants.noPosition")} {...form.register("positionId")}/>
            </div>
            {kind === "HELPER" && (
                <div className="space-y-2">
                    <Label htmlFor={field("compensation")}>{t("Participants.compensationPerShift")}</Label>
                    <Input id={field("compensation")} inputMode="decimal" autoComplete="off"
                           {...described("compensation", errors.compensationPerShift?.message)} {...form.register("compensationPerShift")}/>
                    {error("compensation", errors.compensationPerShift?.message)}
                </div>
            )}
            <Button type="submit" className="self-end" disabled={pending}><UserPlus/>{t("Participants.addPending")}
            </Button>
        </form>
    );
}

/**
 * Adds participants in three ways, each a tab: the spex's earlier participants from Spexregister, a name search in
 * Spexregister, or a pending person (or helper) who is not in it.
 */
export function ParticipantAddSheet({revivalId, positions}: { revivalId: string; positions: PositionValue[] }) {
    const t = useTranslations("Participants");
    const id = useId();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<TabKey>("candidates");
    const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({candidates: null, search: null, pending: null});

    const onKeyDown = (event: React.KeyboardEvent) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;

        if (step) {
            const next = TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length];

            event.preventDefault();
            setTab(next);
            tabRefs.current[next]?.focus();
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)}><UserPlus/>{t("add")}</Button>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{t("addTitle")}</SheetTitle>
                    <SheetDescription>{t("addDescription")}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4 pb-6">
                    <div role="tablist" aria-label={t("addTitle")} className="flex w-full gap-1 rounded-lg bg-muted p-1"
                         onKeyDown={onKeyDown}>
                        {TABS.map(key => (
                            <button key={key} type="button" role="tab" id={`${id}-${key}-tab`}
                                    aria-selected={tab === key} aria-controls={`${id}-${key}-panel`}
                                    tabIndex={tab === key ? 0 : -1} ref={element => {
                                tabRefs.current[key] = element;
                            }}
                                    onClick={() => setTab(key)}
                                    className={cn("min-h-9 flex-1 rounded-md px-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                {t(`addTabs.${key}`)}
                            </button>
                        ))}
                    </div>
                    <div role="tabpanel" id={`${id}-${tab}-panel`} aria-labelledby={`${id}-${tab}-tab`}>
                        {open && tab === "candidates" && <CandidatesTab revivalId={revivalId}/>}
                        {open && tab === "search" && <SearchTab revivalId={revivalId}/>}
                        {open && tab === "pending" && <PendingTab revivalId={revivalId} positions={positions}/>}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
