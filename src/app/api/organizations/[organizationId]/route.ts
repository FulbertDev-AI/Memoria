import { NextResponse } from "next/server";
import { updateOrganizationSchema } from "@/features/organizations/schemas";
import {
  getOrganization,
  updateOrganization,
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
    return NextResponse.json(await getOrganization(session.user.id, organizationId));
  } catch (error) {
    return organizationErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  const parsed = await parseRequestBody(request, updateOrganizationSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { organizationId } = await params;
    return NextResponse.json(
      await updateOrganization(session.user.id, organizationId, parsed.data),
    );
  } catch (error) {
    return organizationErrorResponse(error);
  }
}
