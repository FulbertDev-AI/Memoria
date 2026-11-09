import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck2,
  Camera,
  Check,
  ShieldCheck,
  Users,
} from "lucide-react";
import { brand } from "@/config/brand";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: CalendarCheck2,
    title: "Invitations intelligentes",
    description:
      "Créez des évènements élégants avec pages publiques, RSVP, billetterie et compte à rebours.",
  },
  {
    icon: Users,
    title: "Gestion des invités",
    description:
      "Centralisez confirmations, accompagnants, statistiques et relances sans fuite d’information.",
  },
  {
    icon: Camera,
    title: "Galeries partagées",
    description:
      "Publiez photos et vidéos, modérez les contributions et distribuez les souvenirs en toute sécurité.",
  },
  {
    icon: ShieldCheck,
    title: "Permissions robustes",
    description:
      "Contrôles serveur, accès dédié et données isolées pour chaque organisation et participant.",
  },
];

const steps = [
  "Créez votre événement en quelques minutes.",
  "Personnalisez l’invitation avec votre branding.",
  "Collectez les RSVP, billets et QR codes.",
  "Partagez la galerie finale à vos invités.",
];

function formatOfferPrice(
  priceMinor: bigint | null,
  currency: string | null,
  interval: string,
) {
  const intervalLabel =
    interval === "MONTHLY"
      ? "par mois"
      : interval === "YEARLY"
        ? "par an"
        : interval === "ONE_TIME"
          ? "par événement"
          : "";

  if (priceMinor === null || currency === null) {
    return intervalLabel ? `Prix à définir · ${intervalLabel}` : "Gratuit";
  }

  const minorUnits = Number(priceMinor);
  if (!Number.isSafeInteger(minorUnits)) {
    return `Prix configuré · ${intervalLabel}`;
  }
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  });
  const amount = formatter.format(
    minorUnits / 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2),
  );
  return intervalLabel ? `${amount} · ${intervalLabel}` : amount;
}

const faqs = [
  {
    question: `${brand.name} est-il adapté aux événements privés comme aux conférences ?`,
    answer:
      "Oui. La plateforme est pensée pour les mariages, anniversaires, séminaires, festivals et événements professionnels avec des parcours adaptés à chaque type.",
  },
  {
    question: "Les invités doivent-ils créer un compte pour répondre au RSVP ?",
    answer:
      `Non. Un invité peut répondre directement depuis une invitation publique, sans compte ${brand.name} obligatoire.`,
  },
  {
    question: "Comment les photos sont-elles sécurisées ?",
    answer:
      "Les médias sont stockés avec des règles d’accès strictes, des liens privés et une modération possible avant publication.",
  },
  {
    question: `Puis-je utiliser ${brand.name} pour des collaborations photographes ?`,
    answer:
      "Oui. Les photographes et vidéastes peuvent être invités sur un évènement, accepter la collaboration et gérer les uploads au bon endroit.",
  },
];

