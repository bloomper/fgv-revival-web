import {NextRequest, NextResponse} from "next/server";
import {apiFetch} from "@/lib/api.server";

const ID = /^[A-Za-z0-9-]{1,64}$/;
const LANGUAGES = new Set(["sv", "en"]);

/**
 * A revival's budget as an Excel workbook, fetched with the user's token so the browser never holds it.
 * The workbook's language follows the locale cookie, as the pages do.
 */
export async function GET(request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    if (!ID.test(id)) {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    const cookie = request.cookies.get("locale")?.value;
    const lang = cookie && LANGUAGES.has(cookie) ? cookie : "sv";
    const response = await apiFetch(`/api/revivals/${id}/budget.xlsx?lang=${lang}`);

    if (!response.ok) {
        return NextResponse.json({error: "Download failed"}, {status: response.status});
    }
    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": response.headers.get("content-disposition") ?? "attachment; filename=\"budget.xlsx\"",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
