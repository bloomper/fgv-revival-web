"use client";

import {MemberList, type Member} from "@/components/member/member-list.client";

export function DirecteurList({revivalId, members, canManage}: { revivalId: string; members: Member[]; canManage: boolean }) {
    return <MemberList revivalId={revivalId} role="DIRECTEUR" members={members} canManage={canManage}/>;
}
