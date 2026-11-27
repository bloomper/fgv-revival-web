import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {MembershipPayment} from "@/components/closing/membership-payment";

const payment = {
    reference: "FGV28AB3K4", amount: 600, paid: 0, status: "OPEN", included: 3,
    swishNumber: "1234567890", bankgiro: "123-4567", bankAccount: null, payeeName: "FGV",
};

describe("MembershipPayment", () => {
    it("shows what to pay, to whom and with what message", () => {
        render(<MembershipPayment payment={payment}/>);

        const view = screen.getByTestId("membership-payment");

        expect(view).toHaveTextContent("600 kr");
        expect(view).toHaveTextContent("1234567890");
        expect(view).toHaveTextContent("123-4567");
        expect(view).toHaveTextContent("FGV28AB3K4");
        expect(view).toHaveTextContent("statuses.OPEN");
    });

    it("shows what has been paid", () => {
        render(<MembershipPayment payment={{...payment, status: "MATCHED", paid: 600}}/>);

        expect(screen.getByTestId("membership-payment")).toHaveTextContent("statuses.MATCHED");
        expect(screen.getByTestId("membership-payment")).toHaveTextContent("paid");
    });
});
