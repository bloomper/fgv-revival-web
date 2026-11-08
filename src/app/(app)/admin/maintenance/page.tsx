import {getTranslations} from "next-intl/server";
import {Badge} from "@/components/ui/badge";
import {RefreshWhileRunning} from "@/components/maintenance/refresh-while-running.client";
import {RunJobButton} from "@/components/maintenance/run-job-button.client";
import {getMaintenanceJobs} from "@/lib/maintenance/maintenance.server";
import {formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The scheduled maintenance jobs, for super admins: their schedules and latest runs, and a button to run each now.
 */
export default async function MaintenancePage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Maintenance");
        const jobs = await getMaintenanceJobs();

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{t("intro")}</p>
                <RefreshWhileRunning running={jobs.some(job => job.running)}/>
                <ul className="grid max-w-4xl gap-4 md:grid-cols-2">
                    {jobs.map(job => (
                        <li key={job.job} className="flex flex-col gap-3 rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-medium">{t(`jobs.${job.job}.title`)}</h3>
                                {job.running && <Badge variant="secondary">{t("running")}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{t(`jobs.${job.job}.description`)}</p>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                                <dt className="text-muted-foreground">{t("schedule")}</dt>
                                <dd>{job.schedule ? <code className="text-xs">{job.schedule}</code> : t("notScheduled")}</dd>
                                <dt className="text-muted-foreground">{t("lastRun")}</dt>
                                <dd className={job.lastSucceeded === false ? "text-destructive" : undefined}>
                                    {!job.lastStartedAt
                                        ? t("neverRun")
                                        : job.lastSucceeded === false
                                            ? t("failed", {at: formatInstant(job.lastStartedAt) ?? ""})
                                            : job.lastSucceeded
                                                ? t("succeeded", {at: formatInstant(job.lastFinishedAt ?? job.lastStartedAt) ?? ""})
                                                : t("startedAt", {at: formatInstant(job.lastStartedAt) ?? ""})}
                                </dd>
                            </dl>
                            <div>
                                <RunJobButton job={job.job} running={job.running}/>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    });
}
