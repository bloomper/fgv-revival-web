import {vi} from "vitest";

export const router = {refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), back: vi.fn()};

export const navigation = {
    useRouter: () => router,
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/revivals/r1",
};
