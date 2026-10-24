import type {ComponentProps} from "react";
import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import type {MailingAudienceKind, MailingRecipientStatus, MailingStatus} from "@/gql/graphql";

export type AudienceValue = { kind: MailingAudienceKind; position?: { name: string } | null; event?: { title: string } | null };

const STATUS_VARIANTS: Record<MailingStatus, ComponentProps<typeof Badge>["variant"]> = {DRAFT: "outline", SENT: "secondary", CANCELLED: "outline"};
const RECIPIENT_VARIANTS: Record<MailingRecipientStatus, ComponentProps<typeof Badge>["variant"]> = {SENT: "secondary", FAILED: "destructive", NO_ADDRESS: "outline"};

export function MailingStatusBadge({status}: { status: MailingStatus }) {
    const t = useTranslations("Mailings");

    return <Badge variant={STATUS_VARIANTS[status]}>{t(`statuses.${status}`)}</Badge>;
}

export function RecipientStatusBadge({status}: { status: MailingRecipientStatus }) {
    const t = useTranslations("Mailings");

    return <Badge variant={RECIPIENT_VARIANTS[status]}>{t(`recipientStatuses.${status}`)}</Badge>;
}

/** The audience in words, with the position or event it names: "Participants with a position: Orchestra". */
export function useAudienceText() {
    const t = useTranslations("Mailings");

    return (audience: AudienceValue) => {
        const kind = t(`audiences.${audience.kind}`);

        if (audience.kind === "POSITION" && audience.position) {
            return `${kind}: ${audience.position.name}`;
        }
        if (audience.kind === "EVENT_ATTENDEES" && audience.event) {
            return `${kind}: ${audience.event.title}`;
        }
        return kind;
    };
}

export function AudienceText({audience}: { audience: AudienceValue }) {
    return <>{useAudienceText()(audience)}</>;
}
