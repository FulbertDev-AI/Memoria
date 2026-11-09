import nodemailer from "nodemailer";
import { brand } from "@/config/brand";

type AuthEmail = {
  email: string;
  name: string;
  url: string;
  purpose: "verification" | "password-reset" | "organization-invitation";
  organizationName?: string;
};

export function isAuthEmailConfigured(): boolean {
  const port = Number(process.env.SMTP_PORT);
  return Boolean(
    process.env.SMTP_HOST &&
      Number.isInteger(port) &&
      port > 0 &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM_EMAIL,
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendAuthEmail({
  email,
  name,
  url,
  purpose,
  organizationName,
}: AuthEmail) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME ?? brand.name;

  if (!host || !Number.isInteger(port) || port <= 0 || !user || !password || !fromEmail) {
    throw new Error(
      "L’envoi d’e-mails d’authentification est indisponible : configurez les variables SMTP dans l’environnement.",
    );
  }

  const subject =
    purpose === "verification"
      ? `Vérifiez votre adresse e-mail — ${brand.name}`
      : purpose === "password-reset"
        ? `Réinitialisez votre mot de passe — ${brand.name}`
        : `Invitation à rejoindre ${organizationName ?? "une organisation"} — ${brand.name}`;
  const action =
    purpose === "verification"
      ? "Vérifier mon adresse e-mail"
      : purpose === "password-reset"
        ? "Choisir un nouveau mot de passe"
        : "Consulter l’invitation";
  const description =
    purpose === "verification"
      ? `Confirmez votre adresse e-mail pour sécuriser votre compte ${brand.name}.`
      : purpose === "password-reset"
        ? "Une demande de réinitialisation de mot de passe a été effectuée pour votre compte."
        : `Vous avez été invité à rejoindre ${organizationName ?? "une organisation"} sur ${brand.name}.`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from: { name: fromName, address: fromEmail },
    to: { name: name || email, address: email },
    subject,
    text: `${description}\n\n${action} : ${url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;color:#202124"><h1 style="font-size:24px">${brand.name}</h1><p>Bonjour ${escapeHtml(name)},</p><p>${description}</p><p style="margin:28px 0"><a href="${escapeHtml(url)}" style="background:#f47721;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">${action}</a></p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div>`,
  });
}

export async function sendOrganizationInvitationEmail({
  email,
  organizationName,
  url,
}: {
  email: string;
  organizationName: string;
  url: string;
}) {
  return sendAuthEmail({
    email,
    name: email,
    url,
    purpose: "organization-invitation",
    organizationName,
  });
}
