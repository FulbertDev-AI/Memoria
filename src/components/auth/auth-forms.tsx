"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  accountTypes,
  accountTypeLabels,
  emailSchema,
  profileSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";
import { authClient } from "@/lib/auth/auth-client";

const fieldClassName =
  "mt-2 block w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-3 text-sm text-[#202124] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(244,119,33,0.16)]";

const submitClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60";

function FormFeedback({
  error,
  success,
}: {
  error: string | null;
  success: string | null;
}) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
        {success}
      </p>
    );
  }
  return null;
}

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      accountType: formData.get("accountType"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        ...parsed.data,
        callbackURL: "/dashboard",
      });

      if (authError) {
        setError(authError.message || "La création du compte a échoué.");
      } else {
        setSuccess(
          "Votre compte a été créé. Consultez votre boîte e-mail pour vérifier votre adresse avant de vous connecter.",
        );
      }
    } catch {
      setError("Le service d’inscription est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-medium text-[#202124]">
        Nom complet
        <input
          autoComplete="name"
          className={fieldClassName}
          maxLength={100}
          minLength={2}
          name="name"
          required
        />
      </label>
      <label className="block text-sm font-medium text-[#202124]">
        Adresse e-mail
        <input
          autoComplete="email"
          className={fieldClassName}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-[#202124]">
        Mot de passe
        <input
          autoComplete="new-password"
          className={fieldClassName}
          minLength={12}
          maxLength={128}
          name="password"
          required
          type="password"
        />
        <span className="mt-1.5 block text-xs font-normal text-[#202124]/55">
          12 caractères minimum.
        </span>
      </label>
      <label className="block text-sm font-medium text-[#202124]">
        Type d’utilisation
        <select className={fieldClassName} defaultValue="" name="accountType" required>
          <option disabled value="">
            Sélectionnez une option
          </option>
          {accountTypes.map((accountType) => (
            <option key={accountType} value={accountType}>
              {accountTypeLabels[accountType]}
            </option>
          ))}
        </select>
      </label>
      <FormFeedback error={error} success={success} />
      <button className={submitClassName} disabled={pending} type="submit">
        {pending ? "Création en cours…" : "Créer mon compte"}
      </button>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await authClient.signIn.email({
        ...parsed.data,
        callbackURL: "/dashboard",
      });

      if (authError) {
        setError(authError.message || "Connexion impossible. Vérifiez vos identifiants.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Le service de connexion est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-medium text-[#202124]">
        Adresse e-mail
        <input
          autoComplete="email"
          className={fieldClassName}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-[#202124]">
        Mot de passe
        <input
          autoComplete="current-password"
          className={fieldClassName}
          name="password"
          required
          type="password"
        />
      </label>
      <div className="flex justify-end">
        <Link className="text-sm font-medium text-[var(--primary-strong)] hover:underline" href="/mot-de-passe-oublie">
          Mot de passe oublié ?
        </Link>
      </div>
      <FormFeedback error={error} success={null} />
      <button className={submitClassName} disabled={pending} type="submit">
        {pending ? "Connexion en cours…" : "Se connecter"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const parsedEmail = emailSchema.safeParse(formData.get("email"));

    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0]?.message ?? "Saisissez une adresse e-mail valide.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email: parsedEmail.data,
        redirectTo: "/reinitialiser-mot-de-passe",
      });
      if (authError) {
        setError(authError.message || "La demande n’a pas pu être traitée.");
      } else {
        setSuccess(
          "Si cette adresse est associée à un compte, un lien de réinitialisation vous sera envoyé.",
        );
      }
    } catch {
      setError("Le service est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-medium text-[#202124]">
        Adresse e-mail
        <input
          autoComplete="email"
          className={fieldClassName}
          name="email"
          required
          type="email"
        />
      </label>
      <FormFeedback error={error} success={success} />
      <button className={submitClassName} disabled={pending} type="submit">
        {pending ? "Envoi en cours…" : "Recevoir un lien de réinitialisation"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = resetPasswordSchema.safeParse({
      token,
      password: new FormData(event.currentTarget).get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: parsed.data.password,
        token: parsed.data.token,
      });
      if (authError) {
        setError(authError.message || "Le mot de passe n’a pas pu être réinitialisé.");
      } else {
        setSuccess("Votre mot de passe a été modifié. Vous allez être redirigé vers la connexion.");
        window.setTimeout(() => router.replace("/connexion"), 1200);
      }
    } catch {
      setError("Le service est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-medium text-[#202124]">
        Nouveau mot de passe
        <input
          autoComplete="new-password"
          className={fieldClassName}
          maxLength={128}
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      <FormFeedback error={error} success={success} />
      <button className={submitClassName} disabled={pending} type="submit">
        {pending ? "Modification en cours…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}

export function ProfileForm({ initialName }: { initialName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse({ name: formData.get("name") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez le nom saisi.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await authClient.updateUser(parsed.data);
      if (authError) {
        setError(authError.message || "Le profil n’a pas pu être modifié.");
      } else {
        setSuccess("Votre profil a été mis à jour.");
      }
    } catch {
      setError("Le service est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="max-w-lg space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-medium text-[#202124]">
        Nom complet
        <input
          autoComplete="name"
          className={fieldClassName}
          defaultValue={initialName}
          maxLength={100}
          minLength={2}
          name="name"
          required
        />
      </label>
      <FormFeedback error={error} success={success} />
      <button className={submitClassName} disabled={pending} type="submit">
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setPending(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        setError(error.message || "La déconnexion n’a pas pu être effectuée.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Le service est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="text-right">
      <button
        className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#202124] hover:border-[var(--primary)] disabled:opacity-60"
        disabled={pending}
        onClick={handleSignOut}
        type="button"
      >
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
    </div>
  );
}
