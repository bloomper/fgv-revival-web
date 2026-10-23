import {redirect} from "next/navigation";
import {GuideStart} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The guide's start page for the latest published version. An older version is under {@code /guide/versions/<id>};
 * links from before, with {@code ?version=}, are sent there.
 */
export default async function GuidePage({searchParams}: { searchParams: Promise<{ version?: string }> }) {
    const {version} = await searchParams;

    if (version) {
        redirect(`/guide/versions/${encodeURIComponent(version)}`);
    }
    return withPolicyPage(Policies.app.requireAccess, async () => <GuideStart/>);
}
