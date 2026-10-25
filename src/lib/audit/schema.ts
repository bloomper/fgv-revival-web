import {z} from "zod";

export const AUDITED_TYPES = ["LOG_ENTRY", "CHECKLIST_ITEM", "EVENT", "BUDGET_LINE", "BUDGET_TRANSACTION", "MATERIAL", "NEWS"] as const;

export const revisionsSchema = z.object({type: z.enum(AUDITED_TYPES), id: z.string().min(1)});
