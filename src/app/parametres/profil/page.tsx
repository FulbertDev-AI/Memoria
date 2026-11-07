import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ProfileForm } from "@/components/auth/auth-forms";
import { requireUser } from "@/lib/auth/session";
import { getAccountTypeLabel } from "@/features/auth/schemas";

export default async function ProfilePage() {
  const { user } = await requireUser();

  return (
    <AuthLayout
      title="Mon profil"
      description="Modifiez les informations de base associées à votre compte."
      footer={
        <Link className="font-semibold text-[var(--primary-strong)] hover:underline" href="/dashboard">
          Retour à mon espace
        </Link>
      }
    >
      <ProfileForm initialName={user.name} />
      <dl className="mt-7 space-y-3 border-t border-[var(--border)] pt-5 text-sm">
        <div>
          <dt className="text-[#202124]/55">Adresse e-mail</dt>
          <dd className="mt-1 font-medium text-[#202124]">{user.email}</dd>
        </div>
        <div>
          <dt className="text-[#202124]/55">Type d’utilisation</dt>
          <dd className="mt-1 font-medium text-[#202124]">{getAccountTypeLabel(user.accountType)}</dd>
        </div>
      </dl>
    </AuthLayout>
  );
}
