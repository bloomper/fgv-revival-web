import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import {toast} from "sonner";
import {useActionFeedback} from "@/hooks/use-action-feedback";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({useRouter: () => ({refresh})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

describe("useActionFeedback", () => {
    beforeEach(() => vi.clearAllMocks());

    it("refreshes and confirms a success", () => {
        const {result} = renderHook(() => useActionFeedback());

        expect(result.current({ok: true, data: 1}, "Sparat")).toBe(true);
        expect(toast.success).toHaveBeenCalledWith("Sparat");
        expect(refresh).toHaveBeenCalled();
        expect(result.current({ok: true, data: 1})).toBe(true);
    });

    it("offers a reload on conflict", () => {
        const {result} = renderHook(() => useActionFeedback());

        expect(result.current({ok: false, code: "CONFLICT", message: "x"})).toBe(false);
        expect(vi.mocked(toast.error).mock.calls[0][0]).toBe("Errors.CONFLICT");

        const options = vi.mocked(toast.error).mock.calls[0][1] as unknown as { action: { onClick: () => void } };

        options.action.onClick();
        expect(refresh).toHaveBeenCalled();
    });

    it("shows the server's message for validation errors and a translated one otherwise", () => {
        const {result} = renderHook(() => useActionFeedback());

        result.current({ok: false, code: "BAD_REQUEST", message: "Premiären måste ligga år 2028."});
        result.current({ok: false, code: "SPEXREGISTER_UNAVAILABLE", message: "x"});

        expect(toast.error).toHaveBeenNthCalledWith(1, "Premiären måste ligga år 2028.");
        expect(toast.error).toHaveBeenNthCalledWith(2, "Errors.SPEXREGISTER_UNAVAILABLE");
    });
});
