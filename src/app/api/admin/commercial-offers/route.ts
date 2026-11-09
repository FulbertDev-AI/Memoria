import { NextResponse } from "next/server";
import {
  commercialOfferVersionSchema,
} from "@/features/commercial/schemas";
import {
  CommercialServiceError,
  createCommercialOfferVersion,
  listCommercialOffers,
} from "@/features/commercial/service";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  parseRequestBody,
  unauthenticatedResponse,
} from "@/lib/http/organization-api";

async function authorizeAdministrator(request: Request) {
  const session = await getRequestSession(request.headers);
  if (!session) return { response: unauthenticatedResponse() } as const;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { globalRole: true },
  });
  if (user?.globalRole !== "SUPER_ADMIN") {
    return {
      response: NextResponse.json({ error: "Accès réservé à l’administration." }, { status: 403 }),
    } as const;
  }
  return { userId: session.user.id } as const;
}

function errorResponse(error: unknown) {
  if (error instanceof CommercialServiceError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  console.error("Erreur inattendue dans l’API du catalogue commercial :", error);
  return NextResponse.json(
    { error: "Une erreur interne est survenue." },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  const authorization = await authorizeAdministrator(request);
  if ("response" in authorization) return authorization.response;

  try {
    return NextResponse.json(await listCommercialOffers());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdministrator(request);
  if ("response" in authorization) return authorization.response;

  const parsed = await parseRequestBody(request, commercialOfferVersionSchema);
  if ("response" in parsed) return parsed.response;

  try {
    return NextResponse.json(
      await createCommercialOfferVersion(authorization.userId, parsed.data),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
