// Receipts go through the route handler /api/receipts/[transactionId], which adds the token.

export type ReceiptResult = { ok: true } | { ok: false; status: number; code: string | null; message: string | null };

async function result(response: Response): Promise<ReceiptResult> {
    if (response.ok) {
        return {ok: true};
    }

    const body = await response.json().catch(() => ({})) as { code?: string | null; message?: string | null };

    return {ok: false, status: response.status, code: body.code ?? null, message: body.message ?? null};
}

export function receiptUrl(transactionId: string): string {
    return `/api/receipts/${encodeURIComponent(transactionId)}`;
}

/**
 * Uploads a receipt for a transaction, replacing the one it had.
 */
export async function uploadReceipt(transactionId: string, file: File): Promise<ReceiptResult> {
    const body = new FormData();

    body.append("file", file, file.name);
    return result(await fetch(receiptUrl(transactionId), {method: "POST", body}));
}

export async function removeReceipt(transactionId: string): Promise<ReceiptResult> {
    return result(await fetch(receiptUrl(transactionId), {method: "DELETE"}));
}
