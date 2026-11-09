-- CreateEnum
CREATE TYPE "OrganizationInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateEnum
CREATE TYPE "OfferCategory" AS ENUM ('DISCOVERY', 'EVENT', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "OfferContext" AS ENUM ('PLATFORM', 'EVENT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('NONE', 'ONE_TIME', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "EntitlementValueType" AS ENUM ('FEATURE', 'QUOTA', 'VALUE');

-- CreateEnum
CREATE TYPE "EventPlanAccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REVOKED');

-- CreateEnum
CREATE TYPE "EventPlanAccessSource" AS ENUM ('ADMIN_GRANT', 'PROVIDER_CONFIRMED');

-- CreateEnum
CREATE TYPE "RetentionAnchor" AS ENUM ('EVENT_END', 'GALLERY_PUBLISHED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PENDING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EntitlementScopeType" AS ENUM ('USER', 'EVENT', 'ORGANIZATION');

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "status" "OrganizationInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialOffer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "OfferCategory" NOT NULL,
    "context" "OfferContext" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priceMinor" BIGINT,
    "currency" CHAR(3),
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'NONE',
    "retentionDays" INTEGER,
    "retentionAnchor" "RetentionAnchor",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementDefinition" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "valueType" "EntitlementValueType" NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntitlementDefinition_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "OfferEntitlement" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "entitlementKey" TEXT NOT NULL,
    "enabled" BOOLEAN,
    "limitValue" BIGINT,
    "usageScope" "EntitlementScopeType",
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPlanPurchase" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerVersion" INTEGER NOT NULL,
    "status" "EventPlanAccessStatus" NOT NULL DEFAULT 'PENDING',
    "source" "EventPlanAccessSource",
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "rulesSnapshot" JSONB NOT NULL,
    "retentionDays" INTEGER,
    "retentionAnchor" "RetentionAnchor",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPlanPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialOfferAuditLog" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommercialOfferAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSubscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerVersion" INTEGER NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "rulesSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementUsage" (
    "id" TEXT NOT NULL,
    "scopeType" "EntitlementScopeType" NOT NULL,
    "scopeId" TEXT NOT NULL,
    "entitlementKey" TEXT NOT NULL,
    "used" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntitlementUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_email_status_idx" ON "OrganizationInvitation"("organizationId", "email", "status");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_expiresAt_status_idx" ON "OrganizationInvitation"("expiresAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "CommercialOffer_context_active_idx" ON "CommercialOffer"("context", "active");

-- CreateIndex
CREATE INDEX "CommercialOffer_category_active_idx" ON "CommercialOffer"("category", "active");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialOffer_code_version_billingInterval_key" ON "CommercialOffer"("code", "version", "billingInterval");

-- CreateIndex
CREATE INDEX "OfferEntitlement_entitlementKey_idx" ON "OfferEntitlement"("entitlementKey");

-- CreateIndex
CREATE UNIQUE INDEX "OfferEntitlement_offerId_entitlementKey_key" ON "OfferEntitlement"("offerId", "entitlementKey");

-- CreateIndex
CREATE INDEX "EventPlanPurchase_eventId_status_startsAt_endsAt_idx" ON "EventPlanPurchase"("eventId", "status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "EventPlanPurchase_offerId_offerVersion_idx" ON "EventPlanPurchase"("offerId", "offerVersion");

-- CreateIndex
CREATE INDEX "CommercialOfferAuditLog_offerId_createdAt_idx" ON "CommercialOfferAuditLog"("offerId", "createdAt");

-- CreateIndex
CREATE INDEX "CommercialOfferAuditLog_actorUserId_createdAt_idx" ON "CommercialOfferAuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationSubscription_organizationId_status_startsAt_end_idx" ON "OrganizationSubscription"("organizationId", "status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "OrganizationSubscription_offerId_offerVersion_idx" ON "OrganizationSubscription"("offerId", "offerVersion");

-- CreateIndex
CREATE INDEX "EntitlementUsage_entitlementKey_scopeType_idx" ON "EntitlementUsage"("entitlementKey", "scopeType");

-- CreateIndex
CREATE UNIQUE INDEX "EntitlementUsage_scopeType_scopeId_entitlementKey_key" ON "EntitlementUsage"("scopeType", "scopeId", "entitlementKey");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_status_role_idx" ON "OrganizationMember"("organizationId", "status", "role");

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferEntitlement" ADD CONSTRAINT "OfferEntitlement_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CommercialOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferEntitlement" ADD CONSTRAINT "OfferEntitlement_entitlementKey_fkey" FOREIGN KEY ("entitlementKey") REFERENCES "EntitlementDefinition"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlanPurchase" ADD CONSTRAINT "EventPlanPurchase_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlanPurchase" ADD CONSTRAINT "EventPlanPurchase_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CommercialOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialOfferAuditLog" ADD CONSTRAINT "CommercialOfferAuditLog_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CommercialOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialOfferAuditLog" ADD CONSTRAINT "CommercialOfferAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CommercialOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementUsage" ADD CONSTRAINT "EntitlementUsage_entitlementKey_fkey" FOREIGN KEY ("entitlementKey") REFERENCES "EntitlementDefinition"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
