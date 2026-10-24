"use client";

import * as React from "react";
import {useState} from "react";
import {useTranslations} from "next-intl";
import {Plus, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {isHostName, MAX_HOSTS, normalizeHost} from "@/lib/material/hosts";

/**
 * A service's hosts as chips: typed or pasted (a whole link works, its host is kept), added with Enter, a comma or the
 * button, each removable. A host that is not valid or already listed is refused with a message.
 */
export function HostsInput({id, value, onChange, error}: {
    id: string;
    value: string[];
    onChange: (hosts: string[]) => void;
    /** A key under "Validation" for the list as a whole. */
    error?: string | null;
}) {
    const t = useTranslations();
    const [text, setText] = useState("");
    const [problem, setProblem] = useState<string | null>(null);
    const message = problem ?? error ?? null;
    const full = value.length >= MAX_HOSTS;

    const add = () => {
        const hosts = text.split(/[\s,]+/).map(normalizeHost).filter(Boolean);

        if (hosts.length === 0) {
            return;
        }

        const next = [...value];

        for (const host of hosts) {
            if (!isHostName(host)) {
                setProblem("hostInvalid");
                return;
            }
            if (next.includes(host)) {
                setProblem("hostDuplicate");
                return;
            }
            next.push(host);
        }
        if (next.length > MAX_HOSTS) {
            setProblem("hostsTooMany");
            return;
        }
        onChange(next);
        setText("");
        setProblem(null);
    };

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium">{t("LinkServiceAdmin.hosts")}</label>
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={t("LinkServiceAdmin.hosts")}>
                    {value.map(host => (
                        <li key={host}>
                            <Badge variant="secondary" className="gap-1 py-1 pr-1 font-mono">
                                {host}
                                <button type="button" className="rounded-full p-0.5 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        aria-label={t("LinkServiceAdmin.removeHost", {host})} onClick={() => onChange(value.filter(other => other !== host))}>
                                    <X className="size-3"/>
                                </button>
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex gap-2">
                <Input id={id} value={text} disabled={full} placeholder={t("LinkServiceAdmin.hostPlaceholder")} autoComplete="off" spellCheck={false}
                       inputMode="url" aria-invalid={message ? true : undefined} aria-describedby={`${id}-help${message ? ` ${id}-error` : ""}`}
                       onChange={change => {
                           setText(change.target.value);
                           setProblem(null);
                       }}
                       onKeyDown={key => {
                           if (key.key === "Enter" || key.key === ",") {
                               key.preventDefault();
                               add();
                           }
                       }}/>
                <Button type="button" variant="outline" disabled={full || !text.trim()} onClick={add}><Plus/>{t("LinkServiceAdmin.addHost")}</Button>
            </div>
            <p id={`${id}-help`} className="text-xs text-muted-foreground">{t("LinkServiceAdmin.hostsHelp", {max: MAX_HOSTS})}</p>
            {message && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{t(`Validation.${message}`)}</p>}
        </div>
    );
}
