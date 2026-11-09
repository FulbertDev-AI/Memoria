import { z } from "zod";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const entitlementInputSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string().regex(/^[a-z][a-z0-9._-]{1,79}$/),
    type: z.literal("FEATURE"),
    enabled: z.boolean(),
  }),
  z.object({
    key: z.string().regex(/^[a-z][a-z0-9._-]{1,79}$/),
    type: z.literal("QUOTA"),
    limitValue: z.string().regex(/^\d{1,18}$/),
    usageScope: z.enum(["USER", "EVENT", "ORGANIZATION"]),
  }),
  z.object({
    key: z.string().regex(/^[a-z][a-z0-9._-]{1,79}$/),
    type: z.literal("VALUE"),
    value: z.record(z.string(), jsonValueSchema),
  }),
]);

export const commercialOfferVersionSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{1,39}$/),
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(1).max(1000),
    category: z.enum(["DISCOVERY", "EVENT", "PROFESSIONAL"]),
    context: z.enum(["PLATFORM", "EVENT", "ORGANIZATION"]),
    active: z.boolean().default(true),
    priceMinor: z.string().regex(/^\d{1,15}$/).nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/).nullable(),
    billingInterval: z.enum(["NONE", "ONE_TIME", "MONTHLY", "YEARLY"]),
    retentionDays: z.number().int().nonnegative().nullable(),
    retentionAnchor: z.enum(["EVENT_END", "GALLERY_PUBLISHED"]).nullable(),
    entitlements: z
      .array(entitlementInputSchema)
      .max(100)
      .refine(
        (entitlements) =>
          new Set(entitlements.map(({ key }) => key)).size === entitlements.length,
        { message: "Une capacité ne peut apparaître qu’une seule fois." },
      ),
  })
  .refine(
    (offer) => (offer.priceMinor === null) === (offer.currency === null),
    { message: "Le prix et la devise doivent être renseignés ensemble." },
  )
  .refine(
    (offer) =>
      (offer.context === "PLATFORM" &&
        offer.category === "DISCOVERY" &&
        offer.billingInterval === "NONE") ||
      (offer.context === "EVENT" &&
        offer.category === "EVENT" &&
        offer.billingInterval === "ONE_TIME") ||
      (offer.context === "ORGANIZATION" &&
        offer.category === "PROFESSIONAL" &&
        ["MONTHLY", "YEARLY"].includes(offer.billingInterval)),
    { message: "La catégorie, le contexte et la périodicité ne correspondent pas." },
  );

export type CommercialOfferVersionInput = z.infer<
  typeof commercialOfferVersionSchema
>;
