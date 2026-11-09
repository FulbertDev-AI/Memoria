import { NextResponse } from "next/server";
import { respondToInvitationSchema } from "@/features/organizations/schemas";
import { respondToOrganizationInvitation } from "@/features/organizations/service";
import { getRequestSession } from "@/lib/auth/session";
import {
  organizationErrorResponse,
  parseRequestBody,
  unauthenticatedResponse,
} from "@/lib/http/organization-api";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  const parsed = await parseRequestBody(request, respondToInvitationSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { token } = await params;
    const result = await respondToOrganizationInvitation(
      {
        id: session.user.id,
        email: session.user.email.toLowerCase(),
        emailVerified: session.user.emailVerified,
      },
      token,
      parsed.data.decision,
    );
    return NextResponse.json(result);
  } catch (error) {
    return organizationErrorResponse(error);
  }
}
