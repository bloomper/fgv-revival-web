// Small helpers for showing participants and their contact details, shared by the steering group's list and the
// participant's own page.

/**
 * A WhatsApp chat link for a phone number: digits only, a leading 00 or + dropped, and a Swedish leading 0 replaced by
 * the country code 46 ("070-123 45 67" → "https://wa.me/46701234567"). Null when it is too short to be a number.
 */
export function whatsAppUrl(phone: string | null | undefined): string | null {
    const raw = (phone ?? "").trim();
    let digits = raw.replace(/\D/g, "");

    if (raw.startsWith("+")) {
        // Already international
    } else if (digits.startsWith("00")) {
        digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
        digits = `46${digits.slice(1)}`;
    }
    return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

/**
 * First name, the nickname in quotes and the last name: Anna "Spexis" Andersson.
 */
export function participantName(person: { firstName: string; lastName: string; nickName?: string | null }): string {
    return [person.firstName, person.nickName ? `"${person.nickName}"` : null, person.lastName].filter(Boolean).join(" ").trim();
}

/**
 * A Swish number as the server keeps it: spaces and dashes removed.
 */
export function normalizeSwishNumber(value: string): string {
    return value.replace(/[\s-]/g, "");
}

/** 10 digits: a private number (07…) or a 123-number. */
export const SWISH_NUMBER = /^\d{10}$/;
export const WHATSAPP_LINK_PREFIX = "https://chat.whatsapp.com/";
