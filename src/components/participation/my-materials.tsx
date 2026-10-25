import {useLocale, useTranslations} from "next-intl";
import {ExternalLink} from "lucide-react";
import type {MaterialCategory} from "@/gql/graphql";
import {catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {PlainText} from "@/components/plain-text";
import {hostOf} from "@/lib/material/hosts";
import {MATERIAL_CATEGORIES} from "@/lib/material/schema";

export type MyMaterial = {
    id: string;
    title: string;
    url: string;
    service?: { name: LocalizedTextValue } | null;
    category: MaterialCategory;
    comment?: string | null;
};

/**
 * The materials the participant may see, grouped by category in a fixed order, each a link large enough for
 * a finger that opens in a new tab and says where it leads.
 */
export function MyMaterials({materials}: { materials: MyMaterial[] }) {
    const t = useTranslations("Material");
    const locale = useLocale();

    if (materials.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("mineNone")}</p>;
    }

    const groups = MATERIAL_CATEGORIES
        .map(category => ({category, entries: materials.filter(material => material.category === category)}))
        .filter(group => group.entries.length > 0);

    return (
        <div className="flex flex-col gap-4">
            {groups.map(group => (
                <section key={group.category} aria-labelledby={`my-materials-${group.category}`}
                         className="flex flex-col gap-1">
                    <h4 id={`my-materials-${group.category}`}
                        className="text-sm font-semibold">{t(`categories.${group.category}`)}</h4>
                    <ul className="flex flex-col divide-y rounded-md border">
                        {group.entries.map(material => {
                            const where = material.service ? catalogName(material.service, locale) : hostOf(material.url);

                            return (
                                <li key={material.id} className="flex flex-col">
                                    <a href={material.url} target="_blank" rel="noopener noreferrer"
                                       className="flex min-h-11 items-center justify-between gap-3 px-3 py-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                                        <span className="flex min-w-0 flex-col">
                                            <span className="font-medium break-words">{material.title}</span>
                                            {where && <span className="text-sm text-muted-foreground">{where}</span>}
                                        </span>
                                        <ExternalLink aria-hidden className="size-4 shrink-0"/>
                                        <span className="sr-only">{t("opensInNewTab")}</span>
                                    </a>
                                    {material.comment && (
                                        <p className="px-3 pb-2 text-sm text-muted-foreground"><PlainText
                                            text={material.comment}/></p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
        </div>
    );
}
