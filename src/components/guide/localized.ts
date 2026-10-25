export type LocalizedTextValue = { sv: string, en?: string | null };

/**
 * The text to show in a locale: English where there is one, otherwise Swedish, marked as not translated.
 */
export function pickText(text: LocalizedTextValue, locale: string): { text: string, translated: boolean } {
    if (locale === "en") {
        return text.en ? {text: text.en, translated: true} : {text: text.sv, translated: false};
    }
    return {text: text.sv, translated: true};
}
