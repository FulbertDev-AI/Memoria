# Memooria

Memooria rassemble les invitations, les réponses des invités et les souvenirs d’un événement dans un même espace. **État au 9 novembre 2026 :** les fondations de la phase 3 sont validées localement. Les deux migrations sont appliquées à `memoria.public`; authentification, organisations et contrôles d’accès passent les tests PostgreSQL isolés. Les parcours événementiels complets restent à construire. La livraison réelle par le fournisseur SMTP n’a pas été vérifiée.

## État actuel

La landing page, l’inscription, la connexion, la vérification d’adresse e-mail, la réinitialisation de mot de passe, le profil et l’espace connecté sont implémentés. La gestion des organisations et des membres, les invitations d’organisation ainsi que les fondations du catalogue commercial et des entitlements sont également présentes. Le modèle d’événement est encore minimal : la création complète d’événements, les invitations publiques, RSVP, billets, galeries, uploads et distribution des souvenirs ne sont pas encore implémentés.

L’application nécessite PostgreSQL et un serveur SMTP configuré pour effectuer les parcours réels d’inscription et de récupération de compte. La configuration SMTP locale existe, mais la connexion au fournisseur et la livraison à un destinataire réel n’ont pas été confirmées. Les variables absentes ne sont pas simulées.

## Point de reprise avant la pause

Le dépôt est synchronisé sur la branche `main`. La phase 3 est validée pour le parcours local; consultez [PROJECT_STATUS.md](./PROJECT_STATUS.md) pour le suivi des phases et les résultats détaillés.

### État vérifié

- Migrations initiale et organisationnelle/commerciale appliquées à la base locale `memoria`, schéma `public`; `prisma migrate status` indique que la base est à jour.
- Catalogue de développement seedé : 10 offres, 13 définitions d’entitlements et accès Découverte aux galeries personnelles ainsi qu’aux photographes invités. Les prix et quotas ne sont pas inventés.
- Les tests unitaires (13), les tests d’intégration PostgreSQL/SMTP local (6), ESLint, TypeScript, la validation Prisma et le build de production ont réussi lors du dernier contrôle.
- Les tests d’intégration utilisent un schéma temporaire dans la base locale, distinct de `public`, puis suppriment ce schéma après exécution normale. Lancez `npm run test:integration`; le rôle PostgreSQL doit pouvoir créer un schéma.
- Aucun paiement n’est simulé. Les nouvelles demandes d’achat et d’abonnement restent en attente jusqu’à l’intégration d’un mécanisme réel.

### À reprendre

1. Reprendre par `git pull` sur `main`, puis consulter [PROJECT_STATUS.md](./PROJECT_STATUS.md).
2. Installer les dépendances avec `npm ci`; configurer localement les variables requises à partir de `.env.example`, sans commiter de fichier `.env`.
3. Démarrer PostgreSQL et vérifier `npm run db:deploy`, `npm run test:integration`, `npm test`, `npm run lint`, `npm run typecheck` et `npm run build`.
4. Si Prisma signale un verrou de fichier sous Windows pendant `db:generate`, arrêter le serveur Next.js local puis relancer la génération.
5. Reprendre la phase 4 selon le plan, puis poursuivre les phases suivantes dans l’ordre.

### Points non confirmés ou à traiter séparément

- Effectuer un test SMTP réel avec une adresse de contrôle approuvée avant de considérer les e-mails comme distribués.
- L’audit npm exécuté le 9 novembre 2026 signalait 4 avis HIGH et 8 MODERATE. La résolution des avis Prisma implique d’évaluer une migration majeure; ne pas lancer `npm audit fix` à l’aveugle.
- La limitation de débit Better Auth repose actuellement sur un stockage en mémoire; un stockage partagé est nécessaire avant un déploiement multi-instance.

## Stack technique

- Next.js App Router, React et TypeScript strict.
- Tailwind CSS.
- Better Auth pour les comptes, les sessions sécurisées et les e-mails de vérification/réinitialisation.
- PostgreSQL et Prisma ORM.
- Zod pour la validation des entrées.
- Nodemailer comme adaptateur SMTP.
- Vitest pour les tests unitaires.

## Images d’illustration

