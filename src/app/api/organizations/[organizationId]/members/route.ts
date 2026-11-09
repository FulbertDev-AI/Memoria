import { NextResponse } from "next/server";
import {
  inviteOrganizationMemberSchema,
} from "@/features/organizations/schemas";
import {
  inviteOrganizationMember,
  listOrganizationMembers,
} from "@/features/organizations/service";
import { getRequestSession } from "@/lib/auth/session";
import {
  organizationErrorResponse,
  parseRequestBody,
  unauthenticatedResponse,
} from "@/lib/http/organization-api";

type RouteContext = { params: Promise<{ organizationId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  try {
    const { organizationId } = await params;
    return NextResponse.json(
      await listOrganizationMembers(session.user.id, organizationId),
    );
  } catch (error) {
    return organizationErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  const parsed = await parseRequestBody(request, inviteOrganizationMemberSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { organizationId } = await params;
    const invitation = await inviteOrganizationMember(
      session.user.id,
      organizationId,
      parsed.data,
    );
    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    return organizationErrorResponse(error);
  }
}
