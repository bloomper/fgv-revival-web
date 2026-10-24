import type {ReactNode} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * One section of the participant's page: a card named by its heading, so each is a landmark a screen reader can jump
 * to. The page is built from these, so later milestones add sections without touching the others.
 */
export function ParticipationSection({id, title, description, children}: {
    id: string;
    title: string;
    description?: ReactNode;
    children: ReactNode
}) {
    return (
        <Card role="region" aria-labelledby={`${id}-heading`}>
            <CardHeader>
                <CardTitle><h3 id={`${id}-heading`} className="text-base font-semibold">{title}</h3></CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">{children}</CardContent>
        </Card>
    );
}

/** Tall enough for a finger: inputs and selects on the participant's page are 44px high (WCAG 2.5.5). */
export const TOUCH_FIELD = "h-11 text-base";

/**
 * Props tying a field to its hint and error text, and marking it invalid while there is an error.
 */
export function describedBy(fieldId: string, {error, hint}: { error?: string; hint?: boolean }) {
    const ids = [hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(" ");

    return {"aria-invalid": error ? true : undefined, "aria-describedby": ids || undefined};
}

export function FieldErrorText({fieldId, message}: { fieldId: string; message?: string | null }) {
    return message ? <p id={`${fieldId}-error`} className="text-sm font-medium text-destructive">{message}</p> : null;
}