export default async function Home() {
  const offers = await prisma.commercialOffer.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }, { billingInterval: "asc" }],
    select: {
      code: true,
      version: true,
      name: true,
      description: true,
      category: true,
      billingInterval: true,
      priceMinor: true,
      currency: true,
    },
  });
  const discoveryOffers = offers.filter((offer) => offer.category === "DISCOVERY");
  const eventOffers = offers.filter((offer) => offer.category === "EVENT");
  const professionalOffers = offers.filter(
    (offer) => offer.category === "PROFESSIONAL",
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(245,246,245,0.9)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#accueil" aria-label={`${brand.name}, accueil`} className="shrink-0">
            <Image
              src={brand.logoTransparent}
              alt={brand.name}
              width={903}
              height={276}
              priority
              className="h-10 w-[168px] object-contain object-left"
            />
          </a>

          <nav
            aria-label="Navigation principale"
            className="order-3 flex w-full items-center gap-6 overflow-x-auto border-t border-[var(--border)] pt-3 text-sm font-medium text-[#202124]/80 md:order-none md:w-auto md:gap-8 md:overflow-visible md:border-0 md:pt-0"
          >
            <a href="#fonctionnalites" className="shrink-0 transition hover:text-[var(--primary)]">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="shrink-0 transition hover:text-[var(--primary)]">
              Comment ça marche
            </a>
            <a href="#tarifs" className="shrink-0 transition hover:text-[var(--primary)]">
              Tarifs
            </a>
            <a href="#faq" className="shrink-0 transition hover:text-[var(--primary)]">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/connexion"
              className="hidden rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[#202124] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:inline-flex"
            >
              Connexion
            </a>
            <a
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="accueil" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-24">
            <div className="flex flex-col justify-center">
              <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-[#202124] sm:text-6xl">
                Vos événements méritent de devenir des souvenirs inoubliables.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#202124]/70">
                Créez de belles invitations, retrouvez vos invités, partagez vos photos et rassemblez tous vos souvenirs au même endroit. Avec {brand.name}, chaque moment compte.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--primary-strong)]"
                >
                  Créer mon compte
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#fonctionnalites"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3.5 text-base font-semibold text-[#202124] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Voir les fonctionnalités
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_48px_rgba(32,33,36,0.08)]">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div>
                      <p className="text-sm text-[#202124]/60">Espace événement</p>
                      <h2 className="mt-1 text-2xl font-bold text-[#202124]">Tout au même endroit</h2>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        icon: CalendarCheck2,
                        title: "Invitation personnalisée",
                        details: "Informations pratiques et RSVP",
                      },
                      {
                        icon: Users,
                        title: "Suivi des invités",
                        details: "Réponses et participants centralisés",
                      },
                      {
                        icon: Camera,
                        title: "Galerie de souvenirs",
                        details: "Photos et vidéos réunies par événement",
                      },
                    ].map(({ icon: Icon, title, details }) => (
                      <div key={title} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
                        <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                        <div>
                          <h3 className="font-semibold text-[#202124]">{title}</h3>
                          <p className="mt-1 text-sm text-[#202124]/60">{details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Fonctionnalités</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#202124]">Une plateforme pensée pour chaque étape de votre évènement.</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-[var(--border)] bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--peach)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#202124]">{title}</h3>
                <p className="mt-3 text-base leading-7 text-[#202124]/70">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="comment-ca-marche" className="bg-[#202124] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Comment ça marche</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">De la première invitation au dernier souvenir, tout est centralisé.</h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 text-sm font-semibold text-[var(--primary)]">
                    {index + 1}
                  </div>
                  <p className="text-lg font-semibold leading-8 text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Exemples d’invitations</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#202124]">Des templates élégants pour chaque type d’évènement.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Mariage élégant",
                image: "/images/invitations/mariage.webp",
                imageAlt: "Bouquet de mariée dans une lumière douce",
                details: "Palette douce, programme, galerie et RSVP intégré.",
              },
              {
                title: "Conférence professionnelle",
                image: "/images/invitations/conference.webp",
                imageAlt: "Intervenant présentant un sujet devant un public",
                details: "Informations pratiques, intervenants et accès à la salle.",
              },
              {
                title: "Fête privée",
                image: "/images/invitations/fete-privee.webp",
                imageAlt: "Amis réunis pour célébrer autour d’un verre",
                details: "Ambiance moderne, compte à rebours et confirmation instantanée.",
              },
            ].map((card) => (
              <article key={card.title} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                <div className="relative min-h-56">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#202124]/75 px-6 py-4">
                    <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                  </div>
                </div>
                <div className="p-6 text-base text-[#202124]/70">{card.details}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--surface-soft)] py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Galerie & souvenirs</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#202124]">Publiez, modérez et partagez chaque instant.</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#202124]/70">
                Les invités contribuent sans friction, tandis que vous gardez le contrôle éditorial et la sécurité des images partagées.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Upload mobile simple et progressif",
                  "Association manuelle ou via QR Code",
                  "Galeries individuelles protégées",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base font-medium text-[#202124]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--success)]">
                      <Check className="h-4 w-4" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid content-center gap-4 sm:grid-cols-2">
              {[
                { icon: Camera, title: "Albums organisés", text: "Rassemblez les médias par événement." },
                { icon: Users, title: "Contributions invitées", text: "Invitez vos participants à partager leurs photos." },
                { icon: ShieldCheck, title: "Publication contrôlée", text: "Validez les médias avant leur diffusion." },
                { icon: Check, title: "Accès personnel", text: "Partagez les souvenirs avec les bonnes personnes." },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-xl border border-[var(--border)] bg-white p-5">
                  <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-[#202124]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#202124]/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="tarifs" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Tarifs</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#202124]">Une formule adaptée à votre activité.</h2>
            <p className="mt-4 text-base leading-7 text-[#202124]/65">
              Les offres et leurs tarifs sont issus du catalogue Memooria. Aucun prix n’est inventé ou simulé.
            </p>
          </div>

          <div className="mt-12 space-y-12">
            <section aria-labelledby="discovery-offers-heading">
              <h3 id="discovery-offers-heading" className="text-2xl font-bold text-[#202124]">
                Découvrir Memooria
              </h3>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {discoveryOffers.map((offer) => (
                  <article key={`${offer.code}-${offer.version}`} className="rounded-2xl border border-[var(--border)] bg-white p-7">
                    <h4 className="text-xl font-bold text-[#202124]">{offer.name}</h4>
                    <p className="mt-3 text-sm leading-6 text-[#202124]/65">{offer.description}</p>
                    <p className="mt-5 font-semibold text-[var(--primary-strong)]">
                      {formatOfferPrice(offer.priceMinor, offer.currency, offer.billingInterval)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="event-offers-heading">
              <h3 id="event-offers-heading" className="text-2xl font-bold text-[#202124]">
                Forfaits ponctuels par événement
              </h3>
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {eventOffers.map((offer) => (
                  <article key={`${offer.code}-${offer.version}`} className="rounded-2xl border border-[var(--border)] bg-white p-7">
                    <h4 className="text-xl font-bold text-[#202124]">{offer.name}</h4>
                    <p className="mt-3 text-sm leading-6 text-[#202124]/65">{offer.description}</p>
                    <p className="mt-5 font-semibold text-[var(--primary-strong)]">
                      {formatOfferPrice(offer.priceMinor, offer.currency, offer.billingInterval)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="professional-offers-heading">
              <h3 id="professional-offers-heading" className="text-2xl font-bold text-[#202124]">
                Abonnements professionnels
              </h3>
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {professionalOffers.map((offer) => (
                  <article key={`${offer.code}-${offer.version}-${offer.billingInterval}`} className="rounded-2xl border border-[var(--border)] bg-white p-7">
                    <h4 className="text-xl font-bold text-[#202124]">{offer.name}</h4>
                    <p className="mt-3 text-sm leading-6 text-[#202124]/65">{offer.description}</p>
                    <p className="mt-5 font-semibold text-[var(--primary-strong)]">
                      {formatOfferPrice(offer.priceMinor, offer.currency, offer.billingInterval)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {offers.length === 0 && (
              <p className="rounded-xl border border-[var(--border)] bg-white p-5 text-sm text-[#202124]/65">
                Le catalogue des offres n’est pas encore initialisé.
              </p>
            )}
            <p className="text-sm leading-6 text-[#202124]/65">
              Les invités et les photographes ou vidéastes invités accèdent gratuitement aux contenus et outils autorisés pour leur événement. Ces accès ne nécessitent pas d’abonnement professionnel.
            </p>
          </div>
        </section>

        <section id="faq" className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">FAQ</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#202124]">Les réponses aux questions les plus courantes.</h2>
            </div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-6 py-5">
                  <p className="text-lg font-semibold text-[#202124]">{faq.question}</p>
                  <p className="mt-3 text-base leading-7 text-[#202124]/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[#202124] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Image
              src={brand.logoOnWhite}
              alt={brand.name}
              width={1827}
              height={560}
              className="h-10 w-[168px] rounded object-contain object-left"
            />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
              De la première invitation au dernier souvenir, tout votre évènement au même endroit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/75">
            <a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="hover:text-white">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-white">Tarifs</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
