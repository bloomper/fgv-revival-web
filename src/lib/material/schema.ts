import {z} from "zod";
import type {InventoryItemInput, LinkServiceInput, MaterialInput, OwnerInput} from "@/gql/graphql";
import {catalogId, catalogNameSchema} from "@/lib/catalog/schema";
import {ownerSchema} from "@/lib/decision-log/schema";
import {isHostName, MAX_HOSTS, MAX_URL, parseHttpsUrl} from "@/lib/material/hosts";

export const MAX_MATERIAL_TITLE = 200;
export const MAX_MATERIAL_COMMENT = 1000;
export const MAX_INVENTORY_NAME = 200;
export const MAX_LOCATION_NOTE = 255;
export const MAX_QUANTITY = 100000;

export const MATERIAL_CATEGORIES = ["SCRIPT", "SHEET_MUSIC", "RECORDING", "VIDEO", "PROGRAMME", "POSTER", "PHOTO", "OTHER"] as const;
export const MATERIAL_VISIBILITIES = ["STEERING_GROUP", "PARTICIPANTS", "POSITIONS"] as const;
export const INVENTORY_KINDS = ["SCRIPT", "SHEET_MUSIC", "PROPS", "COSTUME", "WIG", "BACKDROP", "TECHNICAL", "OTHER"] as const;
export const INVENTORY_STATUSES = ["HAVE", "MISSING", "BORROW", "BUY", "BUILD"] as const;
export const INVENTORY_LOCATIONS = ["KEMIFORRADET", "V_FORRADET", "RUNAN", "PRIVATE", "OTHER"] as const;

/** The statuses that ask the steering group to do something: find, buy or build the item. */
export const ACTION_STATUSES: ReadonlySet<string> = new Set(["MISSING", "BUY", "BUILD"]);

const id = z.string().min(1);
const version = z.number().int().nonnegative();
const httpsUrl = z.string().trim().max(MAX_URL, "urlTooLong").refine(value => parseHttpsUrl(value) !== null, "urlHttpsRequired");

/**
 * The material dialog. A blank service means "recognise it from the link"; positions only count for POSITIONS.
 */
export const materialValuesSchema = z.object({
    title: z.string().trim().min(1, "materialTitleRequired").max(MAX_MATERIAL_TITLE, "materialTitleTooLong"),
    url: httpsUrl,
    serviceId: z.string(),
    category: z.enum(MATERIAL_CATEGORIES),
    visibility: z.enum(MATERIAL_VISIBILITIES),
    positionIds: z.array(id),
    comment: z.string().trim().max(MAX_MATERIAL_COMMENT, "materialCommentTooLong"),
}).superRefine((values, ctx) => {
    if (values.visibility === "POSITIONS" && values.positionIds.length === 0) {
        ctx.addIssue({code: "custom", message: "materialPositionsRequired", path: ["positionIds"]});
    }
});

export type MaterialValues = z.infer<typeof materialValuesSchema>;

export const materialCreateSchema = z.object({revivalId: id, values: materialValuesSchema});
export const materialUpdateSchema = z.object({id, version, revivalId: id, values: materialValuesSchema});
export const materialTransitionSchema = z.object({id, version, revivalId: id});

/**
 * The GraphQL input for validated dialog values; positions are sent only for POSITIONS.
 */
export function toMaterialInput(values: MaterialValues): MaterialInput {
    return {
        title: values.title,
        url: values.url,
        serviceId: values.serviceId || null,
        category: values.category,
        visibility: values.visibility,
        positionIds: values.visibility === "POSITIONS" ? values.positionIds : [],
        comment: values.comment || null,
    };
}

/**
 * The inventory dialog. The quantity is kept as the typed text; a blank location or material means none.
 */
export const inventoryValuesSchema = z.object({
    name: z.string().trim().min(1, "inventoryNameRequired").max(MAX_INVENTORY_NAME, "inventoryNameTooLong"),
    kind: z.enum(INVENTORY_KINDS),
    quantity: z.string().trim().regex(/^\d{1,6}$/, "inventoryQuantityInvalid")
        .refine(value => Number(value) >= 1 && Number(value) <= MAX_QUANTITY, "inventoryQuantityInvalid"),
    status: z.enum(INVENTORY_STATUSES),
    location: z.union([z.literal(""), z.enum(INVENTORY_LOCATIONS)]),
    locationNote: z.string().trim().max(MAX_LOCATION_NOTE, "locationNoteTooLong"),
    owner: ownerSchema,
    comment: z.string().trim().max(MAX_MATERIAL_COMMENT, "materialCommentTooLong"),
    materialId: z.string(),
});

export type InventoryValues = z.infer<typeof inventoryValuesSchema>;

export const inventoryCreateSchema = z.object({revivalId: id, values: inventoryValuesSchema});
export const inventoryUpdateSchema = z.object({id, version, revivalId: id, values: inventoryValuesSchema});
export const inventoryTransitionSchema = z.object({id, version, revivalId: id});

function ownerInput(owner: InventoryValues["owner"]): OwnerInput | null {
    if (owner?.personId) {
        return {personId: owner.personId};
    }
    return owner?.name ? {name: owner.name} : null;
}

/**
 * The GraphQL input for validated dialog values: every field is sent, so blank ones clear.
 */
export function toInventoryItemInput(values: InventoryValues): InventoryItemInput {
    return {
        name: values.name,
        kind: values.kind,
        quantity: Number(values.quantity),
        status: values.status,
        location: values.location || null,
        locationNote: values.locationNote || null,
        owner: ownerInput(values.owner),
        comment: values.comment || null,
        materialId: values.materialId || null,
    };
}

/** A service's hosts and start page, beside its names. */
export const linkServiceDetailsSchema = z.object({
    hosts: z.array(z.string().refine(isHostName, "hostInvalid")).max(MAX_HOSTS, "hostsTooMany")
        .refine(hosts => new Set(hosts).size === hosts.length, "hostDuplicate"),
    homeUrl: z.union([z.literal(""), httpsUrl]),
});

export type LinkServiceDetails = z.infer<typeof linkServiceDetailsSchema>;

export const linkServiceCreateSchema = z.object({name: catalogNameSchema, details: linkServiceDetailsSchema});
export const linkServiceUpdateSchema = z.object({
    id: catalogId,
    version,
    name: catalogNameSchema,
    details: linkServiceDetailsSchema
});

export function toLinkServiceInput(name: z.infer<typeof catalogNameSchema>, details: LinkServiceDetails): LinkServiceInput {
    return {name: {sv: name.sv, en: name.en || null}, hosts: details.hosts, homeUrl: details.homeUrl || null};
}
