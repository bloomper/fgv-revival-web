import {describe, expect, it} from "vitest";
import {hostOf, isHostName, normalizeHost, parseHttpsUrl, recogniseService} from "@/lib/material/hosts";

const services = [
    {id: "SPEXFLIX", hosts: [], retired: false},
    {id: "OLD", hosts: ["drive.google.com"], retired: true},
    {id: "GOOGLE_DRIVE", hosts: ["drive.google.com", "docs.google.com"], retired: false},
    {id: "YOUTUBE", hosts: ["youtube.com", "youtu.be"], retired: false},
    {id: "ONEDRIVE", hosts: ["sharepoint.com"], retired: false},
];

describe("parseHttpsUrl", () => {
    it.each([
        "https://drive.google.com/file/d/1",
        "  https://example.org  ",
        "HTTPS://Example.org/x?y=1#z",
    ])("accepts %s", url => {
        expect(parseHttpsUrl(url)).not.toBeNull();
    });

    it.each([
        "http://example.org",
        "javascript:alert(1)",
        "https://user:secret@example.org",
        "https://user@example.org",
        "ftp://example.org",
        "drive.google.com/file",
        "https://",
        "https://exa mple.org",
        "",
        `https://example.org/${"a".repeat(2000)}`,
    ])("refuses %s", url => {
        expect(parseHttpsUrl(url)).toBeNull();
    });
});

describe("hostOf", () => {
    it("lower-cases the host and drops the port", () => {
        expect(hostOf("https://Drive.Google.COM:443/x")).toBe("drive.google.com");
        expect(hostOf("http://drive.google.com")).toBeNull();
    });
});

describe("recogniseService", () => {
    it("matches a host or a subdomain of one, the first active service in list order", () => {
        expect(recogniseService("https://drive.google.com/file/d/1", services)?.id).toBe("GOOGLE_DRIVE");
        expect(recogniseService("https://www.youtube.com/watch?v=1", services)?.id).toBe("YOUTUBE");
        expect(recogniseService("https://youtu.be/1", services)?.id).toBe("YOUTUBE");
        expect(recogniseService("https://chalmersspex.sharepoint.com/sites/x", services)?.id).toBe("ONEDRIVE");
    });

    it("does not match a host that merely ends with the same letters, an unknown host or an invalid link", () => {
        expect(recogniseService("https://notyoutube.com/x", services)).toBeNull();
        expect(recogniseService("https://example.org", services)).toBeNull();
        expect(recogniseService("http://drive.google.com", services)).toBeNull();
    });
});

describe("isHostName and normalizeHost", () => {
    it("accepts lower-case host names only", () => {
        expect(isHostName("drive.google.com")).toBe(true);
        expect(isHostName("1drv.ms")).toBe(true);
        expect(isHostName("Drive.google.com")).toBe(false);
        expect(isHostName("-bad.example")).toBe(false);
        expect(isHostName("bad..example")).toBe(false);
        expect(isHostName("has space.org")).toBe(false);
    });

    it("keeps the host of a pasted link", () => {
        expect(normalizeHost(" https://Drive.Google.com/file/d/1?x=1 ")).toBe("drive.google.com");
        expect(normalizeHost("youtu.be:443")).toBe("youtu.be");
        expect(normalizeHost("spexflix.example.")).toBe("spexflix.example");
    });
});
