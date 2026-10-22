"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {updateIntroductionAction} from "@/app/(app)/admin/guide/draft/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guideIntroductionSchema, MAX_INTRODUCTION} from "@/lib/guide/schema";

type Values = z.infer<typeof guideIntroductionSchema>;

export function GuideIntroductionDialog({trigger, children, versionId, version, initial}: {
    trigger: ReactElement;
    children: ReactNode;
    versionId: string;
    version: number;
    initial: { sv: string; en?: string | null };
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<Values>({resolver: zodResolver(guideIntroductionSchema), values: {sv: initial.sv, en: initial.en ?? ""}});

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={trigger}>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{t("Guide.editor.editIntroduction")}</SheetTitle>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await updateIntroductionAction({versionId, version, introduction: values}), t("Guide.editor.saved"))) {
                            setOpen(false);
                        }
                    }))}
                >
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor="guide-intro-sv">{t("Guide.editor.swedish")}</Label>
                                <Textarea id="guide-intro-sv" rows={10} maxLength={MAX_INTRODUCTION} {...form.register("sv")}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guide-intro-en">{t("Guide.editor.english")}</Label>
                                <Textarea id="guide-intro-en" rows={10} maxLength={MAX_INTRODUCTION} {...form.register("en")}/>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
