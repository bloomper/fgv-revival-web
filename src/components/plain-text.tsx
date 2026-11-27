import { linkify } from "@/lib/linkify";
import { cn } from "@/utils/utils";

/**
 * The steering group's own text: rendered as text with line breaks kept and http(s) links clickable, never as
 * Markdown or HTML.
 */
export function PlainText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("break-words whitespace-pre-line", className)}>
      {linkify(text).map((part, index) =>
        part.kind === "link" ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-link/80 font-medium"
          >
            {part.text}
          </a>
        ) : (
          part.text
        )
      )}
    </span>
  );
}
