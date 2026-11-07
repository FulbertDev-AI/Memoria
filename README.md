# Memooria

Memooria rassemble les invitations, les réponses des invités et les souvenirs d’un événement dans un même espace. Le dépôt est actuellement au socle de la phase 3 : base de données, comptes, sessions et permissions d’organisation.

## État actuel

La landing page, l’inscription, la connexion, la vérification d’adresse e-mail, la réinitialisation de mot de passe, le profil et l’espace connecté sont implémentés. Les événements, les billets, les galeries et les autres parcours métier seront développés dans les phases suivantes.

L’application nécessite PostgreSQL et un serveur SMTP pour effectuer les parcours réels d’inscription et de récupération de compte. Les variables absentes ne sont pas simulées.

## Stack technique

- Next.js App Router, React et TypeScript strict.
- Tailwind CSS.
- Better Auth pour les comptes, les sessions sécurisées et les e-mails de vérification/réinitialisation.
- PostgreSQL et Prisma ORM.
- Zod pour la validation des entrées.
- Nodemailer comme adaptateur SMTP.
- Vitest pour les tests unitaires.

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

## Seed du rôle administrateur

Le seed ne crée pas de compte avec un mot de passe connu ou non vérifié. Inscrivez d’abord le compte via `/inscription`, confirmez l’adresse grâce au lien reçu, puis définissez `SEED_ADMIN_EMAIL` dans `.env` et lancez :

```powershell
npm run db:seed
```

Le script promeut uniquement l’utilisateur existant et vérifié vers `SUPER_ADMIN`. Il échoue explicitement si le compte n’existe pas ou si son adresse n’est pas vérifiée.

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
npm run build
```

Les tests actuels couvrent les validations d’authentification et les règles de permissions. Les tests de parcours avec PostgreSQL et SMTP nécessitent des services configurés ; aucune connexion externe n’est considérée comme validée dans un environnement qui ne les fournit pas.

## Sécurité et limites actuelles

- Les mots de passe sont gérés par Better Auth et doivent comporter au moins 12 caractères.
- Les sessions utilisent les cookies HTTP-only, SameSite=Lax et Secure en production.
- Des limites de requêtes sont définies pour connexion, inscription, vérification et récupération de mot de passe. Le stockage Better Auth est en mémoire ; un stockage partagé devra être configuré avant un déploiement multi-instance.
- La vérification d’e-mail est exigée avant la connexion.
- Les demandes de réinitialisation répondent avec un message neutre pour ne pas révéler si une adresse est inscrite.
- Le seed n’introduit aucun mot de passe de démonstration ni secret dans le code.
- L’inscription dépend du SMTP configuré ; elle n’est jamais présentée comme un envoi effectif sans confirmation du fournisseur.
- La migration PostgreSQL n’a pas encore été confirmée après la mise à jour locale de `DATABASE_URL` ; son résultat sera ajouté au suivi dès la prochaine tentative.
- Des paramètres SMTP sont présents dans l’environnement local, mais aucun e-mail réel n’a été envoyé ni confirmé. Vérifiez le fournisseur avec un test contrôlé avant tout déploiement.
- L’audit npm actuel signale des avis HIGH dans la chaîne de dépendances Prisma 6. La correction proposée implique une mise à niveau majeure vers Prisma 7 ; cette migration reste à évaluer et à valider avant déploiement.

## Suivi du projet

Consultez [PROJECT_STATUS.md](./PROJECT_STATUS.md) pour les phases, résultats de tests et blocages connus.
