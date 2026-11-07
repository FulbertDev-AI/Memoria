import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import {
  canAccessOrganization,
  type OrganizationPermission,
} from "@/features/auth/permissions";

export async function userCanAccessOrganization(
  userId: string,
  organizationId: string,
  permission: OrganizationPermission,
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    select: { userId: true, role: true, status: true },
  });

  return canAccessOrganization(membership, userId, permission);
}

export async function requireOrganizationPermission(
  organizationId: string,
  permission: OrganizationPermission,
) {
  const { user } = await requireUser();
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId: user.id },
    },
    select: { userId: true, role: true, status: true },
  });

  if (!canAccessOrganization(membership, user.id, permission)) {
    notFound();
  }

  return membership;
}
