import Markdown, {type Components} from "react-markdown";

// FR-010: paragraphs, lists, emphasis and links only. Raw HTML stays text (no rehype-raw), anything else is unwrapped to
// its text, and images are dropped so guide text never makes the browser load an outside URL.
const ALLOWED_ELEMENTS = ["p", "ul", "ol", "li", "strong", "em", "a", "br"];

const components: Components = {
    a: ({href, children}) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{children}</a>
    ),
    ul: ({children}) => <ul className="ml-5 list-disc space-y-1">{children}</ul>,
    ol: ({children}) => <ol className="ml-5 list-decimal space-y-1">{children}</ol>,
    p: ({children}) => <p className="leading-relaxed">{children}</p>,
};

/**
 * Guide Markdown, rendered the only way the web shows it.
 */
export function GuideMarkdown({children}: { children: string }) {
    return (
        <div className="space-y-2">
            <Markdown
                allowedElements={ALLOWED_ELEMENTS}
                unwrapDisallowed
                urlTransform={(url, key) => (key === "src" ? "" : url)}
                components={components}
            >
                {children}
            </Markdown>
        </div>
    );
}
