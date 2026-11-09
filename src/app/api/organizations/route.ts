import { NextResponse } from "next/server";
import {
  createOrganizationSchema,
} from "@/features/organizations/schemas";
import {
  createOrganization,
  listOrganizations,
} from "@/features/organizations/service";
import { getRequestSession } from "@/lib/auth/session";
import {
  organizationErrorResponse,
  parseRequestBody,
  unauthenticatedResponse,
} from "@/lib/http/organization-api";

export async function GET(request: Request) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  try {
    return NextResponse.json(await listOrganizations(session.user.id));
  } catch (error) {
    return organizationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getRequestSession(request.headers);
  if (!session) return unauthenticatedResponse();

  const parsed = await parseRequestBody(request, createOrganizationSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const organization = await createOrganization(session.user.id, parsed.data);
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    return organizationErrorResponse(error);
  }
}
