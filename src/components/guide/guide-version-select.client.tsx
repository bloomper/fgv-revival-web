"use client";

import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type Version = { id: string; label: string | null };

/**
 * Picks the published version to read, newest first. The latest is the guide's own address, an older
 * one is under {@code /guide/versions/<id>}.
 */
export function GuideVersionSelect({versions, current}: { versions: Version[]; current: string }) {
    const t = useTranslations("Guide");
    const router = useRouter();
    const latest = versions[0]?.id;
    const items = versions.map(version => ({
        value: version.id,
        label: version.id === latest ? `${version.label ?? ""} (${t("latest")})` : version.label ?? "",
    }));

    return (
        <Select items={items} value={current}
                onValueChange={value => value && router.push(value === latest ? "/guide" : `/guide/versions/${encodeURIComponent(value)}`)}>
            <SelectTrigger className="h-8 w-44" aria-label={t("versions")}>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}
