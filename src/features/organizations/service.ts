import { createHash, randomBytes } from "node:crypto";
import {
  OrganizationInvitationStatus,
  OrganizationMemberStatus,
  OrganizationRole,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  canAccessOrganization,
  hasOrganizationPermission,
  type OrganizationPermission,
} from "@/features/auth/permissions";
import type {
  InviteableOrganizationRole,
  createOrganizationSchema,
  inviteOrganizationMemberSchema,
  updateOrganizationSchema,
} from "@/features/organizations/schemas";

type CreateOrganizationInput = ReturnType<typeof createOrganizationSchema.parse>;
type UpdateOrganizationInput = ReturnType<typeof updateOrganizationSchema.parse>;
type InviteMemberInput = ReturnType<typeof inviteOrganizationMemberSchema.parse>;

export class OrganizationServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "OrganizationServiceError";
  }
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function assertPermission(
  membership: { userId: string; role: string; status: string } | null,
  userId: string,
  permission: OrganizationPermission,
): asserts membership is { userId: string; role: string; status: string } {
  if (!canAccessOrganization(membership, userId, permission)) {
    throw new OrganizationServiceError("Accès refusé à cette organisation.", 404, "NOT_FOUND");
  }
}

async function getMembership(userId: string, organizationId: string) {
  return prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { id: true, userId: true, role: true, status: true },
  });
}

export async function listOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: OrganizationMemberStatus.ACTIVE },
    select: {
      role: true,
      organization: {
        select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map(({ role, organization }) => ({ ...organization, role }));
}

export async function createOrganization(userId: string, input: CreateOrganizationInput) {
  const baseSlug = slugify(input.slug ?? input.name) || "organisation";
  const slug = `${baseSlug.slice(0, 70)}-${randomBytes(4).toString("hex")}`;

  return prisma.$transaction(async (transaction) => {
    const organization = await transaction.organization.create({
      data: { name: input.name, slug, createdById: userId },
    });
    await transaction.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: OrganizationRole.OWNER,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
    return organization;
  });
}

export async function getOrganization(userId: string, organizationId: string) {
  const membership = await getMembership(userId, organizationId);
  assertPermission(membership, userId, "gallery:view");

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
  });
  if (!organization) {
    throw new OrganizationServiceError("Organisation introuvable.", 404, "NOT_FOUND");
  }
  return { ...organization, role: membership.role };
}

export async function updateOrganization(
  userId: string,
  organizationId: string,
  input: UpdateOrganizationInput,
) {
  const membership = await getMembership(userId, organizationId);
  assertPermission(membership, userId, "organization:manage");

  const data: Prisma.OrganizationUpdateInput = {
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.slug === undefined
      ? {}
      : { slug: `${slugify(input.slug).slice(0, 70)}-${randomBytes(4).toString("hex")}` }),
  };

  try {
    return await prisma.organization.update({
      where: { id: organizationId },
      data,
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new OrganizationServiceError("Organisation introuvable.", 404, "NOT_FOUND");
    }
    throw error;
  }
}

export async function listOrganizationMembers(userId: string, organizationId: string) {
  const membership = await getMembership(userId, organizationId);
  assertPermission(membership, userId, "gallery:view");

  return prisma.organizationMember.findMany({
    where: { organizationId },
    select: {
      id: true,
      userId: true,
      role: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteOrganizationMember(
  userId: string,
  organizationId: string,
  input: InviteMemberInput,
) {
  const membership = await getMembership(userId, organizationId);
  assertPermission(membership, userId, "organization:manage");

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (user) {
    const existing = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: user.id } },
      select: { status: true },
    });
    if (existing?.status === OrganizationMemberStatus.ACTIVE) {
      throw new OrganizationServiceError(
        "Cette personne est déjà membre de l’organisation.",
        409,
        "ALREADY_MEMBER",
      );
    }
  }

  const token = randomBytes(32).toString("base64url");
  const invitation = await prisma.$transaction(async (transaction) => {
    await transaction.organizationInvitation.updateMany({
      where: {
        organizationId,
        email: input.email,
        status: OrganizationInvitationStatus.PENDING,
      },
      data: { status: OrganizationInvitationStatus.REVOKED },
    });
    return transaction.organizationInvitation.create({
      data: {
        organizationId,
        email: input.email,
        role: input.role as OrganizationRole,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedById: userId,
      },
      include: { organization: { select: { name: true } } },
    });
  });

  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: OrganizationInvitationStatus.REVOKED },
    });
    throw new OrganizationServiceError(
      "Le service d’invitation n’est pas configuré.",
      503,
      "EMAIL_NOT_CONFIGURED",
    );
  }

  try {
    const { sendOrganizationInvitationEmail } = await import("@/lib/email/auth-email");
    await sendOrganizationInvitationEmail({
      email: input.email,
      organizationName: invitation.organization.name,
      url: `${appUrl}/api/organization-invitations/${token}`,
    });
  } catch (error) {
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: OrganizationInvitationStatus.REVOKED },
    });
    throw error;
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
}

