"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Calculator, FolderOpen, Save, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AmountText} from "@/components/budget/budget-labels";
import {
    calculateScenarioAction,
    removeScenarioAction,
    saveScenarioAction,
    updateScenarioAction,
} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";
import {
    MAX_SCENARIO_NAME,
    SCENARIO_COUNTS,
    SCENARIO_PARAMETERS,
    type ScenarioParameter,
    type ScenarioValues,
    scenarioValuesSchema,
} from "@/lib/budget/schema";

export type ScenarioParameters = { [key in ScenarioParameter]?: string | number | null };

export type ScenarioResult = {
    baseline: ScenarioParameters;
    used: ScenarioParameters;
    income: string;
    cost: string;
    result: string;
    breakEvenShowTickets?: number | null;
    partySubsidy: string;
};

export type SavedScenario = { id: string; name: string; parameters: ScenarioParameters; result: ScenarioResult; version: number };

/**
 * A parameter as the form shows it: counts as they are, amounts with a decimal comma; blank when unset.
 */
export function parameterText(key: ScenarioParameter, value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
        return "";
    }
    return SCENARIO_COUNTS.has(key) ? String(value) : amountInputValue(String(value));
}

export function toScenarioValues(parameters: ScenarioParameters): ScenarioValues {
    return Object.fromEntries(SCENARIO_PARAMETERS.map(key => [key, parameterText(key, parameters[key])])) as ScenarioValues;
}

const EMPTY = toScenarioValues({});

function ResultCard({result, title}: { result: ScenarioResult; title: string }) {
    const t = useTranslations("Budget");

    return (
        <Card role="region" aria-label={title} className="gap-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{t("scenarioResultHint")}</CardDescription>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">{t("kinds.INCOME")}</dt>
                    <dd className="text-right"><AmountText value={result.income}/></dd>
                    <dt className="text-muted-foreground">{t("kinds.COST")}</dt>
                    <dd className="text-right"><AmountText value={result.cost}/></dd>
                    <dt className="font-medium">{t("result")}</dt>
                    <dd className="text-right font-medium"><AmountText value={result.result} signed/></dd>
                    <dt className="text-muted-foreground">{t("breakEven")}</dt>
                    <dd className="text-right tabular-nums">{result.breakEvenShowTickets ?? "—"}</dd>
                    <dt className="text-muted-foreground">{t("partySubsidy")}</dt>
                    <dd className="text-right"><AmountText value={result.partySubsidy}/></dd>
                </dl>
            </CardContent>
        </Card>
    );
}

/**
 * The scenario calculator (M5-FR-10): eight parameters, each showing the budget's value until changed; "Calculate" asks
 * the server what the result would be. Writers save a calculation as a named scenario, load one back, update or
 * remove it.
 */
