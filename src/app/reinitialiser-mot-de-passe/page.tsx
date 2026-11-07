import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      description="Choisissez un nouveau mot de passe pour sécuriser votre compte."
      footer={
        <Link className="font-semibold text-[var(--primary-strong)] hover:underline" href="/connexion">
          Retour à la connexion
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
