"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {DateInput} from "@/components/date-input.client";
import {
    createSpexCalendarDateAction,
    deleteSpexCalendarDateAction,
    updateSpexCalendarDateAction,
} from "@/app/(app)/admin/spex-calendar/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_SPEX_DATE_LABEL, type SpexCalendarDateValues, spexCalendarDateValuesSchema} from "@/lib/spex-calendar/schema";
import {formatDate} from "@/utils/format";

export type SpexCalendarDateRow = { id: string; date: string; label: string; version: number };

function DateDialog({entry, onOpenChange}: { entry: SpexCalendarDateRow | null; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<SpexCalendarDateValues>({
        resolver: zodResolver(spexCalendarDateValuesSchema),
        defaultValues: {date: entry?.date ?? "", label: entry?.label ?? ""},
    });
    const {errors} = form.formState;
    const error = (message?: string) => message && <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{entry ? t("SpexCalendar.editTitle") : t("SpexCalendar.create")}</DialogTitle>
                    <DialogDescription>{t("SpexCalendar.dialogDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = entry
                        ? await updateSpexCalendarDateAction({id: entry.id, version: entry.version, values})
                        : await createSpexCalendarDateAction({values});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-date`}>{t("SpexCalendar.date")}</Label>
                        <DateInput id={`${id}-date`} {...form.register("date")}/>
                        {error(errors.date?.message)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-label`}>{t("SpexCalendar.label")}</Label>
                        <Input id={`${id}-label`} maxLength={MAX_SPEX_DATE_LABEL} placeholder={t("SpexCalendar.labelPlaceholder")} {...form.register("label")}/>
                        {error(errors.label?.message)}
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
 * The Chalmersspex's dates by date: added, changed and deleted by the super admin.
 */
export function SpexCalendarEditor({dates}: { dates: SpexCalendarDateRow[] }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<SpexCalendarDateRow | null>(null);
    const [adding, setAdding] = useState(false);

    return (
        <div className="space-y-3">
            <Button onClick={() => setAdding(true)}><Plus/>{t("SpexCalendar.create")}</Button>
            {dates.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("SpexCalendar.empty")}</p>
            ) : (
                <ul className="space-y-2" aria-label={t("SpexCalendar.title")}>
                    {dates.map(entry => (
                        <li key={entry.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                            <span className="w-28 shrink-0 font-medium tabular-nums">{formatDate(entry.date)}</span>
                            <span className="min-w-0 flex-1">{entry.label}</span>
                            <Button size="icon" variant="ghost" aria-label={t("SpexCalendar.edit", {label: entry.label})} onClick={() => setEditing(entry)}><Pencil/></Button>
                            <Button size="icon" variant="ghost" aria-label={t("SpexCalendar.delete", {label: entry.label})} disabled={pending}
                                    onClick={() => startTransition(async () => {
                                        feedback(await deleteSpexCalendarDateAction({id: entry.id, version: entry.version}), t("SpexCalendar.deleted"));
                                    })}><Trash2/></Button>
                        </li>
                    ))}
                </ul>
            )}
            {(adding || editing) && <DateDialog key={editing?.id ?? "new"} entry={editing} onOpenChange={open => {
                if (!open) {
                    setAdding(false);
                    setEditing(null);
                }
            }}/>}
        </div>
    );
}
