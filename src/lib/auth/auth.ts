import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isAuthEmailConfigured, sendAuthEmail } from "@/lib/email/auth-email";
import {
  accountTypes,
  authUserSchema,
  profileSchema,
} from "@/features/auth/schemas";

const configuredAppUrl = process.env.APP_URL;
if (!configuredAppUrl && process.env.NODE_ENV === "production") {
  throw new Error("APP_URL doit être configurée en production.");
}
const appUrlValue = configuredAppUrl ?? "http://localhost:3000";
const secret = process.env.AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("AUTH_SECRET doit être configuré avec au moins 32 caractères.");
}
let appUrl: string;
try {
  const parsedAppUrl = new URL(appUrlValue);
  const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(parsedAppUrl.hostname);
  if (
    !["http:", "https:"].includes(parsedAppUrl.protocol) ||
    parsedAppUrl.pathname !== "/" ||
    parsedAppUrl.search ||
    parsedAppUrl.hash ||
    parsedAppUrl.username ||
    parsedAppUrl.password ||
    (process.env.NODE_ENV === "production" &&
      parsedAppUrl.protocol !== "https:" &&
      !isLocalHost)
  ) {
    throw new Error();
  }
  appUrl = parsedAppUrl.origin;
} catch {
  throw new Error("APP_URL doit être une URL absolue valide.");
}

export const auth = betterAuth({
  appName: "MEMORIA",
  baseURL: appUrl,
  secret,
  trustedOrigins: [appUrl],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        email: user.email,
        name: user.name,
        url,
        purpose: "password-reset",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        email: user.email,
        name: user.name,
        url,
        purpose: "verification",
      });
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        input: true,
        defaultValue: accountTypes[0],
        validator: { input: z.enum(accountTypes) },
      },
      globalRole: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "USER",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isAuthEmailConfigured()) {
            throw new Error(
              "Configurez SMTP avant de créer un compte : l’adresse e-mail doit être vérifiée.",
            );
          }
          const parsed = authUserSchema.safeParse(user);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Les données du compte sont invalides.");
          }
          return {
            data: {
              ...user,
              ...parsed.data,
              globalRole: "USER",
            },
          };
        },
      },
      update: {
        before: async (user) => {
          if (user.name === undefined) {
            return;
          }
          const parsed = profileSchema.safeParse({ name: user.name });
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Le nom du profil est invalide.");
          }
          return { data: { ...user, ...parsed.data } };
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "memoria",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
});
