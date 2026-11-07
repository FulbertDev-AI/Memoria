import { describe, expect, it } from "vitest";
import {
  getAccountTypeLabel,
  resetPasswordSchema,
  signUpSchema,
} from "@/features/auth/schemas";

describe("authentication input schemas", () => {
  it("normalizes e-mail and accepts the supported account types", () => {
    const result = signUpSchema.safeParse({
      name: "  Awa Koffi  ",
      email: " AWA@example.com ",
      password: "A-long-secure-password",
      accountType: "INDIVIDUAL",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Awa Koffi");
      expect(result.data.email).toBe("awa@example.com");
    }
  });

  it("rejects short passwords and unsupported account types", () => {
    expect(
      signUpSchema.safeParse({
        name: "Awa Koffi",
        email: "awa@example.com",
        password: "short",
        accountType: "ROOT",
      }).success,
    ).toBe(false);
  });

  it("rejects expired reset links without a token and short replacement passwords", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "a-secure-password" }).success).toBe(
      false,
    );
    expect(
      resetPasswordSchema.safeParse({ token: "opaque-token", password: "short" }).success,
    ).toBe(false);
  });

  it("uses readable labels and does not expose unknown account types", () => {
    expect(getAccountTypeLabel("INDIVIDUAL")).toBe("Particulier");
    expect(getAccountTypeLabel("UNTRUSTED_VALUE")).toBe("Non renseigné");
  });
});
