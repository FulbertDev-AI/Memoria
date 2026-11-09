# Memooria

Memooria rassemble les invitations, les réponses des invités et les souvenirs d’un événement dans un même espace. Les fondations de la phase 3 sont validées localement : migrations appliquées, authentification, permissions et tests PostgreSQL isolés réussis. La livraison réelle par le fournisseur SMTP reste à vérifier avec une adresse de contrôle.

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

Une migration additive prépare également les invitations d’organisation, le modèle minimal d’événement et le catalogue commercial. Elle a été appliquée à la base locale `memoria`. N’appliquez pas une migration de test à la base de production.

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
- La migration initiale a été appliquée à la base locale `memoria`; la nouvelle migration additive n’a pas encore été appliquée.
- Des paramètres SMTP sont présents dans l’environnement local, mais aucun e-mail réel n’a été envoyé ni confirmé. Vérifiez le fournisseur avec un test contrôlé avant tout déploiement.
- L’audit npm signale 4 vulnérabilités HIGH et 8 MODERATE. La correction des avis Prisma HIGH implique une mise à niveau majeure vers Prisma 7; la rétrogradation proposée par npm pour `eslint-config-next` ne convient pas à Next 16. Toute évolution des dépendances doit être évaluée et testée séparément.

## Suivi du projet

Consultez [PROJECT_STATUS.md](./PROJECT_STATUS.md) pour les phases, résultats de tests et blocages connus.
