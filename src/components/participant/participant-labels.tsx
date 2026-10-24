import type {ComponentProps} from "react";
import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {NativeSelect} from "@/components/ui/native-select";
import type {InvitationState, ParticipantKind, ParticipantResponse} from "@/gql/graphql";

export type PositionValue = { id: string; name: string; category?: string | null; hasRole: boolean };
export type VocalPartValue = { id: string; name: string };

const RESPONSE_VARIANTS: Record<ParticipantResponse, ComponentProps<typeof Badge>["variant"]> = {
    YES: "default",
    MAYBE: "secondary",
    NO: "destructive",
    PENDING: "outline",
};

export function ResponseBadge({response}: { response: ParticipantResponse }) {
    const t = useTranslations("Participants");

    return <Badge variant={RESPONSE_VARIANTS[response]}>{t(`responses.${response}`)}</Badge>;
}

export function KindBadge({kind}: { kind: ParticipantKind }) {
    const t = useTranslations("Participants");

    return <Badge variant={kind === "HELPER" ? "secondary" : "outline"}>{t(`kinds.${kind}`)}</Badge>;
}

export function InvitationBadge({state}: { state: InvitationState }) {
    const t = useTranslations("Participants");

    return <Badge variant={state === "ACTIVE" ? "secondary" : "outline"}>{t(`invitation.${state}`)}</Badge>;
}

/**
 * Picks a position from Spexregister's task list, grouped by category.
 */
export function PositionSelect({positions, emptyLabel, ...props}: {
    positions: PositionValue[];
    emptyLabel: string
} & Omit<ComponentProps<"select">, "size">) {
    const groups = new Map<string, PositionValue[]>();

    positions.forEach(position => {
        const key = position.category ?? "";

        groups.set(key, [...(groups.get(key) ?? []), position]);
    });

    return (
        <NativeSelect className="w-full" {...props}>
            <option value="">{emptyLabel}</option>
            {[...groups.entries()].map(([category, entries]) => category ? (
                <optgroup key={category} label={category}>
                    {entries.map(position => <option key={position.id} value={position.id}>{position.name}</option>)}
                </optgroup>
            ) : entries.map(position => <option key={position.id} value={position.id}>{position.name}</option>))}
        </NativeSelect>
    );
}
