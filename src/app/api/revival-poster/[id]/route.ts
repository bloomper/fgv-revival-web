import {NextRequest, NextResponse} from "next/server";
import {apiFetch} from "@/lib/api.server";

const ID = /^\d+$/;

/**
 * A revival's spex poster, fetched with the user's token so the browser never holds it. 404 when there is none, so an
 * {@code <img>} falls back to its placeholder. The image is sandboxed, since an SVG opened on its own could run script.
 */
export async function GET(_request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    if (!ID.test(id)) {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    const response = await apiFetch(`/api/revivals/${id}/poster`);

    if (response.status === 204) {
        return NextResponse.json({error: "No poster"}, {status: 404, headers: {"Cache-Control": "private, max-age=3600"}});
    }
    if (!response.ok) {
        return NextResponse.json({error: "Download failed"}, {status: response.status});
    }
    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
            "Cache-Control": "private, max-age=3600",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
