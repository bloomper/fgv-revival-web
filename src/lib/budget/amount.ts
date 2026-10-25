// Kronor as the server sends them: a decimal string with at most two decimals. Sums and
// differences are done in whole öre so no öre is lost to floating point.

const SPACES = /[\s  ]/g;

/**
 * Reads an amount as people type it — "1 200,50", "1200.50", "1 200 kr" — into the server's form ("1200.50", or
 * "1200" for whole kronor). Null when it is not an amount with at most two decimals.
 */
export function parseAmount(input: string | null | undefined, {allowNegative = false} = {}): string | null {
    const text = (input ?? "").replace(SPACES, "").replace(/kr$/i, "").replace("−", "-");
    const match = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/.exec(text);

    if (!match || (match[1] && !allowNegative)) {
        return null;
    }

    const [, sign, whole, fraction] = match;
    const integer = whole.replace(/^0+(?=\d)/, "");
    const decimals = fraction ? fraction.padEnd(2, "0") : "";
    const zero = /^0*$/.test(integer + decimals);

    return `${sign && !zero ? "-" : ""}${integer}${decimals && decimals !== "00" ? `.${decimals}` : ""}`;
}

/**
 * An amount in whole öre, or null when it is not one.
 */
export function toOre(value: string | null | undefined): number | null {
    const amount = parseAmount(value, {allowNegative: true});

    if (amount === null) {
        return null;
    }

    const [whole, fraction = ""] = amount.replace("-", "").split(".");
    const ore = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

    return amount.startsWith("-") ? -ore : ore;
}

/**
 * Öre back to the server's form: "1200.50", "1200", "-35.50".
 */
export function fromOre(ore: number): string {
    const sign = ore < 0 ? "-" : "";
    const absolute = Math.abs(Math.round(ore));
    const whole = Math.floor(absolute / 100);
    const fraction = absolute % 100;

    return `${sign}${whole}${fraction ? `.${String(fraction).padStart(2, "0")}` : ""}`;
}

/**
 * The difference a − b of two amounts, null when either is missing.
 */
export function subtractAmounts(a: string | null | undefined, b: string | null | undefined): string | null {
    const left = toOre(a);
    const right = toOre(b);

    return left === null || right === null ? null : fromOre(left - right);
}

/**
 * Reads a quantity as typed ("2", "1,5", "0.25"), at most two decimals; null otherwise.
 */
export function parseQuantity(input: string | null | undefined): number | null {
    const text = (input ?? "").replace(SPACES, "").replace(",", ".");

    return /^\d+(\.\d{1,2})?$/.test(text) ? Number(text) : null;
}

/**
 * quantity × unit amount rounded half up to öre, as the server computes a line's amount.
 */
export function lineAmount(quantity: string | number | null | undefined, unitAmount: string | null | undefined): string | null {
    const parsed = typeof quantity === "number" ? quantity : parseQuantity(quantity);
    const unit = toOre(unitAmount);

    if (parsed === null || unit === null || Number.isNaN(parsed)) {
        return null;
    }

    // Hundredths of a unit times öre, in BigInt: 100000.00 × 10 000 000 kr would not fit a double exactly
    const hundredths = BigInt(Math.round(parsed * 100));
    const product = hundredths * BigInt(unit);
    const negative = product < BigInt(0);
    const absolute = negative ? -product : product;
    const rounded = (absolute + BigInt(50)) / BigInt(100);

    return fromOre(Number(negative ? -rounded : rounded));
}

/**
 * A plain amount for an input field: "1200.50" becomes "1200,50", as people type in Swedish.
 */
export function amountInputValue(value: string | null | undefined): string {
    return value ? value.replace(".", ",") : "";
}
