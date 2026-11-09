import { describe, expect, it } from "vitest";
import { commercialOfferVersionSchema } from "@/features/commercial/schemas";

const eventOffer = {
  code: "ESSENTIEL",
  name: "Essentiel",
  description: "Forfait événementiel",
  category: "EVENT",
  context: "EVENT",
  active: true,
  priceMinor: null,
  currency: null,
  billingInterval: "ONE_TIME",
  retentionDays: null,
  retentionAnchor: null,
  entitlements: [],
};

describe("commercial offer version schema", () => {
  it("accepts an event package with no invented price or quotas", () => {
    expect(commercialOfferVersionSchema.safeParse(eventOffer).success).toBe(true);
  });

  it("requires a currency with a configured minor-unit price", () => {
    expect(
      commercialOfferVersionSchema.safeParse({
        ...eventOffer,
        priceMinor: "15000",
      }).success,
    ).toBe(false);
  });

  it("requires professional offers to use a monthly or yearly organization context", () => {
    expect(
      commercialOfferVersionSchema.safeParse({
        ...eventOffer,
        category: "PROFESSIONAL",
        context: "ORGANIZATION",
        billingInterval: "ONE_TIME",
      }).success,
    ).toBe(false);
  });

  it("rejects duplicated entitlement keys and non-integer quota values", () => {
    const quota = {
      key: "guests.count",
      type: "QUOTA",
      limitValue: "10",
      usageScope: "EVENT",
    };
    expect(
      commercialOfferVersionSchema.safeParse({
        ...eventOffer,
        entitlements: [quota, quota],
      }).success,
    ).toBe(false);
    expect(
      commercialOfferVersionSchema.safeParse({
        ...eventOffer,
        entitlements: [{ ...quota, limitValue: "-1" }],
      }).success,
    ).toBe(false);
  });
});
