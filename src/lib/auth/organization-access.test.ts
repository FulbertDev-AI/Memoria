import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    organizationMember: { findUnique },
  },
}));

import { userCanAccessOrganization } from "@/lib/auth/organization-access";

describe("organization data isolation", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("queries membership by both the authenticated user and target organization", async () => {
    findUnique.mockResolvedValue({
      userId: "user-1",
      role: "OWNER",
      status: "ACTIVE",
    });

    await expect(
      userCanAccessOrganization("user-1", "organization-1", "events:manage"),
    ).resolves.toBe(true);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        organizationId_userId: {
          organizationId: "organization-1",
          userId: "user-1",
        },
      },
      select: { userId: true, role: true, status: true },
    });
  });

  it("denies access when a membership for another organization is not found", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      userCanAccessOrganization("user-1", "organization-2", "events:manage"),
    ).resolves.toBe(false);
  });
});
