import {linkify} from "@/lib/linkify";
import {cn} from "@/utils/utils";

/**
 * The steering group's own text: rendered as text with line breaks kept and http(s) links clickable, never as
 * Markdown or HTML (M3 FR-015).
 */
export function PlainText({text, className}: { text: string; className?: string }) {
    return (
        <span className={cn("whitespace-pre-line break-words", className)}>
            {linkify(text).map((part, index) => part.kind === "link"
                ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer"
                     className="underline underline-offset-2">{part.text}</a>
                : part.text)}
        </span>
    );
}
