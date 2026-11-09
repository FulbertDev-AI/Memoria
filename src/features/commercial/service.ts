import {
  BillingInterval,
  EntitlementScopeType,
  EventPlanAccessStatus,
  SubscriptionStatus,
  Prisma,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import {
  canAccessOrganization,
  type OrganizationPermission,
} from "@/features/auth/permissions";
import type { CommercialOfferVersionInput } from "@/features/commercial/schemas";

type CommercialContext =
  | { type: "USER"; userId: string }
  | { type: "EVENT"; eventId: string }
  | { type: "ORGANIZATION"; organizationId: string };

type OfferWithEntitlements = Prisma.CommercialOfferGetPayload<{
  include: { entitlements: true };
}>;

type ResolvedOffer = {
  offer: OfferWithEntitlements;
  scopeType: EntitlementScopeType;
  scopeId: string;
};

export class CommercialServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "CommercialServiceError";
  }
}

function requireOrganizationPermission(
  membership: { userId: string; role: string; status: string } | null,
  userId: string,
  permission: OrganizationPermission,
) {
  if (!canAccessOrganization(membership, userId, permission)) {
    throw new CommercialServiceError("Accès refusé à cette organisation.", 404, "NOT_FOUND");
  }
}

function snapshotOffer(offer: OfferWithEntitlements): Prisma.InputJsonObject {
  return {
    code: offer.code,
    version: offer.version,
    name: offer.name,
    category: offer.category,
    context: offer.context,
    billingInterval: offer.billingInterval,
    priceMinor: offer.priceMinor?.toString() ?? null,
    currency: offer.currency,
    retentionDays: offer.retentionDays,
    retentionAnchor: offer.retentionAnchor,
    entitlements: Object.fromEntries(
      offer.entitlements.map((entitlement) => [
        entitlement.entitlementKey,
        {
          enabled: entitlement.enabled,
          limitValue: entitlement.limitValue?.toString() ?? null,
          usageScope: entitlement.usageScope,
          value: entitlement.value ?? null,
        },
      ]),
    ),
  };
}

export async function listCommercialOffers() {
  const offers = await prisma.commercialOffer.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }, { billingInterval: "asc" }, { version: "desc" }],
    include: { entitlements: { orderBy: { entitlementKey: "asc" } } },
  });

  return offers.map((offer) => ({
    ...offer,
    priceMinor: offer.priceMinor?.toString() ?? null,
    entitlements: offer.entitlements.map((entitlement) => ({
      ...entitlement,
      limitValue: entitlement.limitValue?.toString() ?? null,
    })),
  }));
}

