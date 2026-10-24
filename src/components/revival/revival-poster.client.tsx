"use client";

import {useState} from "react";
import {Drama} from "lucide-react";
import {cn} from "@/utils/utils";

/**
 * The poster of a revival's spex from Spexregister, through `/api/revival-poster`, or a placeholder when the spex has
 * none or Spexregister is unavailable. Decorative: the title is always shown beside it.
 */
export function RevivalPoster({revivalId, className}: { revivalId: string; className?: string }) {
    const src = `/api/revival-poster/${revivalId}`;
    const [failed, setFailed] = useState<string | null>(null);

    if (failed === src) {
        return (
            <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
                 aria-hidden>
                <Drama className="size-1/2 max-h-8 max-w-8 opacity-60"/>
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element -- next/image would fetch it without the user's session
        <img src={src} alt="" aria-hidden loading="lazy" decoding="async"
             className={cn("bg-muted object-cover", className)}
             onError={() => setFailed(src)}
             ref={img => {
                 // An error before hydration fires no onError, so check what the browser already knows
                 if (img?.complete && img.naturalWidth === 0) {
                     setFailed(src);
                 }
             }}/>
    );
}
