"use client";

import * as React from "react";
import {useMemo, useState} from "react";
import Link from "next/link";
import {ArrowDown, ArrowUp} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import type {RevivalSummaryFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {RevivalStatusSelect} from "@/components/revival/revival-status-select.client";
import {DirecteurDialog} from "@/components/member/directeur-dialog.client";
import {formatDate} from "@/utils/format";

type Direction = "desc" | "asc";

export function sortByPremiere(revivals: RevivalSummaryFragment[], direction: Direction): RevivalSummaryFragment[] {
    return [...revivals].sort((a, b) => {
        if (!a.premiereDate && !b.premiereDate) {
            return b.year - a.year;
        }
        if (!a.premiereDate) {
            return 1;
        }
        if (!b.premiereDate) {
            return -1;
        }
        return direction === "desc" ? b.premiereDate.localeCompare(a.premiereDate) : a.premiereDate.localeCompare(b.premiereDate);
    });
}

/**
 * Every revival, sortable by premiere date (FR-021, FR-022). Directeurs are appointed from the row; the revival page
 * manages the steering group. Controls show only when the server allows them.
 */
export function RevivalAdminTable({revivals}: { revivals: RevivalSummaryFragment[] }) {
    const t = useTranslations();
    const locale = useLocale();
    const [direction, setDirection] = useState<Direction>("desc");
    const sorted = useMemo(() => sortByPremiere(revivals, direction), [revivals, direction]);

    if (revivals.length === 0) {
        return <p className="text-muted-foreground">{t("Admin.empty")}</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("Revival.spex")}</TableHead>
                    <TableHead>{t("Revival.year")}</TableHead>
                    <TableHead>{t("Revival.workingTitle")}</TableHead>
                    <TableHead>{t("Revival.status")}</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => setDirection(direction === "desc" ? "asc" : "desc")}
                                aria-label={t("Admin.sortByPremiere")}>
                            {t("Revival.premiereDate")}
                            {direction === "desc" ? <ArrowDown/> : <ArrowUp/>}
                        </Button>
                    </TableHead>
                    <TableHead>{t("Revival.directeurs")}</TableHead>
                    <TableHead/>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sorted.map(revival => {
                    const directeurs = revival.members.filter(member => member.role === "DIRECTEUR");

                    return (
                        <TableRow key={revival.id}>
                            <TableCell><SpexTitle spex={revival.spex}/></TableCell>
                            <TableCell>{revival.year}</TableCell>
                            <TableCell>
                                <Link href={`/revivals/${revival.id}`} className="font-medium underline-offset-4 hover:underline">
                                    {revival.workingTitle}
                                </Link>
                            </TableCell>
                            <TableCell><StatusBadge status={revival.status}/></TableCell>
                            <TableCell>{formatDate(revival.premiereDate, locale) ?? "–"}</TableCell>
                            <TableCell>
                                <div className="flex flex-col items-start gap-2">
                                    <div>
                                        {directeurs.length === 0 ? "–" : directeurs.map(member => (
                                            <div key={member.id}>
                                                {member.displayName ?? member.email ?? t("Members.waitingPerson")}
                                                {member.state === "WAITING" && <span className="text-muted-foreground"> ({t("MemberState.WAITING")})</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {revival.permissions.canManageDirecteurs && (
                                        <DirecteurDialog revivalId={revival.id} workingTitle={revival.workingTitle} members={revival.members}/>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <RevivalStatusSelect revivalId={revival.id} status={revival.status} allowedStatuses={revival.permissions.allowedStatuses}/>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
