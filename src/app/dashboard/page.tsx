import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/auth-forms";
import { getAccountTypeLabel } from "@/features/auth/schemas";

export default async function DashboardPage() {
  const { user } = await requireUser();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <Link href="/" aria-label="MEMORIA, accueil">
            <Image
              src="/brand/memoria-logo.webp"
              alt="MEMORIA"
              width={200}
              height={48}
              priority
              className="h-10 w-[168px] object-contain object-left"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#202124] hover:border-[var(--primary)]"
              href="/parametres/profil"
            >
              Mon profil
            </Link>
            <SignOutButton />
          </div>
        </header>

        <section className="py-12">
          <p className="text-sm font-medium text-[#202124]/60">Espace personnel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#202124]">
            Bonjour {user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#202124]/65">
            Votre compte MEMORIA est prêt. Les outils de gestion d’événements seront disponibles dans une prochaine étape du projet.
          </p>
          <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#202124]">Votre profil</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-[#202124]/55">Adresse e-mail</dt>
                <dd className="mt-1 font-medium text-[#202124]">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#202124]/55">Type d’utilisation</dt>
                <dd className="mt-1 font-medium text-[#202124]">{getAccountTypeLabel(user.accountType)}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
