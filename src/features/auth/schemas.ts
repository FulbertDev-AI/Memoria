import { z } from "zod";

export const accountTypes = [
  "INDIVIDUAL",
  "BUSINESS",
  "ASSOCIATION",
  "PROFESSIONAL_ORGANIZER",
] as const;

export const accountTypeLabels: Record<(typeof accountTypes)[number], string> = {
  INDIVIDUAL: "Particulier",
  BUSINESS: "Entreprise",
  ASSOCIATION: "Association",
  PROFESSIONAL_ORGANIZER: "Organisateur professionnel",
};

export function getAccountTypeLabel(accountType: string): string {
  const parsed = z.enum(accountTypes).safeParse(accountType);
  return parsed.success ? accountTypeLabels[parsed.data] : "Non renseigné";
}

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Saisissez une adresse e-mail valide."));

export const authUserSchema = z.object({
  name: z.string().trim().min(2, "Saisissez votre nom complet.").max(100),
  email: normalizedEmailSchema,
  accountType: z.enum(accountTypes),
});

export const signUpSchema = authUserSchema.extend({
  password: z
    .string()
    .min(12, "Le mot de passe doit comporter au moins 12 caractères.")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});

export const signInSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Ce lien de réinitialisation est invalide ou expiré."),
  password: z
    .string()
    .min(12, "Le mot de passe doit comporter au moins 12 caractères.")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});

export const emailSchema = normalizedEmailSchema;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Saisissez votre nom complet.").max(100),
});
