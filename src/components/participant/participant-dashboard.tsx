import {useTranslations} from "next-intl";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import type {ParticipantResponse} from "@/gql/graphql";
import type {PositionValue} from "@/components/participant/participant-labels";

export type ParticipantCountsValue = {
    total: number;
    byResponse: { response: ParticipantResponse; count: number }[];
    byPosition: { position?: PositionValue | null; yes: number; maybe: number; pending: number }[];
    notInvited: number;
    waitingForAccess: number;
    feesPaid: number;
    feesUnpaid: number;
    helpers: number;
};

const RESPONSES: ParticipantResponse[] = ["YES", "MAYBE", "PENDING", "NO"];

/**
 * The tiles on top of the participants page, in order: the answers, then who is not invited or waits for access, the
 * fees and the helpers.
 */
export function participantTiles(counts: ParticipantCountsValue): { key: string; count: number }[] {
    const byResponse = new Map(counts.byResponse.map(entry => [entry.response, entry.count]));

    return [
        ...RESPONSES.map(response => ({key: `responses.${response}`, count: byResponse.get(response) ?? 0})),
        {key: "notInvited", count: counts.notInvited},
        {key: "waitingForAccess", count: counts.waitingForAccess},
        {key: "feesPaid", count: counts.feesPaid},
        {key: "feesUnpaid", count: counts.feesUnpaid},
        {key: "helpers", count: counts.helpers},
    ];
}

/**
 * The participants at a glance (5.6): counts by answer, invitations, fees and helpers, and how each position is filled.
 */
export function ParticipantDashboard({counts}: { counts: ParticipantCountsValue }) {
    const t = useTranslations("Participants");

    return (
        <section aria-labelledby="participant-counts" className="flex flex-col gap-4">
            <h4 id="participant-counts" className="sr-only">{t("countsTitle", {total: counts.total})}</h4>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
                {participantTiles(counts).map(tile => (
                    <li key={tile.key}>
                        <Card className="h-full gap-1 py-3">
                            <CardContent className="px-3">
                                <div className="text-2xl font-bold tabular-nums">{tile.count}</div>
                                <div className="text-xs text-muted-foreground">{t(tile.key)}</div>
                            </CardContent>
                        </Card>
                    </li>
                ))}
            </ul>
            {counts.byPosition.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t("byPosition")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("position")}</TableHead>
                                    <TableHead className="text-right">{t("responses.YES")}</TableHead>
                                    <TableHead className="text-right">{t("responses.MAYBE")}</TableHead>
                                    <TableHead className="text-right">{t("responses.PENDING")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {counts.byPosition.map(entry => (
                                    <TableRow key={entry.position?.id ?? "none"}>
                                        <TableCell>{entry.position?.name ?? <span
                                            className="text-muted-foreground">{t("noPosition")}</span>}</TableCell>
                                        <TableCell className="text-right tabular-nums">{entry.yes}</TableCell>
                                        <TableCell className="text-right tabular-nums">{entry.maybe}</TableCell>
                                        <TableCell className="text-right tabular-nums">{entry.pending}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
