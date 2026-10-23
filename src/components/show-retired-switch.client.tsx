"use client";

import {useId, useOptimistic, useTransition} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

/**
 * Shows or hides retired entries of an admin list. The choice lives in the URL (`?retired=1`), so the server renders
 * the list it asks for and the page can be linked to.
 */
export function ShowRetiredSwitch({shown, label}: { shown: boolean; label: string }) {
    const id = useId();
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();
    const [checked, setChecked] = useOptimistic(shown);

    return (
        <div className="flex items-center gap-2">
            <Switch id={id} checked={checked} onCheckedChange={next => startTransition(() => {
                setChecked(next);
                router.push(next ? `${pathname}?retired=1` : pathname);
            })}/>
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
