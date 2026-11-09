import {
  BillingInterval,
  EntitlementValueType,
  OfferCategory,
  OfferContext,
  Prisma,
} from "@prisma/client";

export const initialCommercialOffers = [
  {
    code: "DISCOVERY",
    version: 1,
    name: "Découverte",
    description: "Une offre gratuite pour découvrir Memooria.",
    category: OfferCategory.DISCOVERY,
    context: OfferContext.PLATFORM,
    billingInterval: BillingInterval.NONE,
  },
  {
    code: "ESSENTIEL",
    version: 1,
    name: "Essentiel",
    description: "Un forfait ponctuel pour un événement.",
    category: OfferCategory.EVENT,
    context: OfferContext.EVENT,
    billingInterval: BillingInterval.ONE_TIME,
  },
  {
    code: "PREMIUM_EVENT",
    version: 1,
    name: "Premium",
    description: "Un forfait événementiel avec des droits définis à l’activation.",
    category: OfferCategory.EVENT,
    context: OfferContext.EVENT,
    billingInterval: BillingInterval.ONE_TIME,
  },
  {
    code: "PRESTIGE",
    version: 1,
    name: "Prestige",
    description: "Un forfait événementiel avec des droits définis à l’activation.",
    category: OfferCategory.EVENT,
    context: OfferContext.EVENT,
    billingInterval: BillingInterval.ONE_TIME,
  },
  ...(["SOLO", "AGENCE", "BUSINESS"] as const).flatMap((code) => {
    const name = code === "AGENCE" ? "Agence" : code === "BUSINESS" ? "Business" : "Solo";
    return ([BillingInterval.MONTHLY, BillingInterval.YEARLY] as const).map(
      (billingInterval) => ({
        code,
        version: 1,
        name,
        description: "Un abonnement professionnel associé à une organisation.",
        category: OfferCategory.PROFESSIONAL,
        context: OfferContext.ORGANIZATION,
        billingInterval,
      }),
    );
  }),
] satisfies Prisma.CommercialOfferCreateManyInput[];

export const entitlementDefinitions = [
  {
    key: "events.count",
    name: "Nombre d’événements",
    description: "Nombre d’événements créés dans le contexte commercial.",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "guests.count",
    name: "Nombre de participants",
    description: "Nombre de participants autorisés pour un événement.",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "invitations.count",
    name: "Nombre d’invitations",
    description: "Nombre d’invitations autorisées pour un événement.",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "collaborators.count",
    name: "Nombre de collaborateurs",
    description: "Nombre de photographes et vidéastes autorisés.",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "photographer.access",
    name: "Accès des photographes invités",
    description: "Accès gratuit des photographes et vidéastes invités à leur espace événementiel.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "storage.bytes",
    name: "Espace de stockage",
    description: "Espace de stockage autorisé, exprimé en octets.",
    unit: "byte",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "media.count",
    name: "Nombre de médias",
    description: "Nombre de photos et vidéos autorisées.",
    valueType: EntitlementValueType.QUOTA,
  },
  {
    key: "gallery.personal",
    name: "Galeries personnelles",
    description: "Accès à des galeries personnelles pour les invités.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "gallery.contributions",
    name: "Contributions à la galerie",
    description: "Possibilité pour les invités de contribuer à une galerie.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "invitation.premium_templates",
    name: "Templates premium",
    description: "Accès aux modèles d’invitation premium.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "invitation.advanced_branding",
    name: "Personnalisation avancée",
    description: "Personnalisation avancée de l’invitation et de la marque.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "sponsors.management",
    name: "Gestion des sponsors",
    description: "Gestion des partenaires et sponsors d’un événement.",
    valueType: EntitlementValueType.FEATURE,
  },
  {
    key: "analytics.advanced",
    name: "Statistiques avancées",
    description: "Accès aux rapports et statistiques avancés.",
    valueType: EntitlementValueType.FEATURE,
  },
] satisfies Prisma.EntitlementDefinitionCreateManyInput[];

export async function seedCommercialCatalog(
  client: Pick<
    Prisma.TransactionClient,
    "commercialOffer" | "entitlementDefinition" | "offerEntitlement"
  >,
) {
  await client.commercialOffer.createMany({
    data: initialCommercialOffers,
    skipDuplicates: true,
  });
  await client.entitlementDefinition.createMany({
    data: entitlementDefinitions,
    skipDuplicates: true,
  });

  const discoveryOffer = await client.commercialOffer.findUnique({
    where: {
      code_version_billingInterval: {
        code: "DISCOVERY",
        version: 1,
        billingInterval: BillingInterval.NONE,
      },
    },
    select: { id: true },
  });
  if (!discoveryOffer) {
    throw new Error("L’offre Découverte initiale est absente du catalogue.");
  }

  await client.offerEntitlement.createMany({
    data: [
      { offerId: discoveryOffer.id, entitlementKey: "gallery.personal", enabled: true },
      { offerId: discoveryOffer.id, entitlementKey: "photographer.access", enabled: true },
    ],
    skipDuplicates: true,
  });
}
