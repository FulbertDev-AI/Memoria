import { NextResponse } from "next/server";
import { updateOrganizationMemberSchema } from "@/features/organizations/schemas";
import {
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/features/organizations/service";
import { getRequestSession } from "@/lib/auth/session";
import {
  organizationErrorResponse,
  parseRequestBody,
  unauthenticatedResponse,
} from "@/lib/http/organization-api";

type RouteContext = {
  params: Promise<{ organizationId: string; memberUserId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  const parsed = await parseRequestBody(request, updateOrganizationMemberSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { organizationId, memberUserId } = await params;
    return NextResponse.json(
      await updateOrganizationMemberRole(
        session.user.id,
        organizationId,
        memberUserId,
        parsed.data.role,
      ),
    );
  } catch (error) {
    return organizationErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  try {
    const { organizationId, memberUserId } = await params;
    return NextResponse.json(
      await removeOrganizationMember(session.user.id, organizationId, memberUserId),
    );
  } catch (error) {
    return organizationErrorResponse(error);
  }
}