export async function createCommercialOfferVersion(
  actorUserId: string,
  input: CommercialOfferVersionInput,
) {
  const definitions = await prisma.entitlementDefinition.findMany({
    where: { key: { in: input.entitlements.map(({ key }) => key) } },
    select: { key: true, valueType: true },
  });
  if (definitions.length !== new Set(input.entitlements.map(({ key }) => key)).size) {
    throw new CommercialServiceError(
      "Une ou plusieurs capacités commerciales ne sont pas définies.",
      400,
      "UNKNOWN_ENTITLEMENT",
    );
  }

  const definitionTypes = new Map(definitions.map(({ key, valueType }) => [key, valueType]));
  for (const entitlement of input.entitlements) {
    if (definitionTypes.get(entitlement.key) !== entitlement.type) {
      throw new CommercialServiceError(
        `Le type de la capacité « ${entitlement.key} » ne correspond pas au catalogue.`,
        400,
        "ENTITLEMENT_TYPE_MISMATCH",
      );
    }
  }

  return prisma.$transaction(async (transaction) => {
    const actor = await transaction.user.findUnique({
      where: { id: actorUserId },
      select: { globalRole: true },
    });
    if (actor?.globalRole !== "SUPER_ADMIN") {
      throw new CommercialServiceError(
        "Seul un super administrateur peut gérer les offres.",
        403,
        "FORBIDDEN",
      );
    }

    const previous = await transaction.commercialOffer.findFirst({
      where: { code: input.code, billingInterval: input.billingInterval },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = (previous?.version ?? 0) + 1;
    if (input.active) {
      await transaction.commercialOffer.updateMany({
        where: {
          code: input.code,
          billingInterval: input.billingInterval,
          active: true,
        },
        data: { active: false },
      });
    }

    const offer = await transaction.commercialOffer.create({
      data: {
        code: input.code,
        version,
        name: input.name,
        description: input.description,
        category: input.category,
        context: input.context,
        active: input.active,
        priceMinor: input.priceMinor === null ? null : BigInt(input.priceMinor),
        currency: input.currency,
        billingInterval: input.billingInterval as BillingInterval,
        retentionDays: input.retentionDays,
        retentionAnchor: input.retentionAnchor,
        entitlements: {
          create: input.entitlements.map((entitlement) => ({
            entitlementKey: entitlement.key,
            ...(entitlement.type === "FEATURE"
              ? { enabled: entitlement.enabled }
              : entitlement.type === "QUOTA"
                ? {
                    limitValue: BigInt(entitlement.limitValue),
                    usageScope: entitlement.usageScope as EntitlementScopeType,
                  }
                : {
                    value: entitlement.value as Prisma.InputJsonObject,
                  }),
          })),
        },
      },
    });

    await transaction.commercialOfferAuditLog.create({
      data: {
        offerId: offer.id,
        actorUserId,
        action: "VERSION_CREATED",
        changes: {
          code: offer.code,
          version: offer.version,
          category: offer.category,
          context: offer.context,
          priceMinor: offer.priceMinor?.toString() ?? null,
          currency: offer.currency,
          billingInterval: offer.billingInterval,
          active: offer.active,
        },
      },
    });

    return {
      ...offer,
      priceMinor: offer.priceMinor?.toString() ?? null,
    };
  });
}

export async function requestEventOffer(
  userId: string,
  eventId: string,
  offerCode: string,
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, createdById: true, organizationId: true },
  });
  if (!event) {
    throw new CommercialServiceError("Événement introuvable.", 404, "EVENT_NOT_FOUND");
  }
  if (event.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: event.organizationId,
          userId,
        },
      },
      select: { userId: true, role: true, status: true },
    });
    requireOrganizationPermission(membership, userId, "events:manage");
  } else if (event.createdById !== userId) {
    throw new CommercialServiceError("Événement introuvable.", 404, "EVENT_NOT_FOUND");
  }

  const offer = await prisma.commercialOffer.findFirst({
    where: {
      code: offerCode,
      context: "EVENT",
      billingInterval: "ONE_TIME",
      active: true,
    },
    orderBy: { version: "desc" },
    include: { entitlements: true },
  });
  if (!offer) {
    throw new CommercialServiceError("Forfait événementiel introuvable.", 404, "OFFER_NOT_FOUND");
  }

  return prisma.eventPlanPurchase.create({
    data: {
      eventId,
      offerId: offer.id,
      offerVersion: offer.version,
      status: EventPlanAccessStatus.PENDING,
      rulesSnapshot: snapshotOffer(offer),
      retentionDays: offer.retentionDays,
      retentionAnchor: offer.retentionAnchor,
    },
    select: { id: true, eventId: true, offerId: true, offerVersion: true, status: true },
  });
}

export async function requestOrganizationSubscription(
  userId: string,
  organizationId: string,
  offerCode: string,
  billingInterval: "MONTHLY" | "YEARLY",
) {
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { userId: true, role: true, status: true },
  });
  requireOrganizationPermission(membership, userId, "organization:manage");

  const offer = await prisma.commercialOffer.findFirst({
    where: {
      code: offerCode,
      context: "ORGANIZATION",
      billingInterval,
      active: true,
    },
    orderBy: { version: "desc" },
    include: { entitlements: true },
  });
  if (!offer) {
    throw new CommercialServiceError("Abonnement professionnel introuvable.", 404, "OFFER_NOT_FOUND");
  }

  return prisma.organizationSubscription.create({
    data: {
      organizationId,
      offerId: offer.id,
      offerVersion: offer.version,
      billingInterval,
      status: SubscriptionStatus.PENDING,
      rulesSnapshot: snapshotOffer(offer),
    },
    select: {
      id: true,
      organizationId: true,
      offerId: true,
      offerVersion: true,
      billingInterval: true,
      status: true,
    },
  });
}

