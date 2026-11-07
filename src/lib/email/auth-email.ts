import nodemailer from "nodemailer";

type AuthEmail = {
  email: string;
  name: string;
  url: string;
  purpose: "verification" | "password-reset";
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

export async function sendAuthEmail({ email, name, url, purpose }: AuthEmail) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME ?? "MEMORIA";

  if (!host || !Number.isInteger(port) || port <= 0 || !user || !password || !fromEmail) {
    throw new Error(
      "L’envoi d’e-mails d’authentification est indisponible : configurez les variables SMTP dans l’environnement.",
    );
  }

  const isVerification = purpose === "verification";
  const subject = isVerification
    ? "Vérifiez votre adresse e-mail — MEMORIA"
    : "Réinitialisez votre mot de passe — MEMORIA";
  const action = isVerification ? "Vérifier mon adresse e-mail" : "Choisir un nouveau mot de passe";
  const description = isVerification
    ? "Confirmez votre adresse e-mail pour sécuriser votre compte MEMORIA."
    : "Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from: { name: fromName, address: fromEmail },
    to: { name, address: email },
    subject,
    text: `${description}\n\n${action} : ${url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;color:#202124"><h1 style="font-size:24px">MEMORIA</h1><p>Bonjour ${escapeHtml(name)},</p><p>${description}</p><p style="margin:28px 0"><a href="${escapeHtml(url)}" style="background:#f47721;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">${action}</a></p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div>`,
  });
}
