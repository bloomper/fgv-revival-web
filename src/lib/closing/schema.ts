import {z} from "zod";

const id = z.string().min(1);

/** The membership year as typed: four digits. */
export const membershipYearSchema = z.string().trim().regex(/^\d{4}$/, "membershipYearInvalid").transform(Number);

export const membershipSetSchema = z.object({
    revivalId: id,
    year: z.number().int().min(1900).max(9999),
    participantIds: z.array(id),
});

export const syncStartSchema = z.object({revivalId: id, previewHash: z.string().min(1)});

export const syncRunSchema = z.object({id});

export const revivalAnonymizeSchema = z.object({
    id,
    version: z.number().int().nonnegative(),
    confirmation: z.string().trim().min(1),
});

/**
 * Whether the typed confirmation names the revival: its title as shown, ignoring case and surrounding spaces, or its id
 * (what the server also takes while Spexregister, which the title comes from, is unavailable).
 */
export function confirmsRevival(typed: string, revival: { id: string; title: string }): boolean {
    const value = typed.trim().toLocaleLowerCase("sv");

    return value.length > 0 && (value === revival.title.trim().toLocaleLowerCase("sv") || value === revival.id);
}

/** A sync run's state as the archive warning needs it: never completed, or with failures. */
export function syncIncomplete(lastSync: { status: string; failed: number } | null | undefined): boolean {
    return !lastSync || lastSync.status !== "DONE" || lastSync.failed > 0;
}
