import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {ChevronRight} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {catalogName} from "@/components/catalog/catalog";
import {type Member, memberName} from "@/components/member/member";

/**
 * Who leads the revival, on its overview: directeurs and the steering group with their areas. Adding, changing and
 * removing happen on the members tab.
 */
export function MemberSummary({revivalId, members}: { revivalId: string; members: Member[] }) {
    const t = useTranslations();
    const locale = useLocale();
    const fallback = t("Members.waitingPerson");
    const directeurs = members.filter(member => member.role === "DIRECTEUR");
    const steeringGroup = members.filter(member => member.role === "STEERING_GROUP");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("Revival.members")}</CardTitle>
                <CardAction>
                    <Link href={`/revivals/${revivalId}/members`}
                          className={buttonVariants({variant: "outline", size: "sm"})}>
                        {t("Members.showAll")}
                        <ChevronRight/>
                    </Link>
                </CardAction>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">{t("Revival.directeurs")}</dt>
                    <dd>
                        {directeurs.length === 0 ?
                            <span className="text-muted-foreground">{t("Members.noDirecteurs")}</span>
                            : directeurs.map(member => memberName(member, fallback)).join(", ")}
                    </dd>
                    <dt className="text-muted-foreground">{t("Revival.steeringGroup")}</dt>
                    <dd>
                        {steeringGroup.length === 0 ?
                            <span className="text-muted-foreground">{t("Members.noMembers")}</span> : (
                                <ul className="space-y-0.5">
                                    {steeringGroup.map(member => (
                                        <li key={member.id}>
                                            {memberName(member, fallback)}
                                            {(member.capabilities ?? []).length > 0 && (
                                                <span
                                                    className="text-muted-foreground"> · {(member.capabilities ?? []).map(capability => catalogName(capability, locale)).join(", ")}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </dd>
                </dl>
            </CardContent>
        </Card>
    );
}
