import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Définissez SEED_ADMIN_EMAIL pour promouvoir le compte administrateur.",
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      "Le compte administrateur doit d’abord être créé et son adresse e-mail vérifiée.",
    );
  }
  if (!user.emailVerified) {
    throw new Error(
      "L’adresse e-mail du compte administrateur doit être vérifiée avant sa promotion.",
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { globalRole: "SUPER_ADMIN" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    console.error("Échec du seed administrateur :", error);
    process.exitCode = 1;
  });
