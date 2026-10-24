import {NextRequest, NextResponse} from "next/server";
import {apiFetchPublic} from "@/lib/api.server";

// The token is base64url, 32 random bytes on the server; anything else is not a feed
const FILE = /^([A-Za-z0-9_-]{16,128})\.ics$/;
const LANGUAGES = new Set(["sv", "en"]);

function notFound() {
    return new NextResponse("Not found", {
        status: 404,
        headers: {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"}
    });
}

/**
 * A calendar feed by its secret link (M4-FR-5, FR-6). Calendar apps have no session, so the request is forwarded
 * without a token; the server answers 404 for a link that is unknown, turned off or no longer the person's.
 */
export async function GET(request: NextRequest, {params}: { params: Promise<{ file: string }> }) {
    const {file} = await params;
    const match = FILE.exec(file);

    if (!match) {
        return notFound();
    }

    const lang = request.nextUrl.searchParams.get("lang");
    const query = lang && LANGUAGES.has(lang) ? `?lang=${lang}` : "";
    const response = await apiFetchPublic(`/api/calendar/${match[1]}.ics${query}`);

    if (response.status === 404) {
        return notFound();
    }
    if (!response.ok) {
        return new NextResponse("Unavailable", {
            status: response.status,
            headers: {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"}
        });
    }
    return new NextResponse(await response.text(), {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "text/calendar; charset=utf-8",
            "Cache-Control": "private, max-age=900",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
