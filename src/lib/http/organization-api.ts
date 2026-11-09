import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { OrganizationServiceError } from "@/features/organizations/service";

export async function parseRequestBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      response: NextResponse.json({ error: "Le corps JSON est invalide." }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      response: NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Les données sont invalides." },
        { status: 400 },
      ),
    };
  }
  return { data: parsed.data };
}

export function organizationErrorResponse(error: unknown): NextResponse {
  if (error instanceof OrganizationServiceError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  console.error("Erreur inattendue dans l’API organisations :", error);
  return NextResponse.json(
    { error: "Une erreur interne est survenue." },
    { status: 500 },
  );
}

export function unauthenticatedResponse(): NextResponse {
  return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
}