Les trois visuels de la section « Exemples d’invitations » sont des photos d’illustration téléchargées depuis Unsplash, optimisées en WebP et servies localement depuis `public/images/invitations/`. Elles ne représentent ni des clients ni des événements Memooria réels. La licence Unsplash autorise leur usage gratuit, y compris commercial, sans attribution obligatoire : [unsplash.com/license](https://unsplash.com/license).

## Prérequis

- Node.js 20.9 ou plus récent (Node.js 24 est utilisé pour le développement).
- npm.
- PostgreSQL 15 ou plus récent.
- Un serveur SMTP accessible pour tester l’inscription et la récupération du compte.

### Démarrer PostgreSQL en local avec Docker

Si Docker est installé, une instance de développement peut être démarrée avec :

```powershell
docker run --name memooria-postgres `
  -e POSTGRES_USER=memooria `
  -e POSTGRES_PASSWORD=mot_de_passe_local `
  -e POSTGRES_DB=memooria `
  -p 5432:5432 `
  -d postgres:16
```

Cette commande crée une base locale de développement. Ne réutilisez pas ce mot de passe dans un environnement partagé ou de production.

## Installation et configuration

Depuis la racine du dépôt :

```powershell
npm install
Copy-Item .env.example .env
```

Renseignez `DATABASE_URL`, `APP_URL`, `AUTH_SECRET` et les paramètres SMTP dans `.env`. Générez un secret distinct pour chaque environnement :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Collez la valeur générée dans `AUTH_SECRET`. Ne la commitez jamais. Les fichiers `.env` sont ignorés par Git ; seul `.env.example` est versionné.

### Variables d’environnement

| Variable | Obligatoire | Usage |
|---|---:|---|
| `DATABASE_URL` | Oui | Connexion PostgreSQL de Prisma |
| `APP_URL` | Oui | Origine canonique des liens d’authentification |
| `AUTH_SECRET` | Oui | Secret de signature Better Auth, au moins 32 caractères |
| `SMTP_HOST` | Oui pour les e-mails | Hôte SMTP |
| `SMTP_PORT` | Oui pour les e-mails | Port SMTP, par exemple `587` ou `465` |
| `SMTP_USER` | Oui pour les e-mails | Identifiant SMTP |
| `SMTP_PASSWORD` | Oui pour les e-mails | Mot de passe SMTP |
| `SMTP_FROM_EMAIL` | Oui pour les e-mails | Adresse d’expédition vérifiée |
| `SMTP_FROM_NAME` | Non | Nom affiché à l’expéditeur, par défaut `Memooria` |
| `SEED_ADMIN_EMAIL` | Pour le seed admin | Adresse d’un compte déjà inscrit et vérifié |
| `TEST_DATABASE_URL` | Pour les tests PostgreSQL | Base locale dédiée terminant par `_test(s)`, ou schéma dédié terminant par `_test(s)` dans la base de développement |

## Base de données et Prisma

Générez le client Prisma et créez/appliquez la migration de développement :

```powershell
npm run db:generate
npm run db:migrate
```

`db:migrate` crée une migration versionnée puis l’applique à PostgreSQL. Pour appliquer les migrations existantes dans un environnement de déploiement :

```powershell
npm run db:deploy
```

Le schéma inclut les modèles Better Auth (`User`, `Session`, `Account`, `Verification`), les organisations et leurs membres. Les relations ont des contraintes d’intégrité et les tables sensibles possèdent des index.

Une migration additive prépare également les invitations d’organisation, le modèle minimal d’événement et le catalogue commercial. Les migrations versionnées ont été appliquées à la base locale `memoria`, schéma `public`. N’appliquez pas une migration de test à la base de production.

## Seed du rôle administrateur

Le seed ne crée pas de compte avec un mot de passe connu ou non vérifié. Inscrivez d’abord le compte via `/inscription`, confirmez l’adresse grâce au lien reçu, puis définissez `SEED_ADMIN_EMAIL` dans `.env` et lancez :

```powershell
npm run db:seed
```

Le script promeut uniquement l’utilisateur existant et vérifié vers `SUPER_ADMIN`. Il échoue explicitement si le compte n’existe pas ou si son adresse n’est pas vérifiée.

## Offres commerciales et entitlements

Le seed initialise les offres Découverte, Essentiel, Premium, Prestige, Solo, Agence et Business. Les achats événementiels sont associés à un événement; les abonnements professionnels à une organisation. Les prix et quotas ne sont pas préremplis, car ils doivent être décidés puis configurés par l’administration.

Les contrôles commerciaux sont centralisés dans les services d’entitlements et s’exécutent côté serveur. Les demandes d’achat et d’abonnement restent `PENDING` tant qu’un mécanisme réel d’activation n’est pas ajouté. Aucun paiement n’est simulé. L’offre Découverte prévoit gratuitement les galeries personnelles et l’accès commercial des photographes invités; les autorisations de l’événement et les règles de confidentialité continuent de contrôler les accès réels.

## Démarrage

```powershell
npm run dev
```

Pages disponibles :

- `/` : site vitrine.
- `/inscription` : création de compte.
- `/connexion` : connexion.
- `/mot-de-passe-oublie` : demande de réinitialisation.
- `/reinitialiser-mot-de-passe` : choix du nouveau mot de passe depuis le lien e-mail.
- `/dashboard` : espace protégé.
- `/parametres/profil` : modification du nom de profil.
- `/api/auth/*` : endpoints Better Auth.

L’inscription et la connexion exigent une adresse e-mail vérifiée. Le serveur refuse explicitement la création de compte si SMTP n’est pas configuré.

## Rôles et permissions

Les contrôles d’accès sont calculés côté serveur à partir de la ligne `OrganizationMember`, et non d’un rôle fourni par le navigateur.

| Rôle | Permissions de base |
|---|---|
| `OWNER` | Gestion de l’organisation, événements, invités, médias et galerie |
| `ADMIN` | Gestion de l’organisation, événements, invités, médias et galerie |
| `EDITOR` | Événements, invités, médias et galerie |
| `PHOTOGRAPHER` | Import de médias et consultation de galerie |
| `VIEWER` | Consultation de galerie |

Seuls les membres actifs de l’organisation concernée peuvent exercer ces permissions. Le rôle global `SUPER_ADMIN` n’accorde pas automatiquement un accès aux opérations d’organisation.

## Vérifications

```powershell
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
```

Les tests unitaires couvrent les schémas et permissions. `test:integration` exige `DATABASE_URL` et `TEST_DATABASE_URL` vers PostgreSQL en local. La cible peut être une base distincte terminant par `_test(s)`, ou un schéma distinct terminant par `_test(s)` dans la base configurée par `DATABASE_URL`. Pour réutiliser la base de développement sans toucher à son schéma `public`, donnez à `TEST_DATABASE_URL` la même base et un schéma d’intégration. Le script crée ce schéma, y applique les migrations et le seed, exécute les tests, puis supprime uniquement ce schéma isolé. Le schéma peut être réutilisé après une exécution normale; si le processus est interrompu avant le nettoyage, choisissez un autre suffixe. Le rôle doit pouvoir créer un schéma.

```text
postgresql://<utilisateur>:<mot-de-passe>@localhost:5432/memoria?schema=memooria_integration_test
```

Le script ne crée pas de base PostgreSQL. Les tests d’authentification remplacent la configuration SMTP par un capteur local éphémère; aucun message n’est envoyé à un destinataire réel. La présence de paramètres SMTP dans l’environnement ne vaut pas confirmation de livraison réelle.

## Sécurité et limites actuelles

- Les mots de passe sont gérés par Better Auth et doivent comporter au moins 12 caractères.
- Les sessions utilisent les cookies HTTP-only, SameSite=Lax et Secure en production.
- Des limites de requêtes sont définies pour connexion, inscription, vérification et récupération de mot de passe. Le stockage Better Auth est en mémoire ; un stockage partagé devra être configuré avant un déploiement multi-instance.
- La vérification d’e-mail est exigée avant la connexion.
- Les demandes de réinitialisation répondent avec un message neutre pour ne pas révéler si une adresse est inscrite.
- Le seed n’introduit aucun mot de passe de démonstration ni secret dans le code.
- L’inscription dépend du SMTP configuré ; elle n’est jamais présentée comme un envoi effectif sans confirmation du fournisseur.
- Les migrations initiale et additive sont appliquées à la base locale `memoria`, schéma `public`; le statut Prisma a été vérifié à jour.
- Des paramètres SMTP sont présents dans l’environnement local, mais aucun e-mail réel n’a été envoyé ni confirmé. Vérifiez le fournisseur avec un test contrôlé avant tout déploiement.
- L’audit npm signale 4 vulnérabilités HIGH et 8 MODERATE. La correction des avis Prisma HIGH implique une mise à niveau majeure vers Prisma 7; la rétrogradation proposée par npm pour `eslint-config-next` ne convient pas à Next 16. Toute évolution des dépendances doit être évaluée et testée séparément.

## Suivi du projet

Consultez [PROJECT_STATUS.md](./PROJECT_STATUS.md) pour les phases, résultats de tests et blocages connus.
