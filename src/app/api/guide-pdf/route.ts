import {NextRequest, NextResponse} from "next/server";
import {apiFetch} from "@/lib/api.server";

const ID = /^\d+$/;
const LANGUAGES = new Set(["sv", "en"]);

/**
 * Downloads a guide PDF with the user's token, so the browser never holds it (contracts/http.md):
 * {@code ?version=<id>} or {@code ?revival=<id>}, and {@code lang=sv|en}.
 */
export async function GET(request: NextRequest) {
    const version = request.nextUrl.searchParams.get("version");
    const revival = request.nextUrl.searchParams.get("revival");
    const lang = request.nextUrl.searchParams.get("lang");

    if ((version === null) === (revival === null) || !ID.test(version ?? revival ?? "") || (lang !== null && !LANGUAGES.has(lang))) {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    const path = version ? `/api/guide/versions/${version}/pdf` : `/api/revivals/${revival}/guide/pdf`;
    const response = await apiFetch(lang ? `${path}?lang=${lang}` : path);

    if (!response.ok) {
        return NextResponse.json({error: "Download failed"}, {status: response.status});
    }
    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/pdf",
            "Content-Disposition": response.headers.get("content-disposition") ?? "attachment; filename=\"nyuppsattningsguide.pdf\"",
            "Cache-Control": "no-store",
        },
    });
}
