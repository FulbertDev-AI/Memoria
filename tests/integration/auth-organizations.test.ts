import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { SmtpSink, extractLink } from "./support/smtp-sink";

const enabled = process.env.MEMOORIA_RUN_PG_INTEGRATION === "1";
const integration = enabled ? describe : describe.skip;

integration("Better Auth, organisations et PostgreSQL", () => {
  const appUrl = "http://localhost:3000";
  const password = "Memooria-integration-password-2026";
  const unique = randomUUID();
  const ownerEmail = `owner-${unique}@example.test`;
  const memberEmail = `member-${unique}@example.test`;
  const outsiderEmail = `outsider-${unique}@example.test`;
  const unverifiedEmail = `unverified-${unique}@example.test`;
  const userIds: string[] = [];
  const emails = [ownerEmail, memberEmail, outsiderEmail, unverifiedEmail];
  const commercialOfferIds: string[] = [];
  let authRequestCounter = 0;
  const smtp = new SmtpSink();
  let prisma: PrismaClient;
  let auth: typeof import("@/lib/auth/auth")["auth"];
  let organizationsApi: typeof import("@/app/api/organizations/route");
  let organizationApi: typeof import("@/app/api/organizations/[organizationId]/route");
  let membersApi: typeof import("@/app/api/organizations/[organizationId]/members/route");
  let memberApi: typeof import("@/app/api/organizations/[organizationId]/members/[memberUserId]/route");
  let invitationApi: typeof import("@/app/api/organization-invitations/[token]/route");
  let commercialAdminApi: typeof import("@/app/api/admin/commercial-offers/route");
  let commercialService: typeof import("@/features/commercial/service");
  const sessionCookies = new Map<string, string>();
  const organizationIds: string[] = [];

  function authRequest(
    path: string,
    method = "GET",
    body?: unknown,
    cookie?: string,
  ) {
    const clientIp = (authRequestCounter++ % 254) + 1;
    const headers = new Headers({
      origin: appUrl,
      "x-forwarded-for": `198.51.100.${clientIp}`,
    });
    if (body !== undefined) headers.set("content-type", "application/json");
    if (cookie) headers.set("cookie", cookie);
    return auth.handler(
      new Request(`${appUrl}/api/auth${path}`, {
        method,
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    );
  }

  function cookieFrom(response: Response) {
    return response.headers
      .getSetCookie()
      .map((value) => value.split(";", 1)[0])
      .join("; ");
  }

  function messageFor(email: string, after = 0) {
    const message = smtp.messages
      .slice(after)
      .reverse()
      .find((item) => item.toLowerCase().includes(email.toLowerCase()));
    if (!message) throw new Error(`Aucun message de test capturé pour ${email}.`);
    return message;
  }

  async function registerAndVerify(email: string) {
    const signUp = await authRequest("/sign-up/email", "POST", {
      name: email.split("@")[0],
      email,
      password,
      accountType: "INDIVIDUAL",
    });
    expect(signUp.ok).toBe(true);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userIds.push(user.id);
    expect(user.emailVerified).toBe(false);

    const verificationUrl = extractLink(
      messageFor(email),
      "/api/auth/verify-email",
    );
    const verification = await auth.handler(new Request(verificationUrl));
    expect([200, 302, 307].includes(verification.status)).toBe(true);
    const verifiedUser = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(verifiedUser.emailVerified).toBe(true);
    return verifiedUser;
  }

  async function signIn(email: string, passwordValue = password) {
    const response = await authRequest("/sign-in/email", "POST", {
      email,
      password: passwordValue,
    });
    expect(response.ok).toBe(true);
    const cookie = cookieFrom(response);
    expect(cookie).not.toBe("");
    sessionCookies.set(email, cookie);
    return cookie;
  }

  beforeAll(async () => {
    if (!enabled) return;
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error("Les tests PostgreSQL exigent TEST_DATABASE_URL.");
    }

    process.env.APP_URL = appUrl;
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(await smtp.listen());
    process.env.SMTP_USER = "test-user";
    process.env.SMTP_PASSWORD = "test-password";
    process.env.SMTP_FROM_EMAIL = "no-reply@example.test";
    process.env.SMTP_FROM_NAME = "Memooria Test";

    const [
      prismaModule,
      authModule,
      organizationsModule,
      organizationModule,
      membersModule,
      memberModule,
      invitationModule,
      commercialAdminModule,
      commercialServiceModule,
    ] = await Promise.all([
      import("@/lib/db/prisma"),
      import("@/lib/auth/auth"),
      import("@/app/api/organizations/route"),
      import("@/app/api/organizations/[organizationId]/route"),
      import("@/app/api/organizations/[organizationId]/members/route"),
      import("@/app/api/organizations/[organizationId]/members/[memberUserId]/route"),
      import("@/app/api/organization-invitations/[token]/route"),
      import("@/app/api/admin/commercial-offers/route"),
      import("@/features/commercial/service"),
    ]);
    prisma = prismaModule.prisma;
    auth = authModule.auth;
    organizationsApi = organizationsModule;
    organizationApi = organizationModule;
    membersApi = membersModule;
    memberApi = memberModule;
    invitationApi = invitationModule;
    commercialAdminApi = commercialAdminModule;
    commercialService = commercialServiceModule;
  });

  afterAll(async () => {
    if (!enabled) return;
    if (userIds.length > 0) {
      await prisma.event.deleteMany({ where: { createdById: { in: userIds } } });
      await prisma.commercialOfferAuditLog.deleteMany({
        where: { actorUserId: { in: userIds } },
      });
    }
    if (organizationIds.length > 0) {
      await prisma.organization.deleteMany({
        where: { id: { in: organizationIds } },
      });
    }
    if (commercialOfferIds.length > 0) {
      await prisma.commercialOffer.deleteMany({
        where: { id: { in: commercialOfferIds } },
      });
    }
    if (emails.length > 0) {
      await prisma.verification.deleteMany({
        where: {
          OR: emails.flatMap((email) => [
            { identifier: { contains: email } },
            { identifier: { contains: `reset-password:${email}` } },
          ]),
        },
      });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
    await smtp.close();
  });

  it("persists sign-up, verifies email, rejects duplicates, and creates a database session", async () => {
    const user = await registerAndVerify(ownerEmail);

    const duplicate = await authRequest("/sign-up/email", "POST", {
      name: "Duplicate User",
      email: ownerEmail,
      password,
      accountType: "INDIVIDUAL",
    });
    expect(duplicate.ok).toBe(true);
    expect(await prisma.user.count({ where: { email: ownerEmail } })).toBe(1);

    const invalidCredentials = await authRequest("/sign-in/email", "POST", {
      email: ownerEmail,
      password: "incorrect-password",
    });
    expect(invalidCredentials.ok).toBe(false);

    const cookie = await signIn(ownerEmail);
    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(session?.user.id).toBe(user.id);
    expect(
      await prisma.session.count({ where: { userId: user.id } }),
    ).toBeGreaterThan(0);

    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
    await signIn(ownerEmail);
  });

  it("rejects unverified accounts, invalid verification tokens, and invalid form data", async () => {
    const signUp = await authRequest("/sign-up/email", "POST", {
      name: "Unverified User",
      email: unverifiedEmail,
      password,
      accountType: "INDIVIDUAL",
    });
    expect(signUp.ok).toBe(true);
    const pendingUser = await prisma.user.findUniqueOrThrow({
      where: { email: unverifiedEmail },
    });
    userIds.push(pendingUser.id);

    const signInResponse = await authRequest("/sign-in/email", "POST", {
      email: unverifiedEmail,
      password,
    });
    expect(signInResponse.ok).toBe(false);

    expect(messageFor(unverifiedEmail)).toContain("verify-email");
    const invalidVerification = await auth.handler(
      new Request(`${appUrl}/api/auth/verify-email?token=invalid-token`),
    );
    expect([400, 401, 302, 307].includes(invalidVerification.status)).toBe(true);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { email: unverifiedEmail } }))
        .emailVerified,
    ).toBe(false);

    const invalidSignUp = await authRequest("/sign-up/email", "POST", {
      name: "A",
      email: "not-an-email",
      password: "short",
      accountType: "SUPER_ADMIN",
    });
    expect(invalidSignUp.ok).toBe(false);
  });

  it("sends a reset link through the local SMTP sink and enforces single-use tokens", async () => {
    const resetToken = await (async () => {
      const requestStart = smtp.messages.length;
      const request = await authRequest("/request-password-reset", "POST", {
        email: ownerEmail,
        redirectTo: `${appUrl}/reinitialiser-mot-de-passe`,
      });
      expect(request.ok).toBe(true);
      const resetUrl = extractLink(
        messageFor(ownerEmail, requestStart),
        "/reset-password/",
      );
      return resetUrl.pathname.split("/").at(-1);
    })();
    expect(resetToken).toBeTruthy();

    const reset = await authRequest("/reset-password", "POST", {
      token: resetToken,
      newPassword: `${password}-changed`,
    });
    expect(reset.ok).toBe(true);

    const repeatedReset = await authRequest("/reset-password", "POST", {
      token: resetToken,
      newPassword: `${password}-another`,
    });
    expect(repeatedReset.ok).toBe(false);

    const oldPassword = await authRequest("/sign-in/email", "POST", {
      email: ownerEmail,
      password,
    });
    expect(oldPassword.ok).toBe(false);
    const newPassword = await authRequest("/sign-in/email", "POST", {
      email: ownerEmail,
      password: `${password}-changed`,
    });
    expect(newPassword.ok).toBe(true);
    sessionCookies.set(ownerEmail, cookieFrom(newPassword));
  });

  it("creates organizations, invites and manages members, and isolates tenants", async () => {
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: ownerEmail } });
    const ownerCookie = await signIn(ownerEmail, `${password}-changed`);
    const member = await registerAndVerify(memberEmail);
    await registerAndVerify(outsiderEmail);
    const memberCookie = await signIn(memberEmail);
    const outsiderCookie = await signIn(outsiderEmail);

    const unauthenticated = await organizationsApi.GET(
      new Request(`${appUrl}/api/organizations`),
    );
    expect(unauthenticated.status).toBe(401);

    const createResponse = await organizationsApi.POST(
      new Request(`${appUrl}/api/organizations`, {
        method: "POST",
        headers: { cookie: ownerCookie, "content-type": "application/json" },
        body: JSON.stringify({ name: "Organisation de test", slug: "organisation-test" }),
      }),
    );
    expect(createResponse.status).toBe(201);
    const organization = await createResponse.json();
    organizationIds.push(organization.id);
    expect(
      await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: owner.id,
          },
        },
      }),
    ).toMatchObject({ role: "OWNER", status: "ACTIVE" });

    const inviteStart = smtp.messages.length;
    const inviteResponse = await membersApi.POST(
      new Request(`${appUrl}/api/organizations/${organization.id}/members`, {
        method: "POST",
        headers: { cookie: ownerCookie, "content-type": "application/json" },
        body: JSON.stringify({ email: memberEmail, role: "EDITOR" }),
      }),
      { params: Promise.resolve({ organizationId: organization.id }) },
    );
    expect(inviteResponse.status).toBe(201);
    const invitationLink = extractLink(
      messageFor(memberEmail, inviteStart),
      "/api/organization-invitations/",
    );
    const invitationToken = invitationLink.pathname.split("/").at(-1);
    expect(invitationToken).toBeTruthy();

    const accepted = await invitationApi.POST(
      new Request(invitationLink, {
        method: "POST",
        headers: { cookie: memberCookie, "content-type": "application/json" },
        body: JSON.stringify({ decision: "accept" }),
      }),
      { params: Promise.resolve({ token: invitationToken! }) },
    );
    expect(accepted.status).toBe(200);
    expect(
      await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: member.id,
          },
        },
      }),
    ).toMatchObject({ role: "EDITOR", status: "ACTIVE" });

    const doubleAcceptance = await invitationApi.POST(
      new Request(invitationLink, {
        method: "POST",
        headers: { cookie: memberCookie, "content-type": "application/json" },
        body: JSON.stringify({ decision: "accept" }),
      }),
      { params: Promise.resolve({ token: invitationToken! }) },
    );
    expect(doubleAcceptance.status).toBe(409);

    const forbiddenUpdate = await organizationApi.PATCH(
      new Request(`${appUrl}/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { cookie: memberCookie, "content-type": "application/json" },
        body: JSON.stringify({ name: "Modification interdite" }),
      }),
      { params: Promise.resolve({ organizationId: organization.id }) },
    );
    expect(forbiddenUpdate.status).toBe(404);

    const hiddenFromOutsider = await organizationApi.GET(
      new Request(`${appUrl}/api/organizations/${organization.id}`, {
        headers: { cookie: outsiderCookie },
      }),
      { params: Promise.resolve({ organizationId: organization.id }) },
    );
    expect(hiddenFromOutsider.status).toBe(404);

    const roleUpdate = await memberApi.PATCH(
      new Request(`${appUrl}/api/organizations/${organization.id}/members/${member.id}`, {
        method: "PATCH",
        headers: { cookie: ownerCookie, "content-type": "application/json" },
        body: JSON.stringify({ role: "VIEWER" }),
      }),
      {
        params: Promise.resolve({
          organizationId: organization.id,
          memberUserId: member.id,
        }),
      },
    );
    expect(roleUpdate.status).toBe(200);

    const removal = await memberApi.DELETE(
      new Request(`${appUrl}/api/organizations/${organization.id}/members/${member.id}`, {
        method: "DELETE",
        headers: { cookie: ownerCookie },
      }),
      {
        params: Promise.resolve({
          organizationId: organization.id,
          memberUserId: member.id,
        }),
      },
    );
    expect(removal.status).toBe(200);
    const deniedAfterRemoval = await organizationApi.GET(
        new Request(`${appUrl}/api/organizations/${organization.id}`, {
          headers: { cookie: memberCookie },
        }),
        { params: Promise.resolve({ organizationId: organization.id }) },
      );
    expect(deniedAfterRemoval.status).toBe(404);
  });

  it("invalidates the session on sign-out and blocks organization routes afterward", async () => {
    const cookie = sessionCookies.get(ownerEmail) ?? (await signIn(ownerEmail));
    const signOut = await authRequest("/sign-out", "POST", {}, cookie);
    expect(signOut.ok).toBe(true);
    expect(
      await auth.api.getSession({ headers: new Headers({ cookie }) }),
    ).toBeNull();

    const protectedRoute = await organizationsApi.GET(
      new Request(`${appUrl}/api/organizations`, { headers: { cookie } }),
    );
    expect(protectedRoute.status).toBe(401);
  });

  it("uses versioned offers, pending purchases, distinct permissions, and atomic quotas", async () => {
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: ownerEmail } });
    const ownerCookie = await signIn(ownerEmail, `${password}-changed`);
    const organizationId = organizationIds[0];
    expect(organizationId).toBeTruthy();

    const discoveryOffer = await prisma.commercialOffer.findUnique({
      where: {
        code_version_billingInterval: {
          code: "DISCOVERY",
          version: 1,
          billingInterval: "NONE",
        },
      },
      include: { entitlements: true },
    });
    expect(discoveryOffer?.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entitlementKey: "gallery.personal", enabled: true }),
        expect.objectContaining({ entitlementKey: "photographer.access", enabled: true }),
      ]),
    );

    const forbiddenOfferChange = await commercialAdminApi.POST(
      new Request(`${appUrl}/api/admin/commercial-offers`, {
        method: "POST",
        headers: { cookie: ownerCookie, "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    if (!forbiddenOfferChange) {
      throw new Error("L’API d’administration n’a retourné aucune réponse.");
    }
    expect(forbiddenOfferChange.status).toBe(403);

    await prisma.user.update({
      where: { id: owner.id },
      data: { globalRole: "SUPER_ADMIN" },
    });
    const createdOffer = await commercialAdminApi.POST(
      new Request(`${appUrl}/api/admin/commercial-offers`, {
        method: "POST",
        headers: { cookie: ownerCookie, "content-type": "application/json" },
        body: JSON.stringify({
          code: "ESSENTIEL",
          name: "Essentiel",
          description: "Forfait de test attaché à un événement.",
          category: "EVENT",
          context: "EVENT",
          active: true,
          priceMinor: null,
          currency: null,
          billingInterval: "ONE_TIME",
          retentionDays: null,
          retentionAnchor: null,
          entitlements: [
            {
              key: "guests.count",
              type: "QUOTA",
              limitValue: "2",
              usageScope: "EVENT",
            },
            {
              key: "gallery.personal",
              type: "FEATURE",
              enabled: true,
            },
          ],
        }),
      }),
    );
    if (!createdOffer) {
      throw new Error("L’API d’administration n’a retourné aucune réponse.");
    }
    expect(createdOffer.status).toBe(201);
    const configuredOffer = await createdOffer.json();
    commercialOfferIds.push(configuredOffer.id);
    expect(configuredOffer.version).toBeGreaterThan(1);
    expect(configuredOffer.priceMinor).toBeNull();

    const event = await prisma.event.create({
      data: {
        title: "Événement de test commercial",
        slug: `commercial-${randomUUID()}`,
        createdById: owner.id,
        organizationId,
      },
    });
    const pendingPurchase = await commercialService.requestEventOffer(
      owner.id,
      event.id,
      "ESSENTIEL",
    );
    expect(pendingPurchase.status).toBe("PENDING");
    const persistedPendingPurchase = await prisma.eventPlanPurchase.findUniqueOrThrow({
      where: { id: pendingPurchase.id },
    });
    expect(persistedPendingPurchase.source).toBeNull();
    expect(persistedPendingPurchase.rulesSnapshot).toMatchObject({
      code: "ESSENTIEL",
      version: configuredOffer.version,
    });

    await prisma.eventPlanPurchase.update({
      where: { id: pendingPurchase.id },
      data: {
        status: "ACTIVE",
        source: "ADMIN_GRANT",
        activatedAt: new Date(),
      },
    });

    const context = { type: "EVENT" as const, eventId: event.id };
    await expect(
      commercialService.requireCommercialFeature(context, "gallery.personal"),
    ).resolves.toBeUndefined();
    const quotaResults = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        commercialService.consumeCommercialQuota(
          context,
          "guests.count",
          BigInt(1),
        ),
      ),
    );
    expect(quotaResults.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    expect(quotaResults.filter((result) => result.status === "rejected")).toHaveLength(6);
    await expect(
      commercialService.evaluateCommercialEntitlement(context, "guests.count"),
    ).resolves.toMatchObject({ allowed: false, reason: "QUOTA_EXCEEDED" });

    const pendingSubscription =
      await commercialService.requestOrganizationSubscription(
        owner.id,
        organizationId,
        "SOLO",
        "MONTHLY",
      );
    expect(pendingSubscription.status).toBe("PENDING");
    await expect(
      commercialService.evaluateCommercialEntitlement(
        { type: "ORGANIZATION", organizationId },
        "analytics.advanced",
      ),
    ).resolves.toMatchObject({ allowed: false, reason: "NOT_INCLUDED" });
  });
});
