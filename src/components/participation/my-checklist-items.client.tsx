"use client";

import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";
import {PlainText} from "@/components/plain-text";
import {pickText} from "@/components/guide/localized";
import {setAssignedItemDoneAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {MyParticipationQuery} from "@/gql/graphql";
import {formatDate} from "@/utils/format";

type Item = NonNullable<MyParticipationQuery["myParticipation"]>["checklistItems"][number];

/**
 * The checklist items the steering group assigned to the participant, by deadline: each a large row with a checkbox
 * that marks it done, the checklist it belongs to and its deadline.
 */
export function MyChecklistItems({revivalId, items}: { revivalId: string; items: Item[] }) {
    const t = useTranslations("Participation");
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <ul className="flex flex-col gap-3">
            {items.map(item => {
                const text = pickText(item.text, locale).text;
                const checklist = item.checklistName ?? (item.chapterTitle ? pickText(item.chapterTitle, locale).text : null);
                const id = `task-${item.id}`;

                return (
                    <li key={item.id} className="flex min-h-11 items-start gap-3 rounded-lg border p-3">
                        <Checkbox id={id} className="mt-0.5 size-5" checked={item.done} disabled={pending}
                                  onCheckedChange={done => startTransition(async () => {
                                      feedback(await setAssignedItemDoneAction({revivalId, id: item.id, version: item.version, done}),
                                          done ? t("taskDone") : t("taskOpen"));
                                  })}/>
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <label htmlFor={id} className={item.done ? "text-muted-foreground line-through" : "font-medium"}>{text}</label>
                            {checklist && (
                                <p className="text-sm text-muted-foreground">
                                    {item.checklistDate ? `${checklist} · ${formatDate(item.checklistDate)}` : checklist}
                                </p>
                            )}
                            {item.deadline && (
                                <p className="flex flex-wrap items-center gap-2 text-sm tabular-nums">
                                    {t("taskDeadline", {date: formatDate(item.deadline) ?? item.deadline})}
                                    {item.overdue && <Badge variant="destructive">{t("taskOverdue")}</Badge>}
                                </p>
                            )}
                            {item.comment && <p className="text-sm text-muted-foreground"><PlainText text={item.comment}/></p>}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