export async function updateOrganizationMemberRole(
  userId: string,
  organizationId: string,
  memberUserId: string,
  role: InviteableOrganizationRole,
) {
  const actor = await getMembership(userId, organizationId);
  assertPermission(actor, userId, "organization:manage");

  const target = await getMembership(memberUserId, organizationId);
  if (!target || target.status !== OrganizationMemberStatus.ACTIVE) {
    throw new OrganizationServiceError("Membre introuvable.", 404, "NOT_FOUND");
  }
  if (
    target.role === OrganizationRole.OWNER ||
    (role !== target.role &&
      actor.role !== OrganizationRole.OWNER &&
      target.role === OrganizationRole.ADMIN)
  ) {
    throw new OrganizationServiceError(
      "Seul le propriétaire peut modifier les rôles d’administration.",
      403,
      "ROLE_CHANGE_FORBIDDEN",
    );
  }

  return prisma.organizationMember.update({
    where: { organizationId_userId: { organizationId, userId: memberUserId } },
    data: { role },
    select: { id: true, userId: true, role: true, status: true, updatedAt: true },
  });
}

export async function removeOrganizationMember(
  userId: string,
  organizationId: string,
  memberUserId: string,
) {
  const actor = await getMembership(userId, organizationId);
  assertPermission(actor, userId, "organization:manage");

  if (userId === memberUserId) {
    throw new OrganizationServiceError(
      "Un membre ne peut pas se retirer lui-même depuis cette action.",
      409,
      "SELF_REMOVAL_FORBIDDEN",
    );
  }

  const target = await getMembership(memberUserId, organizationId);
  if (!target || target.status !== OrganizationMemberStatus.ACTIVE) {
    throw new OrganizationServiceError("Membre introuvable.", 404, "NOT_FOUND");
  }
  if (
    target.role === OrganizationRole.OWNER ||
    (target.role === OrganizationRole.ADMIN && actor.role !== OrganizationRole.OWNER)
  ) {
    throw new OrganizationServiceError(
      "Ce membre ne peut pas être retiré avec votre rôle actuel.",
      403,
      "MEMBER_REMOVAL_FORBIDDEN",
    );
  }

  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId, userId: memberUserId } },
  });
  return { removed: true };
}

export async function respondToOrganizationInvitation(
  user: { id: string; email: string; emailVerified: boolean },
  token: string,
  decision: "accept" | "decline",
) {
  if (!user.emailVerified) {
    throw new OrganizationServiceError(
      "Vérifiez votre adresse e-mail avant d’accepter une invitation.",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  const invitation = await prisma.organizationInvitation.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, organizationId: true, email: true, role: true, status: true, expiresAt: true },
  });
  if (!invitation || invitation.email !== user.email.toLowerCase()) {
    throw new OrganizationServiceError(
      "Cette invitation est invalide ou expirée.",
      404,
      "INVITATION_NOT_FOUND",
    );
  }
  if (invitation.status !== OrganizationInvitationStatus.PENDING) {
    throw new OrganizationServiceError(
      "Cette invitation a déjà été utilisée.",
      409,
      "INVITATION_ALREADY_USED",
    );
  }
  if (invitation.expiresAt <= new Date()) {
    throw new OrganizationServiceError(
      "Cette invitation est invalide ou expirée.",
      404,
      "INVITATION_NOT_FOUND",
    );
  }

  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.organizationInvitation.updateMany({
      where: {
        id: invitation.id,
        status: OrganizationInvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      data:
        decision === "accept"
          ? {
              status: OrganizationInvitationStatus.ACCEPTED,
              acceptedAt: new Date(),
            }
          : {
              status: OrganizationInvitationStatus.DECLINED,
              declinedAt: new Date(),
            },
    });
    if (updated.count !== 1) {
      throw new OrganizationServiceError(
        "Cette invitation a déjà été utilisée ou a expiré.",
        409,
        "INVITATION_ALREADY_USED",
      );
    }

    if (decision === "decline") {
      return { accepted: false };
    }

    await transaction.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: invitation.organizationId, userId: user.id } },
      create: {
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.role,
        status: OrganizationMemberStatus.ACTIVE,
      },
      update: {
        role: invitation.role,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
    return { accepted: true, organizationId: invitation.organizationId };
  });
}

export function hasOrganizationManagementPermission(
  role: string,
): boolean {
  return hasOrganizationPermission(role, "organization:manage");
}
