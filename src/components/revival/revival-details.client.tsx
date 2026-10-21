"use client";

import * as React from "react";
import {useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {RevivalDetailFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SpexTitle} from "@/components/revival/spex-title";
import {RevivalDetailsForm} from "@/components/revival/revival-details-form.client";
import {formatDate, formatInstant} from "@/utils/format";

/**
 * A revival's details and status history. Edit controls show only when `permissions.canEditDetails` is set.
 */
export function RevivalDetails({revival}: { revival: RevivalDetailFragment }) {
    const t = useTranslations();
    const locale = useLocale();
    const [editing, setEditing] = useState(false);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t("Revival.details")}</CardTitle>
                    {revival.permissions.canEditDetails && !editing && (
                        <CardAction>
                            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>{t("Revival.editDetails")}</Button>
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
                            <dd>{formatDate(revival.premiereDate, locale) ?? t("Revival.notSet")}</dd>
                            <dt className="text-muted-foreground">{t("Revival.showDates")}</dt>
                            <dd>{revival.showDates.length === 0 ? t("Revival.none") : revival.showDates.map(date => formatDate(date, locale)).join(", ")}</dd>
                            <dt className="text-muted-foreground">{t("Revival.venues")}</dt>
                            <dd>{revival.venues.length === 0 ? t("Revival.none") : revival.venues.join(", ")}</dd>
                        </dl>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t("Revival.statusHistory")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {revival.statusHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("Revival.noStatusHistory")}</p>
                    ) : (
                        <ol className="space-y-2 text-sm">
                            {revival.statusHistory.map((change, index) => (
                                <li key={index}>
                                    <span className="text-muted-foreground">{formatInstant(change.changedAt, locale)}</span>{" "}
                                    {t("Revival.changedBy", {
                                        name: change.changedBy ?? "–",
                                        from: t(`Status.${change.from}`),
                                        to: t(`Status.${change.to}`),
                                    })}
                                </li>
                            ))}
                        </ol>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">{t("Revival.created", {name: revival.createdBy})}</p>
                </CardContent>
            </Card>
        </div>
    );
}
