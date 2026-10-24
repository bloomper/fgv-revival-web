"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Check, CircleHelp, MoreHorizontal, Pencil, Plus, Printer, Trash2, UserPlus, X} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
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
import {Button, buttonVariants} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Textarea} from "@/components/ui/textarea";
import {PlainText} from "@/components/plain-text";
import {
    assignShiftAction,
    createShiftSlotAction,
    removeShiftSlotAction,
    unassignShiftAction,
    updateShiftSlotAction,
} from "@/app/(app)/revivals/[id]/staffing/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {useWeekday} from "@/hooks/use-weekday";
import type {AvailabilityAnswer, ShiftSlotFieldsFragment} from "@/gql/graphql";
import {answerFor, type AvailabilityDayValue, eventDays, rankCandidates, slotsByDay, type StaffingCandidate} from "@/lib/staffing/staffing";
import {MAX_SLOT_COMMENT, MAX_TASK, type ShiftSlotValues, shiftSlotValuesSchema} from "@/lib/staffing/schema";
import {formatDate} from "@/utils/format";
import {track} from "@/utils/umami";
import {cn} from "@/utils/utils";

type BoardEvent = { id: string; title: string; startDate: string; endDate: string; startTime?: string | null; location?: string | null };
type AvailabilityRow = { participant: { id: string; displayName: string }; days: AvailabilityDayValue[] };
type Person = Omit<StaffingCandidate, "answer" | "comment">;

const ANSWER_ICONS = {YES: Check, MAYBE: CircleHelp, NO: X} as const;

function AnswerBadge({answer}: { answer: AvailabilityAnswer | null }) {
    const t = useTranslations();

    if (!answer) {
        return <Badge variant="outline">{t("Staffing.noAnswer")}</Badge>;
    }
    const Icon = ANSWER_ICONS[answer];

    return <Badge variant={answer === "YES" ? "default" : answer === "MAYBE" ? "secondary" : "outline"}><Icon aria-hidden/>{t(`Availability.answers.${answer}`)}</Badge>;
}

