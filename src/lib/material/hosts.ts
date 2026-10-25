// Recognising the service a material's link belongs to. The server decides at save; this mirror of its rule
// only drives the hint shown while typing, so a link the web recognises differently is saved as the server says.

export const MAX_URL = 2000;
export const MAX_HOSTS = 10;

// Labels of letters, digits and hyphens, never starting or ending with a hyphen, at most 63 characters each
const HOST = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

/**
 * Whether the text is a lower-case host name such as {@code drive.google.com}: what a service's hosts hold.
 */
export function isHostName(host: string): boolean {
    return HOST.test(host);
}

/**
 * The URL as the server accepts it: an absolute https URL with a host and no user name or password; null otherwise.
 */
export function parseHttpsUrl(text: string): URL | null {
    const trimmed = text.trim();

    if (!trimmed || trimmed.length > MAX_URL || !/^https:\/\//i.test(trimmed)) {
        return null;
    }
    try {
        const url = new URL(trimmed);

        return url.protocol === "https:" && url.hostname && !url.username && !url.password ? url : null;
    } catch {
        return null;
    }
}

/**
 * The link's host, lower-cased, or null when the link is not a valid https URL.
 */
export function hostOf(text: string): string | null {
    return parseHttpsUrl(text)?.hostname.toLowerCase() ?? null;
}

/**
 * What a typed or pasted host becomes: lower-cased, without a scheme, path or port, so pasting a whole link works.
 */
export function normalizeHost(text: string): string {
    const trimmed = text.trim().toLowerCase();
    const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");

    return withoutScheme.split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
}

/**
 * The first active service, in list order, one of whose hosts the link's host is or ends with "." + it; null when the
 * link is not valid or no service matches.
 */
export function recogniseService<S extends {
    hosts: readonly string[];
    retired?: boolean
}>(url: string, services: readonly S[]): S | null {
    const host = hostOf(url);

    if (!host) {
        return null;
    }
    return services.find(service => !service.retired
        && service.hosts.some(candidate => host === candidate || host.endsWith(`.${candidate}`))) ?? null;
}
