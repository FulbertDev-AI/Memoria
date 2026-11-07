export type OrganizationRole = "OWNER" | "ADMIN" | "EDITOR" | "PHOTOGRAPHER" | "VIEWER";

export type OrganizationPermission =
  | "organization:manage"
  | "events:manage"
  | "guests:manage"
  | "media:upload"
  | "media:moderate"
  | "gallery:view";

const rolePermissions: Record<OrganizationRole, readonly OrganizationPermission[]> = {
  OWNER: [
    "organization:manage",
    "events:manage",
    "guests:manage",
    "media:upload",
    "media:moderate",
    "gallery:view",
  ],
  ADMIN: [
    "organization:manage",
    "events:manage",
    "guests:manage",
    "media:upload",
    "media:moderate",
    "gallery:view",
  ],
  EDITOR: ["events:manage", "guests:manage", "media:upload", "media:moderate", "gallery:view"],
  PHOTOGRAPHER: ["media:upload", "gallery:view"],
  VIEWER: ["gallery:view"],
};

export function hasOrganizationPermission(
  role: string,
  permission: OrganizationPermission,
): boolean {
  return (
    Object.hasOwn(rolePermissions, role) &&
    rolePermissions[role as OrganizationRole].includes(permission)
  );
}

export function canAccessOrganization(
  member: { userId: string; status: string; role: string } | null,
  userId: string,
  permission: OrganizationPermission,
): boolean {
  return (
    member !== null &&
    member.userId === userId &&
    member.status === "ACTIVE" &&
    hasOrganizationPermission(member.role, permission)
  );
}
