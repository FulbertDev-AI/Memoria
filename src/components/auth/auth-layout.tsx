import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-7 shadow-[0_16px_48px_rgba(32,33,36,0.07)] sm:p-9">
        <Link href="/" aria-label="Retour à l’accueil MEMORIA" className="inline-block">
          <Image
            src="/brand/memoria-logo.webp"
            alt="MEMORIA"
            width={200}
            height={48}
            priority
            className="h-10 w-[168px] object-contain object-left"
          />
        </Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#202124]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#202124]/65">{description}</p>
        <div className="mt-7">{children}</div>
        <div className="mt-7 border-t border-[var(--border)] pt-5 text-sm text-[#202124]/65">
          {footer}
        </div>
      </section>
    </main>
  );
}
