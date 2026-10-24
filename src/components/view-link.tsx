import type {ReactNode} from "react";
import Link from "next/link";
import type {LucideIcon} from "lucide-react";
import {cn} from "@/utils/utils";

/**
 * One of a page's views as a link styled as a segment of a control, so each view keeps its own URL.
 */
export function ViewLink({href, active, icon: Icon, children}: {
    href: string;
    active: boolean;
    icon: LucideIcon;
    children: ReactNode
}) {
    return (
        <Link href={href} aria-current={active ? "page" : undefined}
              className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium [&_svg]:size-4",
                  active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon/>
            {children}
        </Link>
    );
}
