"use client";

import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {CatalogEditor, type CatalogExtra, type CatalogRow} from "@/components/catalog/catalog-editor.client";
import {HostsInput} from "@/components/material/hosts-input.client";
import {
    createLinkServiceAction,
    deleteLinkServiceAction,
    moveLinkServiceAction,
    restoreLinkServiceAction,
    retireLinkServiceAction,
    updateLinkServiceAction,
} from "@/app/(app)/admin/link-services/actions.server";
import {MAX_URL} from "@/lib/material/hosts";
import {type LinkServiceDetails, linkServiceDetailsSchema} from "@/lib/material/schema";

export type LinkServiceRow = CatalogRow & { hosts: string[]; homeUrl?: string | null };

const EMPTY: LinkServiceDetails = {hosts: [], homeUrl: ""};

const ACTIONS = {
    create: (input: { name: { sv: string; en?: string | null }; extra?: LinkServiceDetails }) =>
        createLinkServiceAction({name: input.name, details: input.extra ?? EMPTY}),
    update: (input: {
        id: string;
        version: number;
        name: { sv: string; en?: string | null };
        extra?: LinkServiceDetails
    }) =>
        updateLinkServiceAction({
            id: input.id,
            version: input.version,
            name: input.name,
            details: input.extra ?? EMPTY
        }),
    move: moveLinkServiceAction,
    retire: retireLinkServiceAction,
    restore: restoreLinkServiceAction,
    remove: deleteLinkServiceAction,
};

/**
 * The link services as the other lists the super admin keeps, each with the hosts its links are recognised by and an
 * optional start page (M8-FR-1). A service a material holds is retired rather than deleted.
 */
export function LinkServiceEditor({entries}: { entries: LinkServiceRow[] }) {
    const t = useTranslations();
    const extra: CatalogExtra<LinkServiceRow, LinkServiceDetails> = {
        initial: entry => ({hosts: entry?.hosts ?? [], homeUrl: entry?.homeUrl ?? ""}),
        validate: value => {
            const parsed = linkServiceDetailsSchema.safeParse(value);

            return parsed.success ? null : parsed.error.issues[0]?.message ?? "hostInvalid";
        },
        render: ({id, value, onChange, error}) => (
            <>
                <HostsInput id={`${id}-hosts`} value={value.hosts} onChange={hosts => onChange({...value, hosts})}
                            error={error && error !== "urlHttpsRequired" && error !== "urlTooLong" ? error : null}/>
                <div className="space-y-2">
                    <Label htmlFor={`${id}-home`}>{t("LinkServiceAdmin.homeUrl")}</Label>
                    <Input id={`${id}-home`} type="url" inputMode="url" maxLength={MAX_URL} placeholder="https://"
                           value={value.homeUrl}
                           aria-invalid={error === "urlHttpsRequired" || error === "urlTooLong" ? true : undefined}
                           onChange={change => onChange({...value, homeUrl: change.target.value})}/>
                    {(error === "urlHttpsRequired" || error === "urlTooLong") &&
                        <p className="text-sm text-destructive">{t(`Validation.${error}`)}</p>}
                </div>
            </>
        ),
        summary: entry => (
            <p className="text-sm text-muted-foreground">
                {entry.hosts.length > 0
                    ? <span className="font-mono">{entry.hosts.join(", ")}</span>
                    : t("LinkServiceAdmin.noHosts")}
            </p>
        ),
    };

    return <CatalogEditor entries={entries} actions={ACTIONS} label={t("LinkServiceAdmin.title")}
                          createLabel={t("LinkServiceAdmin.create")}
                          editLabel={t("LinkServiceAdmin.editTitle")} extra={extra}/>;
}
