import { describe, expect, it } from "vitest";
import {
  canAccessOrganization,
  hasOrganizationPermission,
} from "@/features/auth/permissions";

describe("organization permissions", () => {
  it("allows photographers to upload media but not manage guests", () => {
    expect(hasOrganizationPermission("PHOTOGRAPHER", "media:upload")).toBe(true);
    expect(hasOrganizationPermission("PHOTOGRAPHER", "guests:manage")).toBe(false);
  });

  it("denies unknown roles and permissions", () => {
    expect(hasOrganizationPermission("SUPER_ADMIN", "gallery:view")).toBe(false);
  });

  it("requires an active membership matching the current user", () => {
    const member = { userId: "user-1", role: "OWNER", status: "ACTIVE" };
    expect(canAccessOrganization(member, "user-1", "events:manage")).toBe(true);
    expect(canAccessOrganization(member, "user-2", "events:manage")).toBe(false);
    expect(
      canAccessOrganization({ ...member, status: "SUSPENDED" }, "user-1", "events:manage"),
    ).toBe(false);
    expect(canAccessOrganization(null, "user-1", "events:manage")).toBe(false);
  });
});
