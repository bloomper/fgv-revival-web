/**
 * The server's ids are UUIDs, and the web's route handlers refuse anything else, so the mock speaks them too. The
 * number n is kept readable in the last group, and {@link seqOf} gets it back for ordering by creation.
 */
export const uuidOf = n => `00000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

export const seqOf = id => Number(String(id).slice(-12));

export const ALI_BABA_2028 = uuidOf(1);
export const NOBEL_2030 = uuidOf(2);
export const SNORRE_2027 = uuidOf(3);
