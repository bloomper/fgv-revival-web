"use client";

import {MemberList, type Member} from "@/components/member/member-list.client";

export function SteeringGroupList({revivalId, members, canManage}: { revivalId: string; members: Member[]; canManage: boolean }) {
    return <MemberList revivalId={revivalId} role="STEERING_GROUP" members={members} canManage={canManage}/>;
}
