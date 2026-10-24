"use client";

import * as React from "react";
import {useState} from "react";
import {useTranslations} from "next-intl";
import type {RevivalDetailFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SpexTitle} from "@/components/revival/spex-title";
import {StatusBadge} from "@/components/revival/status-badge";
import {RevivalDetailsForm} from "@/components/revival/revival-details-form.client";
import {RevivalStatusSelect} from "@/components/revival/revival-status-select.client";
import {formatDate, formatInstant} from "@/utils/format";

/**
 * A revival's details, and its current status above the history of changes, with the control to change it in the
 * status card's header. Edit controls show only when `permissions.canEditDetails` is set.
 */
export function RevivalDetails({revival, syncIncomplete = false}: {
    revival: RevivalDetailFragment;
    /** Archiving warns when the participation sync never completed or has failures (M7-FR-14). */
    syncIncomplete?: boolean;
}) {
    const t = useTranslations();
    const [editing, setEditing] = useState(false);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Editing takes the whole width, so each show's date, time and venue fit on one line */}
            <Card className={editing ? "lg:col-span-2" : undefined}>
                <CardHeader>
                    <CardTitle>{t("Revival.details")}</CardTitle>
                    {revival.permissions.canEditDetails && !editing && (
                        <CardAction>
                            <Button variant="outline" size="sm"
                                    onClick={() => setEditing(true)}>{t("Revival.editDetails")}</Button>
                        </CardAction>
                    )}
                </CardHeader>
                <CardContent>
                    {editing ? (
                        <RevivalDetailsForm revival={revival} onDone={() => setEditing(false)}/>
                    ) : (
                        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                            <dt className="text-muted-foreground">{t("Revival.spex")}</dt>
                            <dd><SpexTitle spex={revival.spex}/></dd>
                            <dt className="text-muted-foreground">{t("Revival.year")}</dt>
                            <dd>{revival.year}</dd>
                            <dt className="text-muted-foreground">{t("Revival.premiereDate")}</dt>
                            <dd>{formatDate(revival.premiereDate) ?? t("Revival.notSet")}</dd>
                            <dt className="text-muted-foreground">{t("Revival.shows")}</dt>
                            <dd>
                                {revival.shows.length === 0 ? t("Revival.none") : (
                                    <ul className="space-y-0.5">
                                        {revival.shows.map((show, index) => (
                                            <li key={index}>
                                                <span
                                                    className="tabular-nums">{[formatDate(show.date), show.time].filter(Boolean).join(" ")}</span>{" "}
                                                {show.venue ?? <span
                                                    className="text-muted-foreground">({t("Revival.venueNotSet")})</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </dd>
                        </dl>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t("Revival.status")}</CardTitle>
                    {revival.permissions.allowedStatuses.length > 0 && (
                        <CardAction>
                            <RevivalStatusSelect revivalId={revival.id} status={revival.status}
                                                 allowedStatuses={revival.permissions.allowedStatuses}
                                                 syncIncomplete={syncIncomplete}/>
                        </CardAction>
                    )}
                </CardHeader>
                <CardContent className="space-y-5">
                    <StatusBadge status={revival.status} className="h-7 px-3 text-sm"/>
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">{t("Revival.statusHistory")}</h4>
                        {/* Newest first, ending with the revival's creation */}
                        <ol className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                            {revival.statusHistory.map((change, index) => (
                                <li key={index} className="col-span-2 grid grid-cols-subgrid">
                                    <span
                                        className="text-muted-foreground tabular-nums">{formatInstant(change.changedAt)}</span>
                                    <span>
                                        {t(`Status.${change.from}`)} → {t(`Status.${change.to}`)}
                                        {change.changedBy && <span
                                            className="text-muted-foreground"> {t("Revival.changedBy", {name: change.changedBy})}</span>}
                                    </span>
                                </li>
                            ))}
                            <li className="col-span-2 grid grid-cols-subgrid">
                                <span
                                    className="text-muted-foreground tabular-nums">{formatInstant(revival.createdAt)}</span>
                                <span>
                                    {t("Revival.created")}
                                    {revival.createdBy && <span
                                        className="text-muted-foreground"> {t("Revival.changedBy", {name: revival.createdBy})}</span>}
                                </span>
                            </li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
