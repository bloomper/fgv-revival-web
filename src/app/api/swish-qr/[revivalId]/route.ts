import {NextRequest, NextResponse} from "next/server";
import {apiFetch} from "@/lib/api.server";

const ID = /^\d+$/;
const SANDBOX = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

/**
 * The participant's pre-filled Swish QR code for their fee, fetched with the user's token so the browser never holds
 * it. The server answers 404 unless the caller is a participant of an open revival with an unpaid fee and a Swish
 * number, so an {@code <img>} then hides itself. The SVG is sandboxed, since opened on its own it could run script.
 */
export async function GET(_request: NextRequest, {params}: { params: Promise<{ revivalId: string }> }) {
    const {revivalId} = await params;

    if (!ID.test(revivalId)) {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    const response = await apiFetch(`/api/revivals/${revivalId}/swish-qr`);

    if (!response.ok) {
        return NextResponse.json({error: "No QR code"}, {status: response.status});
    }
    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "private, max-age=3600",
            "Content-Security-Policy": SANDBOX,
            "X-Content-Type-Options": "nosniff",
        },
    });
}
