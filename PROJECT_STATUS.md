# MEMORIA — Project Status

## État des phases

| Phase | État |
|---|---|
| 1 — Audit et planification | Terminée |
| 2 — Fondations et design system | Terminée |
| 3 — Base de données et authentification | En cours de validation, bloquée par la configuration locale PostgreSQL/SMTP |
| 4 — Site vitrine | Réalisée partiellement en phase 2 ; validation à reprendre dans l’ordre prévu |
| 5 — Organisations et événements | Non commencée |
| 6 — Invitations et RSVP | Non commencée |
| 7 — Billets, QR Codes et check-in | Non commencée |
| 8 — Photographes et stockage | Non commencée |
| 9 — Galeries et associations | Non commencée |
| 10 — Notifications et distribution | Non commencée |
| 11 — Sponsors et abonnements | Non commencée |
| 12 — Administration et analytics | Non commencée |
| 13 — Qualité globale et documentation | Non commencée |

## Phase 1 — Audit et planification

### Vérifications effectuées
- Inspection du dépôt : application Next.js minimale, sans implémentation métier ni design system personnalisé.
- Lecture de `package.json` et de `AGENTS.md` : le projet est bien orienté vers une architecture Next.js + TypeScript + Tailwind.
- Vérification des ressources de marque : un fichier logo est présent dans `public/brand/Logo Kola.jpg` et une palette de référence dans `docs/brand/Color-palette.txt`.
- Vérification de l’environnement : Node.js disponible, avec `npm.cmd` requis sous PowerShell pour ce système Windows.

### Décisions techniques importantes
- Utiliser Next.js App Router avec TypeScript strict.
- Construire la landing page vitrine MEMORIA en français, avec une identité premium et sans dégradés.
- Créer la base du design system en variables CSS + Tailwind, en cohérence avec la palette orange/charbon de la marque.
- Préparer la base front pour les prochaines phases d’authentification, événements et gestion de contenus.

### État
- Phase 1 validée : audit et planification complétés.
- Phase 2 validée : fondations et design system front mis en place.

## Phase 2 — Fondations et design system

### Tâches terminées
- Mise à jour du layout global avec metadata, police Inter/Manrope et couleurs de marque.
- Ajout d’un theme CSS cohérent et support du respect de `prefers-reduced-motion`.
- Refonte de la page d’accueil en landing page SaaS MEMORIA alignée sur le brief.
- Integration du logo de la marque dans l’header et le footer.
- Validation du build productif et du lint.

### Tests exécutés
- `npm.cmd run lint` → OK
- `npm.cmd run build` → OK
- Vérification HTTP de la page locale → OK (app servie via Next.js local)

### Résultats
- La landing page se charge sans erreur et compile correctement en production.
- La structure front est prête à servir de base pour les phases suivantes (authentification, événements, galeries, dashboards).

## Prochaine étape
- Phase 1 et phase 2 validées.
- Phase 3 en cours à la demande du propriétaire.

## Retouche UX et identité de marque — avant la phase 3

### Références revues
- Nouveau logo officiel : `public/brand/Logo memoria.jpg`.
- Directives UX : `docs/brand/L'UX de ton SaaS en 10 étapes.txt`.
- Palette de référence : `docs/brand/Color-palette.txt`.

### Changements effectués
- Création d’une déclinaison horizontale optimisée du logo pour les interfaces et d’un pictogramme dérivé pour le favicon.
- Remplacement du favicon Next.js par le symbole officiel MEMORIA.
- Remplacement des anciennes références au logo Kola dans la page.
- Suppression de la pastille « Every moment, remembered. », des chiffres de démonstration et des badges décoratifs.
- Simplification de l’aperçu produit et des blocs d’offres ; les tarifs ne sont pas inventés.
- Ajustement de la navigation mobile pour garder l’accès aux sections principales.
- Application des directives UX relues : parcours lisible, hiérarchie des actions et contenu sans éléments décoratifs superflus.

### Vérifications
- `npm.cmd run lint` → OK.
- `npm.cmd run build` → OK après correction du format RGBA de l’icône ICO.
- Logo horizontal et pictogramme dérivés vérifiés visuellement.
- Les fichiers de marque fournis restent inchangés.

### Prochaine tâche
- Configurer PostgreSQL et SMTP, appliquer la migration, puis tester les parcours d’authentification de bout en bout.

## Phase 3 — Base de données et authentification

### Tâches implémentées
- Ajout de Prisma/PostgreSQL et des modèles Better Auth, organisation et appartenance d’organisation.
- Génération d’une migration initiale versionnée.
- Ajout des règles d’accès par rôle d’organisation et des contrôles d’appartenance active.
- Ajout de l’API Better Auth, des parcours inscription, connexion, vérification e-mail, réinitialisation de mot de passe, profil et déconnexion.
- Ajout de l’espace protégé et du seed d’attribution `SUPER_ADMIN` à un compte existant vérifié.
- Ajout des variables documentées, du guide d’installation et des tests unitaires des schémas/permissions.

### Décisions de sécurité
- Better Auth gère les mots de passe et les sessions ; cookies HTTP-only, SameSite=Lax, Secure en production.
- La vérification d’adresse est obligatoire pour les connexions.
- L’inscription est bloquée avant création si le SMTP n’est pas configuré.
- Le rôle global n’est pas accepté en entrée utilisateur ; seuls les membres actifs de l’organisation concernée obtiennent les permissions déclarées.
- Aucun compte ni mot de passe de démonstration n’est codé en dur.
- Les endpoints sensibles ont des limites de requêtes explicites ; le stockage du limiteur est actuellement en mémoire et devra être partagé avant un déploiement multi-instance.

### Vérifications
- Prisma Client généré depuis le schéma.
- `npm run typecheck` → OK.
- `npm run lint` → OK.
- `npm test` → 3 fichiers, 9 tests réussis.
- `prisma validate` → OK avec une URL de validation locale temporaire.
- `prisma migrate diff` → migration SQL initiale générée hors ligne.
- `npm run build` → OK avec des valeurs temporaires de build, sans connexion à la base.
- Smoke tests HTTP : formulaires d’auth accessibles (200), API de session anonyme (200/null), dashboard anonyme redirigé vers `/connexion` (307).

### Blocages externes
- Le service PostgreSQL local est actif et la `DATABASE_URL` est présente, mais PostgreSQL refuse les identifiants configurés (Prisma P1000). La migration n’a donc pas été appliquée.
- Les paramètres SMTP sont présents dans l’environnement local, mais aucun e-mail n’a été envoyé et l’accès au fournisseur n’a pas été vérifié.
- Les tests d’intégration de persistance, les parcours d’inscription/connexion réels et l’isolation avec PostgreSQL restent à exécuter après configuration locale.
- `npm audit --omit=dev` signale 4 vulnérabilités HIGH dans la chaîne Prisma (`prisma`, `@prisma/config`, `deepmerge-ts`, `effect`). La correction automatique proposée impose une mise à niveau majeure vers Prisma 7 ; aucune mise à niveau risquée n’a été appliquée sans migration et validation dédiées.

### État de validation
- Le code de la phase 3 est implémenté.
- La phase 3 reste ouverte tant que migrations, e-mails, tests d’intégration et parcours d’authentification n’ont pas été vérifiés avec des services configurés.
- Action requise : corriger localement les informations d’accès PostgreSQL dans `.env`, puis relancer `npm run db:deploy`.
