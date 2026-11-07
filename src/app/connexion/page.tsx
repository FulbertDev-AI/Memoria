import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/auth-forms";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Connexion"
      description="Connectez-vous à votre compte MEMORIA pour retrouver votre espace."
      footer={
        <p>
          Vous n’avez pas encore de compte ?{" "}
          <Link className="font-semibold text-[var(--primary-strong)] hover:underline" href="/inscription">
            Créer un compte
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
