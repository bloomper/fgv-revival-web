import {NextRequest, NextResponse} from "next/server";
import {apiFetch} from "@/lib/api.server";
import {receiptProblem} from "@/lib/budget/schema";

const ID = /^[A-Za-z0-9-]{1,64}$/;

type Params = { params: Promise<{ transactionId: string }> };

async function transactionPath({params}: Params): Promise<string | null> {
    const {transactionId} = await params;

    return ID.test(transactionId) ? `/api/transactions/${transactionId}/receipt` : null;
}

const invalid = () => NextResponse.json({code: "BAD_REQUEST", message: "Invalid request"}, {status: 400});

/**
 * The server's error as JSON ({code, message}), so the page can show its localised message.
 */
async function failure(response: Response) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };

    return NextResponse.json({code: body.code ?? null, message: body.message ?? null}, {status: response.status});
}

/**
 * A transaction's receipt (M5-FR-12), downloaded with the user's token so the browser never holds it. Always an
 * attachment and sandboxed, since a PDF or image opened on its own could run script.
 */
export async function GET(_request: NextRequest, context: Params) {
    const path = await transactionPath(context);

    if (!path) {
        return invalid();
    }

    const response = await apiFetch(path);

    if (!response.ok) {
        return failure(response);
    }
    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
            "Content-Disposition": response.headers.get("content-disposition") ?? "attachment",
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, no-store",
        },
    });
}

/**
 * Uploads or replaces the receipt: the browser's multipart {@code file} is checked and forwarded as a new multipart
 * body. The server sniffs the content and enforces the same limits.
 */
export async function POST(request: NextRequest, context: Params) {
    const path = await transactionPath(context);

    if (!path) {
        return invalid();
    }

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");

    // A FormData entry is a file or a string; instanceof File differs between runtimes
    if (!file || typeof file === "string") {
        return invalid();
    }

    const problem = receiptProblem(file);

    if (problem) {
        return NextResponse.json({
            code: "BAD_REQUEST",
            message: problem
        }, {status: problem === "receiptTooLarge" ? 413 : 400});
    }

    const body = new FormData();

    body.append("file", new Blob([await file.arrayBuffer()], {type: file.type}), file.name);

    const response = await apiFetch(path, {method: "POST", body});

    if (!response.ok) {
        return failure(response);
    }
    return NextResponse.json(await response.json().catch(() => ({})), {headers: {"Cache-Control": "no-store"}});
}

export async function DELETE(_request: NextRequest, context: Params) {
    const path = await transactionPath(context);

    if (!path) {
        return invalid();
    }

    const response = await apiFetch(path, {method: "DELETE"});

    if (!response.ok) {
        return failure(response);
    }
    return new NextResponse(null, {status: 204});
}
