import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormValidation } from "@/components/form-validation.client";
import { DateInput } from "@/components/date-input.client";

describe("FormValidation", () => {
  const form = () =>
    render(
      <form>
        <FormValidation />
        <input
          aria-label="name"
          required
        />
        <input
          aria-label="code"
          pattern="[a-z]+"
          title="a-z"
          defaultValue="A1"
        />
        <input
          aria-label="email"
          type="email"
          defaultValue="nej"
        />
        <input
          aria-label="own"
          ref={(input) => input?.setCustomValidity("Egen")}
        />
      </form>
    );

  it("replaces the browser's messages with the app's", () => {
    form();
    const name = screen.getByLabelText<HTMLInputElement>("name");

    name.checkValidity();
    expect(name.validationMessage).toBe("valueMissing");
    screen.getByLabelText<HTMLInputElement>("code").checkValidity();
    expect(screen.getByLabelText<HTMLInputElement>("code").validationMessage).toBe('patternWithHint:{"hint":"a-z"}');
    screen.getByLabelText<HTMLInputElement>("email").checkValidity();
    expect(screen.getByLabelText<HTMLInputElement>("email").validationMessage).toBe("email");
  });

  it("clears its message when the value changes, and leaves a control's own message alone", () => {
    form();
    const name = screen.getByLabelText<HTMLInputElement>("name");

    name.checkValidity();
    fireEvent.input(name, { target: { value: "Spex" } });
    expect(name.checkValidity()).toBe(true);

    const own = screen.getByLabelText<HTMLInputElement>("own");

    own.checkValidity();
    expect(own.validationMessage).toBe("Egen");
  });

  it("names the expected format of a date field", () => {
    render(
      <form>
        <FormValidation />
        <DateInput
          aria-label="day"
          defaultValue="14/2 1975"
        />
      </form>
    );
    const day = screen.getByRole<HTMLInputElement>("textbox", { name: "day" });

    day.checkValidity();
    expect(day.validationMessage).toBe('patternWithHint:{"hint":"datePlaceholder"}');
  });
});