/** Adding or changing a slot: a day of the event, a time span, the task, how many it needs and a comment. */
function SlotDialog({revivalId, event, slot, date, onOpenChange}: {
    revivalId: string;
    event: BoardEvent;
    slot: ShiftSlotFieldsFragment | null;
    date: string;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const weekday = useWeekday();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ShiftSlotValues>({
        resolver: zodResolver(shiftSlotValuesSchema),
        defaultValues: slot
            ? {date: slot.date, startTime: slot.startTime, endTime: slot.endTime, task: slot.task, needed: String(slot.needed), comment: slot.comment ?? ""}
            : {date, startTime: "", endTime: "", task: "", needed: "1", comment: ""},
    });
    const {errors} = form.formState;
    const field = (name: string) => `${id}-${name}`;
    const described = (name: string, message?: string) => message ? {"aria-invalid": true, "aria-describedby": `${field(name)}-error`} : {};
    const error = (name: string, message?: string) => message &&
        <p id={`${field(name)}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{slot ? t("Staffing.editSlot") : t("Staffing.addSlot")}</DialogTitle>
                    <DialogDescription>{event.title}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" noValidate onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = slot
                        ? await updateShiftSlotAction({revivalId, id: slot.id, version: slot.version, values})
                        : await createShiftSlotAction({revivalId, eventId: event.id, values});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <div className="space-y-2">
                        <Label htmlFor={field("date")}>{t("Staffing.day")}</Label>
                        <NativeSelect id={field("date")} className="w-full" {...form.register("date")}>
                            {eventDays(event).map(day => <option key={day} value={day}>{`${weekday(day)} ${formatDate(day)}`}</option>)}
                        </NativeSelect>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={field("start")}>{t("Staffing.startTime")}</Label>
                            <Input id={field("start")} className="w-24 tabular-nums" inputMode="numeric" maxLength={5} autoComplete="off"
                                   placeholder={t("DetailsForm.timePlaceholder")} {...described("start", errors.startTime?.message)} {...form.register("startTime")}/>
                            {error("start", errors.startTime?.message)}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={field("end")}>{t("Staffing.endTime")}</Label>
                            <Input id={field("end")} className="w-24 tabular-nums" inputMode="numeric" maxLength={5} autoComplete="off"
                                   placeholder={t("DetailsForm.timePlaceholder")} {...described("end", errors.endTime?.message)} {...form.register("endTime")}/>
                            {error("end", errors.endTime?.message)}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={field("needed")}>{t("Staffing.needed")}</Label>
                            <Input id={field("needed")} className="w-20 tabular-nums" inputMode="numeric" maxLength={3} autoComplete="off"
                                   {...described("needed", errors.needed?.message)} {...form.register("needed")}/>
                            {error("needed", errors.needed?.message)}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={field("task")}>{t("Staffing.task")}</Label>
                        <Input id={field("task")} maxLength={MAX_TASK} autoComplete="off" placeholder={t("Staffing.taskPlaceholder")}
                               {...described("task", errors.task?.message)} {...form.register("task")}/>
                        {error("task", errors.task?.message)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={field("comment")}>{t("Staffing.comment")}</Label>
                        <Textarea id={field("comment")} rows={2} maxLength={MAX_SLOT_COMMENT} {...described("comment", errors.comment?.message)} {...form.register("comment")}/>
                        {error("comment", errors.comment?.message)}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Picks whom to give a slot: participants and helpers with their answer for that day, yes first, then maybe, then
 * those who have not answered; those who said no are greyed out with their comment, but may still be chosen.
 */
function AssignPicker({revivalId, slot, candidates}: { revivalId: string; slot: ShiftSlotFieldsFragment; candidates: StaffingCandidate[] }) {
    const t = useTranslations("Staffing");
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<Button variant="outline" size="sm" disabled={pending} aria-label={t("assignTo", {task: slot.task, time: `${slot.startTime}–${slot.endTime}`})}/>}>
                <UserPlus/>{t("assign")}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <Command>
                    <CommandInput placeholder={t("searchPeople")} aria-label={t("searchPeople")}/>
                    <CommandList>
                        <CommandEmpty>{t("noPeople")}</CommandEmpty>
                        <CommandGroup>
                            {candidates.map(candidate => (
                                <CommandItem key={candidate.id} value={`${candidate.name} ${candidate.id}`}
                                             className={cn("flex-col items-start gap-0.5", candidate.answer === "NO" && "text-muted-foreground")}
                                             onSelect={() => startTransition(async () => {
                                                 setOpen(false);
                                                 if (feedback(await assignShiftAction({revivalId, slotId: slot.id, participantId: candidate.id}), t("assigned", {name: candidate.name}))) {
                                                     track("shift-assign", {answer: candidate.answer ?? "NONE"});
                                                 }
                                             })}>
                                    <span className="flex w-full items-center justify-between gap-2">
                                        <span className="font-medium">{candidate.name}</span>
                                        <AnswerBadge answer={candidate.answer}/>
                                    </span>
                                    {(candidate.position || candidate.kind === "HELPER") && (
                                        <span className="text-xs text-muted-foreground">{candidate.kind === "HELPER" ? t("helper") : candidate.position}</span>
                                    )}
                                    {candidate.comment && <span className="text-xs text-muted-foreground">{candidate.comment}</span>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function SlotRow({revivalId, slot, candidates, canWrite, onEdit, onRemove}: {
    revivalId: string;
    slot: ShiftSlotFieldsFragment;
    candidates: StaffingCandidate[];
    canWrite: boolean;
    onEdit: (slot: ShiftSlotFieldsFragment) => void;
    onRemove: (slot: ShiftSlotFieldsFragment) => void;
}) {
    const t = useTranslations("Staffing");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const assignedIds = new Set(slot.assigned.map(assignment => assignment.participant.id));
    const free = candidates.filter(candidate => !assignedIds.has(candidate.id));

    return (
        <li className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-start">
            <div className="w-28 shrink-0 font-medium tabular-nums">{slot.startTime}–{slot.endTime}</div>
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium">{slot.task}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{t("filled", {assigned: slot.assigned.length, needed: slot.needed})}</span>
                    {slot.open > 0
                        ? <Badge variant="outline">{t("openCount", {count: slot.open})}</Badge>
                        : <Badge variant="secondary">{t("full")}</Badge>}
                </div>
                {slot.comment && <p className="text-sm text-muted-foreground"><PlainText text={slot.comment}/></p>}
                <ul className="flex flex-wrap gap-2" aria-label={t("assignedTo", {task: slot.task})}>
                    {slot.assigned.map(assignment => (
                        <li key={assignment.participant.id}>
                            <Badge variant="secondary" className="h-7 gap-1 pr-1">
                                {assignment.participant.displayName}
                                {assignment.selfSignedUp && <span className="text-xs text-muted-foreground">({t("selfSignedUp")})</span>}
                                {canWrite && (
                                    <Button variant="ghost" size="icon-xs" disabled={pending}
                                            aria-label={t("unassign", {name: assignment.participant.displayName, task: slot.task})}
                                            onClick={() => startTransition(async () => {
                                                feedback(await unassignShiftAction({revivalId, slotId: slot.id, participantId: assignment.participant.id}),
                                                    t("unassigned", {name: assignment.participant.displayName}));
                                            })}>
                                        <X/>
                                    </Button>
                                )}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </div>
            {canWrite && (
                <div className="flex shrink-0 items-center gap-1">
                    <AssignPicker revivalId={revivalId} slot={slot} candidates={free}/>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" aria-label={t("slotMenu", {task: slot.task, time: `${slot.startTime}–${slot.endTime}`})}/>}>
                            <MoreHorizontal className="h-4 w-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(slot)}><Pencil/>{t("editSlot")}</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" disabled={slot.assigned.length > 0} onClick={() => onRemove(slot)}>
                                <Trash2/>{t("removeSlot")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </li>
    );
}

function RemoveSlotDialog({revivalId, slot, onOpenChange}: { revivalId: string; slot: ShiftSlotFieldsFragment; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Staffing.removeSlotTitle", {task: slot.task})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("Staffing.removeSlotDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending} onClick={() => startTransition(async () => {
                        if (feedback(await removeShiftSlotAction({revivalId, id: slot.id, version: slot.version}), t("Staffing.slotRemoved"))) {
                            onOpenChange(false);
                        }
                    })}>{t("Staffing.removeSlot")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * One event's staffing (M6b): per day its slots by time, each with the task, how many it needs and has, and who holds
 * it. Writers add, change and remove slots and assign people with a picker that lists everyone's answer for the day.
 * The schedule and each person's shifts print from their own pages, opened in a new tab.
 */
export function StaffingBoard({revivalId, event, slots, availability, people, peopleUnavailable, canWrite}: {
    revivalId: string;
    event: BoardEvent;
    slots: ShiftSlotFieldsFragment[];
    availability: AvailabilityRow[];
    people: Person[];
    peopleUnavailable: boolean;
    canWrite: boolean;
}) {
    const t = useTranslations("Staffing");
    const weekday = useWeekday();
    const [adding, setAdding] = useState<string | null>(null);
    const [editing, setEditing] = useState<ShiftSlotFieldsFragment | null>(null);
    const [removing, setRemoving] = useState<ShiftSlotFieldsFragment | null>(null);
    const byDay = new Map(slotsByDay(slots));
    const holders = new Map(slots.flatMap(slot => slot.assigned.map(assignment => [assignment.participant.id, assignment.participant.displayName] as const)));
    const printBase = `/revivals/${revivalId}/staffing/print`;
    const candidatesFor = (date: string): StaffingCandidate[] => rankCandidates(people.map(person => {
        const answer = answerFor(availability.find(row => row.participant.id === person.id)?.days ?? [], event.id, date);

        return {...person, answer: answer?.answer ?? null, comment: answer?.comment ?? null};
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
                <a href={`${printBase}?event=${encodeURIComponent(event.id)}`} target="_blank" rel="noopener" className={buttonVariants({variant: "outline"})}>
                    <Printer/>{t("printSchedule")}
                </a>
                {holders.size > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline"/>}><Printer/>{t("printPerson")}</DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {[...holders.entries()].sort((a, b) => a[1].localeCompare(b[1], "sv")).map(([participantId, name]) => (
                                <DropdownMenuItem key={participantId}
                                                  onClick={() => window.open(`${printBase}?person=${encodeURIComponent(participantId)}`, "_blank", "noopener")}>
                                    {name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {canWrite && peopleUnavailable && (
                <Alert><AlertDescription>{t("peopleUnavailable")}</AlertDescription></Alert>
            )}
            {eventDays(event).map(date => {
                const daySlots = byDay.get(date) ?? [];
                const candidates = canWrite ? candidatesFor(date) : [];

                return (
                    <section key={date} aria-labelledby={`day-${date}`} className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 id={`day-${date}`} className="font-semibold">
                                <span className="capitalize">{weekday(date)}</span> <span className="tabular-nums">{formatDate(date)}</span>
                            </h4>
                            {canWrite && (
                                <Button variant="outline" size="sm" onClick={() => setAdding(date)} aria-label={t("addSlotOn", {date: formatDate(date) ?? date})}>
                                    <Plus/>{t("addSlot")}
                                </Button>
                            )}
                        </div>
                        {daySlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {daySlots.map(slot => (
                                    <SlotRow key={slot.id} revivalId={revivalId} slot={slot} candidates={candidates} canWrite={canWrite}
                                             onEdit={setEditing} onRemove={setRemoving}/>
                                ))}
                            </ul>
                        )}
                    </section>
                );
            })}
            {(adding || editing) && (
                <SlotDialog key={editing?.id ?? adding} revivalId={revivalId} event={event} slot={editing} date={adding ?? editing?.date ?? event.startDate}
                            onOpenChange={open => {
                                if (!open) {
                                    setAdding(null);
                                    setEditing(null);
                                }
                            }}/>
            )}
            {removing && <RemoveSlotDialog revivalId={revivalId} slot={removing} onOpenChange={open => !open && setRemoving(null)}/>}
        </div>
    );
}
