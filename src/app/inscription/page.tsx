import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/auth-forms";
import { brand } from "@/config/brand";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      description={`Créez votre espace ${brand.name} avec les informations essentielles. Vous pourrez compléter votre profil plus tard.`}
      footer={
        <p>
          Vous avez déjà un compte ?{" "}
          <Link className="font-semibold text-[var(--primary-strong)] hover:underline" href="/connexion">
            Se connecter
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
