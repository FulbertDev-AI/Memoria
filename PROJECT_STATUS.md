# Memooria — Project Status

## État des phases

| Phase | État |
|---|---|
| 1 — Audit et planification | Terminée |
| 2 — Fondations et design system | Terminée |
| 3 — Base de données et authentification | Validée localement; livraison SMTP réelle non vérifiée |
| 4 — Site vitrine | Réalisée partiellement en phase 2 ; validation à reprendre dans l’ordre prévu |
| 5 — Organisations et événements | Fondations organisationnelles et modèle d’événement ajoutés ; parcours événementiels à développer |
| 6 — Invitations et RSVP | Non commencée |
| 7 — Billets, QR Codes et check-in | Non commencée |
| 8 — Photographes et stockage | Non commencée |
| 9 — Galeries et associations | Non commencée |
| 10 — Notifications et distribution | Non commencée |
| 11 — Sponsors et abonnements | Fondations commerciales ajoutées ; administration complète et contrôles métier à poursuivre |
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
- Construire la landing page vitrine Memooria en français, avec une identité premium et sans dégradés.
- Créer la base du design system en variables CSS + Tailwind, en cohérence avec la palette orange/charbon de la marque.
- Préparer la base front pour les prochaines phases d’authentification, événements et gestion de contenus.

### État
- Phase 1 validée : audit et planification complétés.
- Phase 2 validée : fondations et design system front mis en place.

## Phase 2 — Fondations et design system

### Tâches terminées
- Mise à jour du layout global avec metadata, police Inter/Manrope et couleurs de marque.
- Ajout d’un theme CSS cohérent et support du respect de `prefers-reduced-motion`.
- Refonte de la page d’accueil en landing page SaaS Memooria alignée sur le brief.
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

## Rebranding Memooria

- Nom de marque mis à jour en Memooria dans l’interface, les métadonnées, Better Auth, les e-mails et la documentation.
- Logo transparent utilisé sur les surfaces claires ; le logo JPG fourni avec fond blanc est utilisé sur les surfaces sombres.
- Le favicon a été régénéré à partir du symbole du dernier logo transparent fourni.
- Vérification complète après mise à jour des fichiers de logo : lint, TypeScript, 9 tests unitaires et build de production réussis.
- Les noms de cookies et de client Prisma ont été renommés ; le schéma et les données PostgreSQL restent inchangés.
- La migration initiale a été appliquée avec succès à la base locale ; celle-ci conserve son nom technique existant `memoria`.

## Retouche UX et identité de marque — avant la phase 3

### Références revues
- Nouveau logo officiel fourni par le propriétaire : `public/brand/New logo memooria sans arrière plan.png` et `public/brand/New Logo Memooria.jpg`.
- Directives UX : `docs/brand/L'UX de ton SaaS en 10 étapes.txt`.
- Palette de référence : `docs/brand/Color-palette.txt`.

### Changements effectués
- Utilisation des deux derniers logos fournis directement dans les interfaces ; favicon dérivé du symbole orange.
- Remplacement du favicon Next.js par le symbole officiel Memooria.
- Remplacement des anciennes références au logo Kola dans la page.
- Suppression de la pastille « Every moment, remembered. », des chiffres de démonstration et des badges décoratifs.
- Simplification de l’aperçu produit et des blocs d’offres ; les tarifs ne sont pas inventés.
- Ajustement de la navigation mobile pour garder l’accès aux sections principales.
- Application des directives UX relues : parcours lisible, hiérarchie des actions et contenu sans éléments décoratifs superflus.

### Vérifications
- `npm.cmd run lint` → OK.
- `npm.cmd run build` → OK après correction du format RGBA de l’icône ICO.
- Dimensions des nouveaux logos vérifiées ; le rendu du favicon sera confirmé par le build.
- Les fichiers de marque fournis restent inchangés.