async function findPlatformOffer(code: string): Promise<OfferWithEntitlements | null> {
  return prisma.commercialOffer.findFirst({
    where: { code, context: "PLATFORM", active: true },
    orderBy: { version: "desc" },
    include: { entitlements: true },
  });
}

async function resolveOffer(context: CommercialContext): Promise<ResolvedOffer | null> {
  const now = new Date();
  if (context.type === "USER") {
    const offer = await findPlatformOffer("DISCOVERY");
    return offer ? { offer, scopeType: EntitlementScopeType.USER, scopeId: context.userId } : null;
  }

  if (context.type === "ORGANIZATION") {
    const subscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId: context.organizationId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      include: { offer: { include: { entitlements: true } } },
    });
    return subscription
      ? {
          offer: subscription.offer,
          scopeType: EntitlementScopeType.ORGANIZATION,
          scopeId: context.organizationId,
        }
      : null;
  }

  const event = await prisma.event.findUnique({
    where: { id: context.eventId },
    select: { id: true, createdById: true, organizationId: true },
  });
  if (!event) {
    throw new CommercialServiceError("Événement introuvable.", 404, "EVENT_NOT_FOUND");
  }

  const purchase = await prisma.eventPlanPurchase.findFirst({
    where: {
      eventId: context.eventId,
      status: EventPlanAccessStatus.ACTIVE,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
    },
    orderBy: [{ activatedAt: "desc" }, { createdAt: "desc" }],
    include: { offer: { include: { entitlements: true } } },
  });
  if (purchase) {
    return {
      offer: purchase.offer,
      scopeType: EntitlementScopeType.EVENT,
      scopeId: event.id,
    };
  }

  if (event.organizationId) {
    const organizationOffer = await resolveOffer({
      type: "ORGANIZATION",
      organizationId: event.organizationId,
    });
    if (organizationOffer) return organizationOffer;
  }

  const freeOffer = await findPlatformOffer("DISCOVERY");
  return freeOffer
    ? {
        offer: freeOffer,
        scopeType: EntitlementScopeType.USER,
        scopeId: event.createdById,
      }
    : null;
}

function scopeIdFor(
  context: CommercialContext,
  scopeType: EntitlementScopeType,
  resolved: ResolvedOffer,
): string {
  if (scopeType === resolved.scopeType) return resolved.scopeId;
  if (context.type === "EVENT") {
    if (scopeType === EntitlementScopeType.EVENT) return context.eventId;
    throw new CommercialServiceError(
      "La portée configurée pour ce quota ne correspond pas au contexte de l’événement.",
      500,
      "INVALID_ENTITLEMENT_SCOPE",
    );
  }
  if (context.type === "ORGANIZATION" && scopeType === EntitlementScopeType.ORGANIZATION) {
    return context.organizationId;
  }
  if (context.type === "USER" && scopeType === EntitlementScopeType.USER) {
    return context.userId;
  }
  throw new CommercialServiceError(
    "La portée configurée pour ce quota ne correspond pas au contexte commercial.",
    500,
    "INVALID_ENTITLEMENT_SCOPE",
  );
}

