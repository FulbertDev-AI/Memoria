import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Indiquez l’adresse e-mail associée à votre compte. Si un compte existe, nous vous enverrons un lien sécurisé."
      footer={
        <Link className="font-semibold text-[var(--primary-strong)] hover:underline" href="/connexion">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
