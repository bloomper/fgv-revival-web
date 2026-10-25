import {getTranslations} from "next-intl/server";
import {LogoutButton} from "@/components/logout-button.client";

/**
 * Shown to someone who is logged in without the `USER` role on `fgv-revival`. Shows no revival data.
 */
export default async function NoAccessPage() {
    const t = await getTranslations();

    return (
        <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
            <div className="mx-auto max-w-md space-y-4 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {t("NoAccess.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("NoAccess.text")}
                </p>
                <div className="flex justify-center gap-2 pt-2">
                    <LogoutButton variant="outline"/>
                </div>
            </div>
        </div>
    );
}
