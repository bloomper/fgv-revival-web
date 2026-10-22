"use client";

import {type ReactNode, useId} from "react";
import {TriangleAlert} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Checkbox} from "@/components/ui/checkbox";

/**
 * A warning that something will be deleted, which the user must tick to go on.
 */
export function RemovalWarning({title, children, confirmLabel, confirmed, onConfirmedChange}: {
    title: string;
    children: ReactNode;
    confirmLabel: string;
    confirmed: boolean;
    onConfirmedChange: (confirmed: boolean) => void;
}) {
    const id = useId();

    return (
        <Alert variant="destructive" data-testid="removal-warning">
            <TriangleAlert/>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="space-y-3">
                <div>{children}</div>
                <label htmlFor={id} className="flex items-start gap-2 font-medium">
                    <Checkbox id={id} checked={confirmed} onCheckedChange={value => onConfirmedChange(!!value)} className="mt-0.5"/>
                    <span>{confirmLabel}</span>
                </label>
            </AlertDescription>
        </Alert>
    );
}
