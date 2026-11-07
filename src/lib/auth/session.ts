import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/connexion");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { globalRole: true },
  });

  if (user?.globalRole !== "SUPER_ADMIN") {
    notFound();
  }

  return session;
}
