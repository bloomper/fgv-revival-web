"use client";

import {useId, useOptimistic, useTransition} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

/**
 * A switch kept in the URL as {@code ?<param>=1}, so the server fetches what it shows, as "show cancelled" is for
 * events.
 */
export function UrlSwitch({param, shown, label}: { param: string; shown: boolean; label: string }) {
    const id = useId();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [checked, setChecked] = useOptimistic(shown);

    return (
        <div className="flex items-center gap-2">
            <Switch id={id} checked={checked} onCheckedChange={next => startTransition(() => {
                const params = new URLSearchParams(searchParams);

                setChecked(next);
                if (next) {
                    params.set(param, "1");
                } else {
                    params.delete(param);
                }
                router.push(params.size ? `${pathname}?${params}` : pathname);
            })}/>
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