export async function evaluateCommercialEntitlement(
  context: CommercialContext,
  entitlementKey: string,
) {
  const resolved = await resolveOffer(context);
  const entitlement = resolved?.offer.entitlements.find(
    (item) => item.entitlementKey === entitlementKey,
  );
  if (!resolved || !entitlement) {
    return {
      allowed: false,
      reason: "NOT_INCLUDED" as const,
      offerCode: resolved?.offer.code ?? null,
      limit: null,
      used: BigInt(0),
      remaining: null,
    };
  }

  if (entitlement.enabled !== null) {
    return {
      allowed: entitlement.enabled,
      reason: entitlement.enabled ? ("ALLOWED" as const) : ("NOT_INCLUDED" as const),
      offerCode: resolved.offer.code,
      limit: null,
      used: BigInt(0),
      remaining: null,
    };
  }

  if (entitlement.limitValue !== null) {
    if (!entitlement.usageScope) {
      throw new CommercialServiceError(
        "La portée de consommation du quota n’est pas configurée.",
        500,
        "INVALID_ENTITLEMENT_SCOPE",
      );
    }
    const scopeType = entitlement.usageScope;
    const scopeId = scopeIdFor(context, scopeType, resolved);
    const usage = await prisma.entitlementUsage.findUnique({
      where: {
        scopeType_scopeId_entitlementKey: {
          scopeType,
          scopeId,
          entitlementKey,
        },
      },
      select: { used: true },
    });
    const used = usage?.used ?? BigInt(0);
    const remaining = entitlement.limitValue - used;
    return {
      allowed: remaining > BigInt(0),
      reason:
        remaining > BigInt(0) ? ("ALLOWED" as const) : ("QUOTA_EXCEEDED" as const),
      offerCode: resolved.offer.code,
      limit: entitlement.limitValue,
      used,
      remaining: remaining > BigInt(0) ? remaining : BigInt(0),
    };
  }

  return {
    allowed: true,
    reason: "ALLOWED" as const,
    offerCode: resolved.offer.code,
    limit: null,
    used: BigInt(0),
    remaining: null,
    value: entitlement.value,
  };
}

export async function requireCommercialFeature(
  context: CommercialContext,
  entitlementKey: string,
) {
  const result = await evaluateCommercialEntitlement(context, entitlementKey);
  if (!result.allowed) {
    throw new CommercialServiceError(
      result.reason === "QUOTA_EXCEEDED"
        ? "Le quota de cette offre est atteint."
        : "Cette fonctionnalité n’est pas incluse dans l’offre active.",
      403,
      result.reason,
    );
  }
}

export async function consumeCommercialQuota(
  context: CommercialContext,
  entitlementKey: string,
  amount: bigint,
) {
  if (amount <= BigInt(0)) {
    throw new CommercialServiceError(
      "La quantité consommée doit être supérieure à zéro.",
      400,
      "INVALID_QUOTA_AMOUNT",
    );
  }

  const resolved = await resolveOffer(context);
  const entitlement = resolved?.offer.entitlements.find(
    (item) => item.entitlementKey === entitlementKey,
  );
  if (
    !resolved ||
    !entitlement ||
    entitlement.enabled !== null ||
    !entitlement.usageScope
  ) {
    throw new CommercialServiceError(
      "Aucun quota actif n’est configuré pour cette capacité.",
      403,
      "QUOTA_NOT_CONFIGURED",
    );
  }

  if (entitlement.limitValue === null) {
    return evaluateCommercialEntitlement(context, entitlementKey);
  }

  const scopeType = entitlement.usageScope;
  const scopeId = scopeIdFor(context, scopeType, resolved);
  const changedRows = await prisma.$executeRaw`
    INSERT INTO "EntitlementUsage"
      ("id", "scopeType", "scopeId", "entitlementKey", "used", "createdAt", "updatedAt")
    VALUES
    (${`usage_${randomUUID()}`}, ${scopeType}::"EntitlementScopeType",
       ${scopeId}, ${entitlementKey}, ${amount}, NOW(), NOW())
    ON CONFLICT ("scopeType", "scopeId", "entitlementKey")
    DO UPDATE SET
      "used" = "EntitlementUsage"."used" + EXCLUDED."used",
      "updatedAt" = NOW()
    WHERE "EntitlementUsage"."used" + EXCLUDED."used" <= ${entitlement.limitValue}
  `;

  if (changedRows !== 1) {
    throw new CommercialServiceError(
      "Le quota de cette offre est atteint.",
      403,
      "QUOTA_EXCEEDED",
    );
  }

  return evaluateCommercialEntitlement(context, entitlementKey);
}

export function isCommercialContext(value: unknown): value is CommercialContext {
  if (!value || typeof value !== "object") return false;
  const context = value as Record<string, unknown>;
  if (context.type === "USER") return typeof context.userId === "string";
  if (context.type === "EVENT") return typeof context.eventId === "string";
  if (context.type === "ORGANIZATION") return typeof context.organizationId === "string";
  return false;
}