export function ScenarioPanel({revivalId, current, scenarios, canWrite}: {
    revivalId: string;
    /** The budget's own result, with its baseline. */
    current: ScenarioResult;
    scenarios: SavedScenario[];
    canWrite: boolean;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [result, setResult] = useState<ScenarioResult>(current);
    const [calculated, setCalculated] = useState(false);
    const [loaded, setLoaded] = useState<SavedScenario | null>(null);
    const [name, setName] = useState("");
    const form = useForm<ScenarioValues>({resolver: zodResolver(scenarioValuesSchema), defaultValues: EMPTY});
    const {errors} = form.formState;
    const nameValid = name.trim().length > 0 && name.trim().length <= MAX_SCENARIO_NAME;

    const calculate = form.handleSubmit(values => startTransition(async () => {
        const outcome = await calculateScenarioAction({revivalId, values});

        if (feedback(outcome) && outcome.data) {
            setResult(outcome.data);
            setCalculated(true);
        }
    }));

    const save = (update: boolean) => form.handleSubmit(values => startTransition(async () => {
        if (update && loaded) {
            feedback(await updateScenarioAction({revivalId, id: loaded.id, version: loaded.version, name: name.trim(), values}), t("Budget.scenarioSaved"));
        } else if (feedback(await saveScenarioAction({revivalId, name: name.trim(), values}), t("Budget.scenarioSaved"))) {
            setLoaded(null);
        }
    }))();

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <form onSubmit={calculate} className="space-y-4" aria-label={t("Budget.scenarioForm")}>
                    <p className="text-sm text-muted-foreground">{t("Budget.scenarioIntro")}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {SCENARIO_PARAMETERS.map(key => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={`${id}-${key}`}>{t(`Budget.parameters.${key}`)}</Label>
                                <Input id={`${id}-${key}`} inputMode={SCENARIO_COUNTS.has(key) ? "numeric" : "decimal"} autoComplete="off" className="tabular-nums"
                                       placeholder={parameterText(key, current.baseline[key]) || t("Budget.notSet")}
                                       aria-invalid={errors[key] ? true : undefined} {...form.register(key)}/>
                                {errors[key]?.message && <p className="text-sm text-destructive">{t(`Validation.${errors[key].message}`)}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={pending}><Calculator/>{t("Budget.calculate")}</Button>
                        <Button type="button" variant="ghost" onClick={() => {
                            form.reset(EMPTY);
                            setResult(current);
                            setCalculated(false);
                            setLoaded(null);
                            setName("");
                        }}>{t("Common.reset")}</Button>
                    </div>
                    {canWrite && (
                        <div className="flex flex-wrap items-end gap-2 border-t pt-4">
                            <div className="w-full space-y-2 sm:w-64">
                                <Label htmlFor={`${id}-name`}>{t("Budget.scenarioName")}</Label>
                                <Input id={`${id}-name`} maxLength={MAX_SCENARIO_NAME} value={name} onChange={change => setName(change.target.value)}/>
                            </div>
                            <Button type="button" variant="outline" disabled={pending || !nameValid} onClick={() => save(false)}>
                                <Save/>{t("Budget.saveScenario")}
                            </Button>
                            {loaded && (
                                <Button type="button" variant="outline" disabled={pending || !nameValid} onClick={() => save(true)}>
                                    {t("Budget.updateScenario", {name: loaded.name})}
                                </Button>
                            )}
                        </div>
                    )}
                </form>
                <div aria-live="polite">
                    <ResultCard result={result} title={calculated ? t("Budget.scenarioResult") : t("Budget.budgetResult")}/>
                </div>
            </div>
            <section aria-labelledby="saved-scenarios" className="space-y-2">
                <h4 id="saved-scenarios" className="text-sm font-medium">{t("Budget.savedScenarios")}</h4>
                {scenarios.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("Budget.noScenarios")}</p>
                ) : (
                    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {scenarios.map(scenario => (
                            <li key={scenario.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
                                <p className="font-medium">{scenario.name}</p>
                                <p className="text-muted-foreground">
                                    {t("Budget.result")} <AmountText value={scenario.result.result} signed className="text-foreground"/>
                                    {scenario.result.breakEvenShowTickets !== null && scenario.result.breakEvenShowTickets !== undefined && (
                                        <> · {t("Budget.breakEvenShort", {count: scenario.result.breakEvenShowTickets})}</>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    <Button size="sm" variant="outline" aria-label={t("Budget.loadScenario", {name: scenario.name})} onClick={() => {
                                        form.reset(toScenarioValues(scenario.parameters));
                                        setResult(scenario.result);
                                        setCalculated(true);
                                        setLoaded(scenario);
                                        setName(scenario.name);
                                    }}><FolderOpen/>{t("Budget.load")}</Button>
                                    {canWrite && (
                                        <Button size="sm" variant="ghost" aria-label={t("Budget.removeScenario", {name: scenario.name})} disabled={pending}
                                                onClick={() => startTransition(async () => {
                                                    if (feedback(await removeScenarioAction({revivalId, id: scenario.id, version: scenario.version}), t("Budget.scenarioRemoved"))
                                                        && loaded?.id === scenario.id) {
                                                        setLoaded(null);
                                                    }
                                                })}><Trash2/>{t("Common.remove")}</Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