### Prochaine tâche
- Valider les tests d’intégration PostgreSQL et les parcours d’authentification ; vérifier SMTP avec un test contrôlé si nécessaire.

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
- Les migrations `20261107150000_initial_auth_organization` et `20261107160000_organization_commercial_foundations` sont appliquées à la base locale `memoria`, schéma `public`; `prisma migrate status` confirme que la base est à jour.
- Le rôle PostgreSQL ne peut pas créer de base, mais peut créer des schémas. Les tests ont utilisé un schéma éphémère dans `memoria`, puis l’ont supprimé; `public` n’a pas été utilisé pour les essais.
- Les tests d’intégration redirigent explicitement le SMTP vers un capteur local; aucun courriel externe n’est envoyé. Cela valide les parcours et la génération des messages, pas la remise par le fournisseur SMTP réel. Les paramètres sont configurés, mais la connexion et la livraison au fournisseur n’ont pas été vérifiées.
- `npm audit` signale 12 avis (4 HIGH, 8 MODERATE), dont 4 HIGH dans la chaîne Prisma (`prisma`, `@prisma/config`, `deepmerge-ts`, `effect`). La correction proposée pour les HIGH impose une mise à niveau majeure vers Prisma 7. La correction ESLint suggérée rétrograderait `eslint-config-next` vers Next 15.5.29, incompatible avec Next 16. Aucune mise à niveau automatique n’a été appliquée.

### État de validation
- Phase 3 validée pour le parcours local : migrations, schéma, seed, Better Auth, e-mails via le capteur SMTP, organisations, autorisations, isolation, quotas, TypeScript, lint, tests unitaires et build sont vérifiés.
- La livraison SMTP réelle demeure une vérification d’intégration externe en attente d’une adresse de contrôle et d’un test autorisé; elle n’est pas présentée comme confirmée.

## Reprise — Organisations et fondations commerciales

### Changements implémentés
- Ajout des invitations d’organisation à jeton opaque haché, de la gestion des membres et rôles, et de routes API avec autorisations serveur.
- Ajout du modèle d’événement minimal nécessaire pour rattacher un achat ponctuel à un événement.
- Ajout d’offres versionnées, d’entitlements, d’achats événementiels, d’abonnements organisationnels, d’usage atomique des quotas et de journaux d’audit.
- Ajout des offres Découverte, Essentiel, Premium, Prestige, Solo, Agence et Business au seed. Les tarifs et quotas restent non configurés tant que l’administration ne les renseigne pas.
- L’offre Découverte attribue les capacités de galerie personnelle et d’accès photographe. Ces droits commerciaux ne remplacent pas les permissions d’accès aux médias ni l’invitation obligatoire du photographe.
- Les achats et abonnements commencent en état `PENDING`; aucun paiement réel ou fictif n’est déclaré.
- Ajout d’une migration additive générée et inspectée; elle a été appliquée à `memoria.public` sans réinitialisation de la base.

### Vérifications exécutées
- `prisma validate` → OK.
- `prisma migrate deploy` sur la base `memoria.public` → migration additive appliquée; `prisma migrate status` → à jour.
- Seed commercial exécuté sans promotion du compte administrateur; contrôle SQL en lecture seule → 10 offres, 13 définitions et 2 entitlements sur Découverte.
- `npm run db:generate` → OK avec Prisma Client 6.19.1.
- `npm run typecheck` → OK.
- `npm run lint` → OK.
- `npm test -- --reporter=dot` → 13 tests réussis; 6 tests d’intégration ignorés faute d’activation PostgreSQL.
- `npm run test:integration` → 6 tests PostgreSQL/SMTP local réussis dans un schéma dédié, supprimé ensuite.
- Les premiers essais d’intégration ont révélé des attentes de test qui ne correspondaient pas à Better Auth (réponse anti-enumération pour doublon, jetons de vérification signés, URL de reset et limites par IP); les assertions et requêtes de test ont été corrigées, puis les six tests ont réussi.
- `npm run build` → OK.
- Le SQL de migration a été inspecté avant application et ne contenait aucune opération `DROP`.
- Contrôle final en lecture seule → aucun schéma de test résiduel; le catalogue public est disponible pour l’interface.

### Prochaines tâches exactes
1. Avec une adresse de contrôle approuvée, vérifier le SMTP réel et documenter le résultat; sans cette adresse, garder cette intégration non confirmée.
2. Continuer la phase 4 selon le plan, sans déclarer les parcours métier ultérieurs implémentés.
3. Planifier séparément l’évaluation de la migration Prisma 7 et de ses impacts avant tout changement majeur de dépendances.
