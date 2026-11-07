# Memooria — RÈGLES DE DÉVELOPPEMENT ET CAHIER DES CHARGES

## 1. RÔLE ET OBJECTIF

Tu es l'agent principal chargé de concevoir, développer, tester et documenter Memooria.

Tu interviens comme une équipe expérimentée composée de :
- Product Manager.
- Software Architect.
- UX/UI Designer SaaS.
- Frontend Developer.
- Backend Developer.
- Database Engineer.
- QA Engineer.
- Expert en sécurité applicative.
- Copywriter.

Ta mission est de construire un véritable produit SaaS fonctionnel, maintenable, sécurisé et évolutif. Il ne s'agit pas d'une simple maquette ou d'une démonstration visuelle.

Tu dois prendre des décisions techniques cohérentes, documenter les choix importants et travailler de manière autonome.

Ne demande pas de confirmation pour les décisions techniques secondaires. En revanche, ne devine jamais une information indispensable manquante et ne prétends jamais qu'une fonctionnalité fonctionne si elle n'a pas été implémentée et testée.

## 2. RÈGLES ABSOLUES DE TRAVAIL

Ces règles s'appliquent à toutes les phases.

### 2.1 Examiner avant de modifier

Avant toute modification :
- Examiner la structure du dépôt.
- Lire le `package.json`.
- Lire le présent fichier `AGENTS.md`.
- Examiner les fichiers de configuration.
- Vérifier les dépendances déjà installées.
- Examiner l'état Git avec `git status`.
- Identifier les éventuels travaux déjà réalisés.
- Vérifier les versions de Node.js et npm disponibles.

Ne jamais supprimer arbitrairement un fichier ou une configuration existante.

Ne jamais remplacer un travail existant sans avoir compris son rôle.

### 2.2 Développement strictement progressif

Le projet est divisé en phases indépendantes et ordonnées.

Tu dois :
1. Lire les objectifs de la phase.
2. Examiner ses dépendances.
3. Définir les tâches précises.
4. Implémenter les fonctionnalités.
5. Exécuter les vérifications adaptées.
6. Corriger les erreurs.
7. Relancer les tests concernés.
8. Vérifier les critères d'acceptation.
9. Mettre à jour `PROJECT_STATUS.md`.
10. Passer à la phase suivante uniquement lorsque la phase actuelle est validée.

Ne développe jamais plusieurs phases simultanément au point de compromettre leur vérification.

Tu peux préparer les éléments nécessaires à la phase suivante, mais ne dois pas considérer une phase comme terminée si ses critères ne sont pas satisfaits.

### 2.3 Porte de validation obligatoire

À la fin de chaque phase, effectuer un contrôle comprenant :
- Vérification TypeScript.
- Vérification ESLint.
- Tests unitaires concernés.
- Tests d'intégration concernés.
- Tests E2E lorsque le parcours est concerné.
- Vérification du build lorsque cela est pertinent.
- Vérification manuelle des interfaces importantes.
- Vérification des permissions et de la sécurité pour les fonctionnalités sensibles.

Si un test échoue :
- Identifier la cause.
- Corriger le problème.
- Relancer les tests.
- Vérifier qu'aucune régression n'a été introduite.

Ne jamais ignorer un test échoué pour continuer artificiellement.

Si un blocage dépend d'un service externe indisponible, documenter précisément le blocage, fournir un mode local honnête lorsque possible et ne pas déclarer la fonctionnalité entièrement opérationnelle.

### 2.4 Suivi de l'avancement

Créer et maintenir à la racine un fichier `PROJECT_STATUS.md`.

Ce fichier doit contenir :
- Les phases prévues.
- Les tâches terminées.
- Les tâches en cours.
- Les tâches non commencées.
- Les tests exécutés.
- Les résultats des tests.
- Les erreurs rencontrées et corrigées.
- Les blocages externes.
- Les décisions techniques importantes.
- La prochaine tâche à réaliser.

Mettre à jour ce fichier après chaque phase et après toute décision architecturale importante.

Ne jamais marquer une tâche comme terminée sans preuve vérifiable.

### 2.5 Qualité du code

- Utiliser TypeScript avec une configuration stricte.
- Éviter `any`, sauf justification précise.
- Favoriser les composants réutilisables.
- Séparer les responsabilités.
- Éviter les composants excessivement volumineux.
- Centraliser les validations.
- Centraliser les règles métier.
- Utiliser des noms explicites.
- Éviter la duplication.
- Prévoir des états de chargement, d'erreur et d'état vide.
- Écrire des tests pour les règles métier importantes.
- Documenter les décisions non évidentes.

Ne pas créer de boutons décoratifs sans action réelle.

Ne pas créer de formulaires sans validation.

Ne pas utiliser des données statiques pour faire croire qu'une fonctionnalité est connectée à la base de données.

Les données de démonstration doivent provenir de seeders identifiés.

## 3. PRÉSENTATION DU PRODUIT

**Nom :** Memooria

**Signature :** Every moment, remembered.

Memooria est une plateforme SaaS de création et de gestion d'événements, d'invitations numériques, de confirmations de présence, de gestion des participants et de collecte, d'organisation et de partage de photos et vidéos.

Sa proposition de valeur :

« De la première invitation au dernier souvenir, tout votre événement au même endroit. »

La plateforme doit permettre à un organisateur de :
- Créer un événement.
- Personnaliser une invitation numérique.
- Partager un lien avec ses invités.
- Collecter les réponses RSVP.
- Gérer les participants.
- Générer des billets et QR Codes.
- Contrôler les entrées.
- Collaborer avec des photographes et vidéastes.
- Centraliser les photos et vidéos.
- Associer des médias aux participants.
- Publier les galeries.
- Distribuer les souvenirs individuellement.

Le marché de lancement est l'Afrique francophone, avec une architecture extensible à l'international.

Les utilisateurs ciblés sont :
- Particuliers.
- Entreprises.
- Associations.
- Établissements scolaires et universitaires.
- Agences événementielles.
- Organisateurs de conférences, festivals et événements culturels.
- Photographes et vidéastes.

## 4. IDENTITÉ VISUELLE ET EXPÉRIENCE UTILISATEUR

### 4.1 Logo

Le logo Memooria fourni par le propriétaire du projet est la référence officielle.

Il comporte :
- Un symbole M stylisé orange.
- Un wordmark Memooria charbon.
- Un obturateur photographique intégré dans le « o ».

Ne pas redessiner arbitrairement le logo.

Avant de l'intégrer :
- Vérifier si le fichier est présent dans le dépôt.
- Vérifier les fichiers du dossier `public/`.
- Si le logo n'est pas disponible, demander au propriétaire de le placer dans `public/brand/` ou de le fournir.
- Ne pas inventer un logo définitif en remplacement.

Prévoir les déclinaisons nécessaires pour le site, les interfaces et le favicon.

### 4.2 Palette officielle

- Orange signature : `#F47721`
- Charbon profond : `#202124`
- Blanc : `#FFFFFF`
- Gris brume : `#F5F6F5`
- Sauge pâle : `#E9F0EF`
- Bleu brume : `#E8F1F7`
- Pêche claire : `#FFF1E6`
- Succès : `#27845C`
- Attention : `#D99A32`
- Erreur : `#D94A4A`

**Règle prioritaire : ne pas utiliser de dégradés.** Utiliser des couleurs unies, y compris pour les boutons et les éléments de marque.

### 4.3 Direction artistique

Créer une interface :
- Moderne.
- Minimaliste.
- Élégante.
- Lumineuse.
- Professionnelle.
- Premium sans excès.
- Intuitive.
- Responsive.
- Mobile-first.

Privilégier les espaces blancs, les photographies de qualité, les compositions aérées, les cartes élégantes, les boutons orange et une navigation claire.

Typographie : Inter ou Manrope, avec une combinaison cohérente.

Utiliser des coins arrondis modérés, des ombres discrètes, des formulaires modernes, des skeleton loaders et des micro-interactions.

Utiliser Lucide pour les icônes.

Ne pas utiliser d'emojis, de stickers, d'effets excessifs ou de dégradés.

Les animations doivent être fluides, légères et respecter `prefers-reduced-motion`.

### 4.4 Copywriting et accessibilité

Tous les textes visibles doivent être rédigés en français professionnel, naturel et clair.

Éviter les textes génériques, les contenus de remplissage et les formulations techniques destinées aux développeurs.

Préparer l'internationalisation pour l'anglais, sans rendre la première version bilingue artificiellement.

Respecter les principes WCAG : contrastes, labels, navigation clavier, focus visible, textes alternatifs et formulaires accessibles.

## 5. STACK TECHNIQUE

Utiliser :
- Next.js avec App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui lorsque pertinent.
- Lucide React.
- Motion pour les animations.
- PostgreSQL.
- Prisma ORM.
- Zod.
- React Hook Form pour les formulaires complexes.
- Vitest pour les tests unitaires et d'intégration.
- Playwright pour les tests E2E.

Pour l'authentification, choisir une solution mature compatible avec la version de Next.js installée, après examen des contraintes du projet.

Next.js doit gérer le frontend et le backend. Ne pas créer de backend séparé avec Laravel, Express, Django ou FastAPI.

Utiliser :
- Server Components par défaut.
- Client Components uniquement lorsque nécessaire.
- Server Actions pour les mutations adaptées.
- Route Handlers pour les API, webhooks et intégrations.
- Services métier séparés des composants.
- Contrôles d'accès côté serveur.

Respecter les versions compatibles des dépendances. Ne pas installer des packages obsolètes ou incompatibles avec le projet.

Ne pas installer toutes les dépendances dès le début. Installer uniquement celles nécessaires à la phase en cours.

## 6. ARCHITECTURE ET ORGANISATION

Construire une architecture modulaire et maintenable.

Séparer clairement :
- Présentation.
- Logique métier.
- Accès aux données.
- Authentification.
- Autorisations.
- Validation.
- Stockage.
- Notifications.
- Services externes.
- Tests.

Organisation indicative :

`src/app/`
- `(marketing)/`
- `(auth)/`
- `dashboard/`
- `admin/`
- `photographer/`
- `e/` ou routes publiques d'événements
- `api/`

`src/components/`
- `ui/`
- `marketing/`
- `dashboard/`
- `events/`
- `invitations/`
- `gallery/`
- `forms/`

`src/features/`
- `auth/`
- `organizations/`
- `events/`
- `invitations/`
- `rsvp/`
- `guests/`
- `tickets/`
- `check-in/`
- `media/`
- `gallery/`
- `sponsors/`
- `subscriptions/`
- `notifications/`

`src/lib/`
- `auth/`
- `db/`
- `storage/`
- `email/`
- `whatsapp/`
- `payments/`
- `validations/`
- `permissions/`

`src/services/`
`src/types/`
`src/config/`

`prisma/`
- `schema.prisma`
- `migrations/`
- `seed.ts`

`tests/`
- `unit/`
- `integration/`
- `e2e/`

`public/brand/`
`public/images/`

Adapter cette structure si nécessaire, sans mélanger les responsabilités.

## 7. BASE DE DONNÉES

Utiliser PostgreSQL et Prisma.

Prévoir :
- Migrations versionnées.
- Relations cohérentes.
- Contraintes d'intégrité.
- Index pertinents.
- Transactions pour les opérations sensibles.
- Suppression logique lorsque justifiée.
- Stratégie de conservation et suppression des données.

Les entités métier minimales à étudier et intégrer selon les besoins réels sont :

- User.
- Organization.
- OrganizationMember.
- Role et permissions.
- Event.
- EventCategory.
- EventTemplate.
- EventSection.
- EventInvitation.
- Guest.
- RSVP.
- Ticket.
- QRToken.
- CheckIn.
- EventCollaborator.
- Media.
- MediaAlbum.
- MediaGuestAssociation.
- MediaContribution.
- Gallery.
- GalleryAccessToken.
- Sponsor.
- Notification.
- EmailLog.
- WhatsAppLog.
- SubscriptionPlan.
- Subscription.
- SubscriptionUsage.
- Payment.
- AuditLog.
- ConsentRecord.

Un utilisateur peut appartenir à plusieurs organisations lorsque cela est pertinent.

Un organisateur peut gérer plusieurs événements.

Un événement peut posséder plusieurs invités, collaborateurs, sponsors, albums et médias.

Un média peut être associé à plusieurs participants lorsque les règles de visibilité l'autorisent.

Ne pas créer de tables inutiles simplement pour reproduire cette liste. Définir les relations et contraintes en fonction des parcours métier.

Ne jamais stocker les fichiers binaires des photos et vidéos dans PostgreSQL. Stocker uniquement leurs métadonnées et références de stockage.

## 8. UTILISATEURS, RÔLES ET PERMISSIONS

### Super administrateur

Il peut :
- Gérer les utilisateurs et organisateurs.
- Consulter et modérer les événements.
- Suspendre ou réactiver des comptes.
- Gérer les offres et quotas.
- Consulter les abonnements et transactions lorsqu'ils existent.
- Consulter les statistiques globales.
- Gérer les signalements.
- Configurer les intégrations.
- Consulter les journaux.
- Gérer les paramètres globaux.

### Organisateur

Il peut :
- Créer, modifier, publier, dépublier, dupliquer, archiver et annuler ses événements.
- Personnaliser ses invitations.
- Gérer les invités et RSVP.
- Gérer les collaborateurs.
- Ajouter des sponsors.
- Gérer les médias et galeries.
- Valider et publier les souvenirs.
- Consulter les statistiques.
- Gérer son abonnement et ses paramètres.

### Photographe ou vidéaste

Il peut :
- Accepter ou refuser une collaboration.
- Consulter les événements auxquels il est affecté.
- Accéder uniquement aux informations autorisées.
- Importer des photos et vidéos.
- Suivre ses uploads.
- Organiser les médias.
- Associer manuellement des médias aux participants.
- Scanner un QR Code pour retrouver un participant dans le contexte de l'événement.
- Consulter le statut de validation de ses fichiers.
- Corriger ou supprimer ses propres fichiers selon ses permissions.

### Participant ou invité

Aucun compte Memooria ne doit être obligatoire pour répondre à une invitation.

Il peut :
- Ouvrir une invitation.
- Répondre au RSVP.
- Recevoir une confirmation et un QR Code.
- Accéder à sa galerie personnelle par un lien sécurisé.
- Télécharger ses médias autorisés.
- Contribuer à la galerie si l'organisateur l'autorise.
- Modifier ou annuler sa réponse selon les règles de l'événement.

Les permissions doivent être vérifiées côté serveur pour chaque opération sensible. Ne jamais se fier uniquement à la visibilité d'un bouton ou à un rôle stocké dans le navigateur.

## 9. SITE VITRINE PUBLIC

Créer une landing page SaaS professionnelle, responsive et convaincante.

Navigation :
- Accueil.
- Fonctionnalités.
- Comment ça marche.
- Tarifs.
- FAQ.
- Connexion.
- Créer mon événement.

Sections :
1. Hero avec proposition de valeur et aperçu visuel du produit.
2. Problème et solution.
3. Fonctionnalités principales.
4. Parcours en quatre étapes.
5. Exemples d'invitations.
6. Galerie de souvenirs.
7. Sponsors et partenaires.
8. Comparaison des offres.
9. FAQ.
10. Appel à l'action final.
11. Footer.

Texte principal proposé :

« Vos événements méritent de devenir des souvenirs inoubliables. »

Description :

« Créez de belles invitations, retrouvez vos invités, partagez vos photos et rassemblez tous vos souvenirs au même endroit. Avec Memooria, chaque moment compte. »

Les boutons principaux doivent conduire à des parcours réels.

Ne pas afficher de faux témoignages, faux chiffres, fausses statistiques ou logos de clients inventés.

## 10. AUTHENTIFICATION ET ONBOARDING

Développer :
- Inscription.
- Connexion.
- Déconnexion.
- Vérification de l'adresse e-mail.
- Mot de passe oublié.
- Réinitialisation du mot de passe.
- Gestion du profil.
- Sessions sécurisées.

Collecter au départ uniquement :
- Nom complet.
- E-mail.
- Mot de passe.
- Type d'utilisation : particulier, entreprise, association ou organisateur professionnel.

Après la première connexion, orienter directement l'utilisateur vers la création de son premier événement.

Permettre de compléter le profil ultérieurement.

## 11. ÉVÉNEMENTS

Créer un parcours progressif de création et de gestion.

Informations :
- Nom.
- Type.
- Description.
- Date.
- Heure de début et de fin.
- Fuseau horaire.
- Adresse.
- Nom du lieu.
- Ville et pays.
- Affiche et couverture.
- Capacité.
- Mode présentiel, distanciel ou hybride.
- Lien de visioconférence si nécessaire.
- Contact de l'organisateur.
- Conditions particulières.
- Confidentialité.

Types :
- Mariage.
- Anniversaire.
- Baptême.
- Dot.
- Fête privée.
- Conférence.
- Séminaire.
- Hackathon.
- Festival.
- Concert.
- Événement professionnel.
- Autre.

Statuts :
- Brouillon.
- Publié.
- En cours.
- Terminé.
- Archivé.
- Annulé.

Fonctionnalités :
- CRUD complet.
- Duplication.
- Publication et dépublication.
- Archivage et annulation.
- Gestion des collaborateurs.
- Statistiques.
- Tableau de bord des événements.

Les données du tableau de bord doivent provenir de la base de données.

## 12. INVITATIONS NUMÉRIQUES

Chaque événement publié doit disposer d'une page publique avec une URL partageable.

Exemple indicatif : `/e/mariage-ama-koffi`.

Créer plusieurs templates de qualité :
1. Mariage élégant.
2. Anniversaire moderne.
3. Conférence professionnelle.
4. Événement d'entreprise.
5. Fête privée.
6. Cérémonie traditionnelle.

L'organisateur peut personnaliser :
- Photo ou affiche.
- Titre et texte.
- Couleurs unies du thème.
- Typographie parmi une sélection.
- Images.
- Sections visibles.
- Informations pratiques.

Sections disponibles selon le type d'événement :
- Hero.
- Présentation.
- Compte à rebours.
- Programme.
- Localisation.
- Informations pratiques.
- Intervenants.
- Galerie.
- Sponsors.
- RSVP.

Les pages doivent être accessibles sans compte, rapides sur mobile et optimisées pour le partage WhatsApp et e-mail.

Afficher le lieu, l'adresse, la ville et un bouton d'itinéraire ouvrant une application cartographique externe. Ne pas imposer une carte lourde.

## 13. RSVP, BILLETS ET QR CODES

Le formulaire RSVP doit être réellement fonctionnel.

Champs possibles :
- Nom complet.
- Adresse e-mail.
- Téléphone selon configuration.
- Statut de présence.
- Nombre d'accompagnants.
- Noms des accompagnants si nécessaire.
- Préférences alimentaires facultatives.
- Message à l'organisateur.

Statuts :
- Présent.
- Absent.
- En attente de décision.

Règles :
- Détecter les doublons.
- Respecter la capacité.
- Contrôler les accompagnants.
- Autoriser ou non la modification.
- Fermer les inscriptions selon la configuration.
- Confirmer clairement la réponse.

Après confirmation :
1. Enregistrer le RSVP.
2. Créer ou mettre à jour l'inscription.
3. Générer un billet numérique.
4. Générer un QR Code unique.
5. Créer un accès personnel sécurisé.
6. Envoyer la confirmation par e-mail si configuré.
7. Envoyer le QR par WhatsApp si configuré et autorisé.
8. Afficher une page de confirmation.
9. Proposer l'ajout à un calendrier.

Ne pas générer de billet valide pour une réponse négative.

Ne pas mettre d'informations personnelles sensibles directement dans le QR Code. Utiliser un jeton opaque, aléatoire et difficile à deviner.

Le billet doit afficher le logo, l'événement, le participant, la date, le lieu, le QR Code et les informations utiles.

Permettre son téléchargement.

## 14. CHECK-IN

Créer un module de contrôle des entrées.

Les personnes autorisées peuvent scanner les QR Codes depuis un smartphone.

Vérifier côté serveur :
- Validité du jeton.
- Événement associé.
- Statut du billet.
- Utilisation précédente.
- Annulation éventuelle.

Enregistrer l'heure d'entrée et empêcher les utilisations frauduleuses.

Afficher des résultats explicites :
- Entrée autorisée.
- Billet déjà utilisé.
- Billet invalide.
- Mauvais événement.
- Inscription annulée.

Prévoir une recherche manuelle par nom ou identifiant en cas de problème de caméra.

## 15. GESTION DES INVITÉS

Créer un espace organisateur permettant :
- Liste des invités.
- Recherche, filtres et tri.
- Pagination.
- Import et export CSV.
- Ajout manuel.
- Modification et suppression.
- Statut RSVP.
- Statut check-in.
- Nombre d'accompagnants.
- Date d'inscription.
- Actions groupées.
- Relances ciblées.

Statistiques :
- Invitations envoyées.
- Réponses reçues.
- Présences confirmées.
- Absences.
- Réponses en attente.
- Accompagnants.
- Entrées réellement enregistrées.

Ne jamais exposer les coordonnées des invités aux autres participants sans autorisation.

## 16. PHOTOGRAPHES ET VIDÉASTES

L'organisateur peut inviter un photographe ou vidéaste à collaborer sur un événement.

Le collaborateur doit accepter la collaboration avant d'accéder à son espace événementiel.

Son dashboard présente :
- Événements assignés.
- Fichiers importés.
- Fichiers en attente.
- Fichiers publiés.
- Activités récentes.

L'upload doit prendre en charge :
- Photos et vidéos.
- Plusieurs fichiers.
- Drag and drop.
- Sélection depuis mobile.
- Progression par fichier et globale.
- Annulation.
- Gestion des erreurs.
- Reprise lorsque techniquement possible.
- Organisation par événement, album et catégorie.

Chaque média possède au minimum :
- Identifiant.
- Événement.
- Auteur.
- Type.
- Nom.
- Taille.
- Référence de stockage.
- Date d'importation.
- Statut.
- Visibilité.
- Associations éventuelles.

Statuts :
- Upload en cours.
- En attente de validation.
- Publié.
- Refusé.
- Archivé.

L'organisateur conserve le contrôle de la publication.

## 17. GALERIES COLLABORATIVES ET PERSONNELLES

L'organisateur peut autoriser les invités à contribuer sans compte obligatoire.

Parcours :
1. L'invité ouvre son accès personnel.
2. Il consulte les médias publiés.
3. Il peut envoyer ses propres médias si autorisé.
4. Les fichiers sont stockés.
5. Ils sont soumis à modération si nécessaire.
6. Ils sont publiés après validation.

Prévoir :
- Upload mobile.
- Prévisualisation.
- Progression.
- Commentaires facultatifs.
- Identité de l'auteur selon les paramètres.
- Signalement.
- Modération.
- Suppression par l'organisateur.

### Association manuelle

L'organisateur ou le photographe peut sélectionner un ou plusieurs médias, rechercher des participants et associer ou désassocier les médias.

### Association par QR Code

Le photographe scanne le QR Code d'un participant dans le contexte du bon événement.

Le système identifie le participant avec les seules informations nécessaires.

Le photographe peut importer une série de médias et vérifier les associations avant validation.

### Galerie collective

Prévoir :
- Grille de photos.
- Albums.
- Filtres.
- Vidéos.
- Chargement progressif.
- Lightbox.
- Téléchargement.
- Responsive.
- Gestion de visibilité.

### Galerie personnelle

Chaque participant accède uniquement aux médias explicitement associés à son profil événementiel.

Utiliser un lien sécurisé, révocable et non prévisible.

Un participant ne doit jamais pouvoir accéder à la galerie privée d'un autre en modifiant une URL ou un identifiant.

## 18. DISTRIBUTION DES SOUVENIRS

Après validation par l'organisateur :
1. Identifier les participants concernés.
2. Récupérer les médias associés.
3. Préparer leurs accès personnels.
4. Générer les liens sécurisés.
5. Préparer les notifications.
6. Déclencher les envois autorisés.

Privilégier un lien vers la galerie plutôt que des pièces jointes volumineuses.

Prévoir :
- Envoi individuel.
- Envoi par lots.
- Traitement asynchrone lorsque nécessaire.
- Tentatives en cas d'échec.
- Journal des envois.
- Statuts en attente, envoyé et échoué.
- Relance manuelle.
- Prévention des doublons.

L'organisateur doit pouvoir vérifier les destinataires et les résultats avant une distribution massive.

Ne jamais affirmer qu'un souvenir a été envoyé sans confirmation du fournisseur.

## 19. E-MAIL ET WHATSAPP

### E-mail

Créer une couche d'envoi indépendante du fournisseur, compatible avec SMTP ou un service d'e-mail transactionnel.

Prévoir des modèles pour :
- Vérification d'e-mail.
- Réinitialisation du mot de passe.
- Invitation.
- Confirmation RSVP.
- Billet QR.
- Rappel.
- Invitation collaborateur.
- Galerie publiée.
- Souvenirs disponibles.

Créer des templates HTML respectant l'identité Memooria.

### WhatsApp

Préparer une intégration avec WhatsApp Business Cloud API de Meta ou un fournisseur compatible.

Prévoir :
- Invitation.
- Confirmation RSVP.
- Billet QR.
- Rappel.
- Disponibilité des souvenirs.

Respecter les règles de consentement et les modèles de messages approuvés.

Si les identifiants ne sont pas configurés :
- Fournir un adaptateur.
- Documenter la configuration.
- Afficher l'intégration comme non configurée.
- Proposer un partage manuel avec un lien prérempli lorsque possible.

Ne jamais simuler un envoi réel.

## 20. SPONSORS ET INTERVENANTS

L'organisateur peut ajouter et gérer :
- Nom du sponsor.
- Logo.
- Description.
- Site web.
- Niveau de partenariat.
- Visibilité.
- Ordre d'affichage.

Niveaux possibles :
- Partenaire principal.
- Gold.
- Silver.
- Bronze.
- Partenaire média.

Afficher une section élégante sur la page de l'événement.

Prévoir également la gestion des intervenants et invités d'honneur.

## 21. SAAS, ABONNEMENTS ET QUOTAS

Créer trois offres configurables depuis l'administration.

### FREE

Accès aux fonctionnalités essentielles :
- Événements.
- Invitations.
- Templates de base.
- RSVP.
- Gestion des invités.
- QR Codes.
- Galerie collective.
- Upload de photos.
- Partage des souvenirs.
- Notifications e-mail.

### PREMIUM

Inclure les fonctionnalités Free avec :
- Plus d'événements.
- Plus d'invités.
- Stockage supérieur.
- Templates premium.
- Personnalisation avancée.
- Statistiques détaillées.
- Galerie enrichie.
- Plus de collaborateurs.
- Outils de communication avancés.

### BUSINESS / PRO

Pour les professionnels et organisations :
- Plus grande capacité.
- Gestion avancée des participants.
- Plus de collaborateurs.
- Gestion des rôles.
- Check-in avancé.
- Statistiques professionnelles.
- Gestion des sponsors.
- Personnalisation avancée de marque.
- Stockage supérieur.
- Gestion multi-événements.
- Assistance prioritaire selon la formule.

Les quotas doivent être stockés et configurés dans la base de données. Ne jamais coder les limites uniquement dans le frontend.

Prévoir un système central d'entitlements contrôlant les fonctionnalités et quotas côté serveur.

Afficher :
- Offre actuelle.
- Quotas utilisés.
- Limites restantes.
- Historique.
- Mise à niveau.
- Rétrogradation.
- Annulation.

Ne pas intégrer de paiement réel dans cette première version.

Préparer une architecture de facturation indépendante pour Mobile Money, cartes et fournisseurs régionaux.

Prévoir les statuts :
- Free.
- Trial.
- Active.
- Pending.
- Past due.
- Cancelled.
- Expired.

L'administrateur doit pouvoir attribuer des offres de test. Les changements doivent être traçables.

Si le paiement n'est pas configuré, afficher une demande d'activation ou une option d'intérêt. Ne jamais prétendre qu'un paiement a été effectué.

## 22. DASHBOARDS

### Dashboard organisateur

Navigation :
- Vue d'ensemble.
- Mes événements.
- Invités.
- Galeries.
- Photographes et vidéastes.
- Sponsors.
- Notifications.
- Abonnement.
- Paramètres.

Afficher des données réelles :
- Événements.
- Événements à venir.
- Participants.
- RSVP.
- Taux de présence.
- Médias.
- Stockage.
- Activités récentes.

Prévoir un bouton principal « Créer un événement ».

Les états vides doivent guider vers une action utile.

### Dashboard photographe

Afficher ses événements assignés, uploads, validations et activités.

### Dashboard administrateur

Permettre :
- Gestion des comptes.
- Gestion des événements.
- Gestion des offres et quotas.
- Gestion des intégrations.
- Modération.
- Statistiques.
- Rôles.
- Paramètres.
- Journaux d'activité.

L'accès administrateur doit être protégé côté serveur.

## 23. NOTIFICATIONS ET TRAITEMENTS ASYNCHRONES

Créer un système centralisé de notifications déclenché par des événements métier réels :
- Inscription.
- Vérification d'adresse.
- RSVP.
- Collaboration acceptée.
- Upload terminé.
- Média approuvé.
- Galerie publiée.
- Souvenirs disponibles.
- Abonnement modifié.

Prévoir une file de traitement pour les envois et opérations longues.

Documenter le démarrage du worker en local et les exigences de production.

Ne pas envoyer de notifications inutiles ou en double.

## 24. STOCKAGE DES FICHIERS

Créer une interface de stockage indépendante du fournisseur.

Prévoir :
- Stockage local fonctionnel en développement.
- Adaptateur S3 compatible en production.
- Validation des extensions et MIME.
- Limites de taille configurables.
- Noms sécurisés.
- Miniatures.
- Optimisation lorsque pertinente.
- Progression d'upload.
- Suppression sécurisée.
- Contrôle d'accès aux fichiers privés.

Les fichiers privés ne doivent pas être accessibles simplement parce qu'une URL de stockage a été découverte.

Ne pas exposer les secrets de stockage au navigateur.

## 25. SÉCURITÉ ET DONNÉES PERSONNELLES

Implémenter :
- Authentification sécurisée.
- Contrôle d'accès par rôle.
- Isolation des données entre organisations.
- Vérification des permissions sur le serveur.
- Validation serveur.
- Protection contre XSS et injections SQL.
- Protection CSRF lorsque nécessaire.
- Rate limiting.
- Gestion sécurisée des sessions.
- Hashage adapté des mots de passe.
- Vérification des fichiers.
- Liens privés révocables.
- Journaux d'activité.
- Gestion d'erreurs sans fuite de secrets.

Prévoir le consentement pour :
- Inscription.
- Communications.
- Publication de photos.
- Contributions des invités.
- Conservation des souvenirs.

Prévoir la suppression de compte, des médias et des données personnelles.

Ne pas intégrer de reconnaissance faciale dans la première version.

Ne jamais exposer les photos privées par défaut.

## 26. PERFORMANCE ET RESPONSIVE

La plateforme doit fonctionner sur :
- Android.
- iPhone.
- Tablettes.
- Ordinateurs portables.
- Écrans de bureau.

Le mobile est prioritaire, particulièrement pour les invitations, les RSVP, les uploads et le check-in.

Optimiser :
- Images et vidéos.
- Polices.
- Bundles JavaScript.
- Chargement différé.
- Requêtes SQL.
- Pagination.
- Cache lorsque pertinent.

Prévoir une expérience utilisable avec une connexion limitée.

## 27. DONNÉES DE DÉMONSTRATION

Créer des seeders de développement pour :
- Un super administrateur.
- Un organisateur particulier.
- Une organisation professionnelle.
- Un photographe.
- Un vidéaste.
- Plusieurs participants.
- Des événements variés.
- Des RSVP positifs, négatifs et en attente.
- Des sponsors.
- Des galeries.
- Des médias de démonstration.
- Les trois offres.

Créer au minimum :
1. Un mariage.
2. Une conférence technologique.
3. Un anniversaire.

Utiliser des données fictives clairement identifiées.

Documenter les identifiants de test dans le README. Les mots de passe de démonstration ne doivent jamais être utilisables en production.

## 28. TESTS OBLIGATOIRES

Utiliser Vitest et Playwright, ou une alternative techniquement justifiée.

Créer :
- Tests unitaires.
- Tests d'intégration.
- Tests des services métier.
- Tests de permissions.
- Tests des API.
- Tests des formulaires.
- Tests RSVP.
- Tests QR Code.
- Tests check-in.
- Tests upload.
- Tests galerie.
- Tests associations de médias.
- Tests quotas.

Les parcours E2E essentiels :

1. Un visiteur crée un compte et se connecte.
2. Il crée un événement.
3. Il publie une invitation.
4. Un invité ouvre le lien et répond au RSVP.
5. Le billet et le QR Code sont générés.
6. L'organisateur consulte les invités.
7. Un photographe accepte une collaboration.
8. Il importe des médias.
9. Il associe manuellement des médias à un participant.
10. Il utilise le QR Code pour retrouver un participant et associer des médias.
11. Un participant contribue à la galerie.
12. L'organisateur modère et publie les médias.
13. Le participant accède à sa galerie privée et télécharge ses souvenirs.
14. Les notifications sont correctement journalisées.
15. Les quotas Free sont appliqués côté serveur.
16. Les fonctionnalités Premium et Business sont testées.
17. Un utilisateur ne peut jamais accéder aux données privées d'une autre organisation ou d'un autre participant.

Les tests de sécurité et d'isolation des données sont prioritaires.

## 29. VARIABLES D'ENVIRONNEMENT

Créer `.env.example` avec une documentation claire.

Prévoir notamment :

`DATABASE_URL=`
`AUTH_SECRET=`
`APP_URL=`
`NEXT_PUBLIC_APP_URL=`
`SMTP_HOST=`
`SMTP_PORT=`
`SMTP_USER=`
`SMTP_PASSWORD=`
`SMTP_FROM_EMAIL=`
`SMTP_FROM_NAME=`
`WHATSAPP_ACCESS_TOKEN=`
`WHATSAPP_PHONE_NUMBER_ID=`
`WHATSAPP_BUSINESS_ACCOUNT_ID=`
`WHATSAPP_WEBHOOK_VERIFY_TOKEN=`
`STORAGE_PROVIDER=`
`STORAGE_LOCAL_PATH=`
`S3_ENDPOINT=`
`S3_REGION=`
`S3_BUCKET=`
`S3_ACCESS_KEY_ID=`
`S3_SECRET_ACCESS_KEY=`
`PAYMENT_PROVIDER=`
`PAYMENT_SECRET_KEY=`
`PAYMENT_WEBHOOK_SECRET=`
`NEXT_PUBLIC_APP_NAME=Memooria`

Adapter les noms aux bibliothèques et services réellement choisis.

Les variables non nécessaires doivent être facultatives.

Ne jamais inclure de vraies clés dans Git ou dans le code frontend.

## 30. README OBLIGATOIRE

Créer un README.md complet en français.

Il doit contenir :
1. Présentation.
2. Fonctionnalités.
3. Stack technique.
4. Architecture.
5. Prérequis.
6. Installation.
7. Configuration PostgreSQL.
8. Configuration `.env`.
9. Installation des dépendances.
10. Prisma et migrations.
11. Seeders.
12. Démarrage de Next.js.
13. Démarrage du worker éventuel.
14. Accès aux interfaces.
15. Comptes de démonstration.
16. Tests.
17. Configuration e-mail.
18. Configuration WhatsApp.
19. Stockage local et S3.
20. Abonnements.
21. Erreurs fréquentes.
22. Build.
23. Déploiement.
24. Variables d'environnement.
25. Guide de test manuel des rôles organisateur, invité, photographe et administrateur.

Chaque commande doit être expliquée.

Un développeur découvrant le projet doit pouvoir l'installer et le tester sans informations supplémentaires non documentées.

## 31. PLAN DE DÉVELOPPEMENT ET PORTES DE VALIDATION

Respecter strictement l'ordre suivant.

### PHASE 1 — AUDIT ET PLANIFICATION

- Examiner le dépôt et les outils.
- Vérifier la configuration Next.js.
- Lire les règles du projet.
- Identifier les éléments existants.
- Vérifier la disponibilité du logo.
- Définir l'architecture cible.
- Identifier les dépendances et risques.
- Créer `PROJECT_STATUS.md`.

Validation :
- Audit documenté.
- Aucun travail existant détruit.
- Architecture proposée.
- Plan de phases défini.
- Blocages identifiés.

### PHASE 2 — FONDATIONS ET DESIGN SYSTEM

- Nettoyer uniquement ce qui est nécessaire.
- Configurer les conventions TypeScript.
- Configurer Tailwind.
- Installer les dépendances nécessaires.
- Intégrer le logo s'il est disponible.
- Créer les tokens de design.
- Créer les composants UI de base.
- Configurer les polices.
- Créer le layout global.
- Préparer les états de chargement et d'erreur.

Validation :
- Application démarre.
- Design system cohérent.
- Responsive de base.
- TypeScript et ESLint passent.
- Build valide.

### PHASE 3 — BASE DE DONNÉES ET AUTHENTIFICATION

- Configurer PostgreSQL.
- Configurer Prisma.
- Créer le schéma initial.
- Générer et appliquer les migrations.
- Implémenter l'authentification.
- Développer les rôles et permissions.
- Préparer les seeders.
- Tester l'isolation des données.

Validation :
- Connexion à la base.
- Migrations réussies.
- Inscription et connexion testées.
- Permissions testées côté serveur.
- Seeders fonctionnels.
- Tests et build valides.

### PHASE 4 — SITE VITRINE

- Landing page.
- Navigation.
- Hero.
- Fonctionnalités.
- Parcours.
- Exemples.
- Tarifs.
- FAQ.
- Footer.
- Responsive.
- SEO et métadonnées.

Validation :
- Liens fonctionnels.
- Responsive vérifié.
- Aucun faux contenu présenté comme réel.
- Accessibilité de base.
- Tests et build valides.

### PHASE 5 — ORGANISATIONS ET ÉVÉNEMENTS

- Gestion des organisations.
- Création et modification des événements.
- Statuts.
- Paramètres.
- Dashboard organisateur.
- Statistiques réelles.
- Gestion des collaborateurs.

Validation :
- CRUD événement testé.
- Autorisations vérifiées.
- Données persistées.
- Cas limites testés.
- Tests et build valides.

### PHASE 6 — INVITATIONS ET RSVP

- Templates.
- Personnalisation.
- Pages publiques.
- Partage.
- Formulaires RSVP.
- Gestion des réponses.
- Confirmation.
- Prévention des doublons.

Validation :
- Invitation publique accessible.
- RSVP persisté.
- Capacité contrôlée.
- Formulaires validés côté serveur.
- Tests E2E du parcours.

### PHASE 7 — BILLETS, QR CODES ET CHECK-IN

- Génération de billets.
- QR Codes sécurisés.
- Téléchargement.
- Scanner.
- Recherche manuelle.
- Contrôle des entrées.
- Prévention des doubles entrées.

Validation :
- QR valide testé.
- QR invalide testé.
- QR déjà utilisé testé.
- Mauvais événement testé.
- Check-in persisté.
- Tests E2E réussis.

### PHASE 8 — PHOTOGRAPHES ET STOCKAGE

- Adaptateur de stockage local.
- Adaptateur S3.
- Invitation des collaborateurs.
- Dashboard photographe.
- Upload multiple.
- Progression.
- Gestion des erreurs.
- Validation et modération des médias.

Validation :
- Upload réel en local.
- Métadonnées persistées.
- Fichiers privés protégés.
- Contrôles MIME et taille testés.
- Permissions testées.
- Tests et build valides.

### PHASE 9 — GALERIES ET ASSOCIATIONS

- Galerie collective.
- Galerie personnelle.
- Contributions des invités.
- Modération.
- Association manuelle.
- Association par QR Code.
- Téléchargement.
- Liens privés révocables.

Validation :
- Médias visibles selon les règles.
- Association manuelle testée.
- Association QR testée.
- Accès privé testé.
- Tentatives d'accès non autorisé testées.
- Tests E2E réussis.

### PHASE 10 — NOTIFICATIONS ET DISTRIBUTION

- Infrastructure e-mail.
- Templates.
- WhatsApp.
- Adaptateurs.
- Journaux.
- File de traitement.
- Distribution des souvenirs.
- Prévention des doublons.
- Relances.

Validation :
- Mode local documenté.
- E-mail réel testé si SMTP disponible.
- WhatsApp réel testé si identifiants disponibles.
- Envois non configurés signalés honnêtement.
- Journaux et erreurs testés.

### PHASE 11 — SPONSORS ET ABONNEMENTS

- Gestion des sponsors.
- Affichage sur les invitations.
- Plans Free, Premium et Business.
- Quotas configurables.
- Entitlements.
- Gestion des abonnements.
- Activation de plans de test.

Validation :
- Trois plans disponibles.
- Quotas testés côté serveur.
- Fonctionnalités selon les droits.
- Aucun faux paiement.
- Tests et build valides.

### PHASE 12 — ADMINISTRATION ET ANALYTICS

- Dashboard global.
- Gestion des utilisateurs.
- Gestion des événements.
- Gestion des plans.
- Gestion des quotas.
- Modération.
- Intégrations.
- Journaux.
- Statistiques globales.

Validation :
- Accès réservé au super administrateur.
- Actions sensibles journalisées.
- Statistiques basées sur les données.
- Tests des permissions réussis.

### PHASE 13 — QUALITÉ GLOBALE ET DOCUMENTATION

- Tests unitaires complets.
- Tests d'intégration.
- Tests E2E.
- Vérification de sécurité.
- Vérification responsive.
- Vérification des performances.
- Corrections des régressions.
- README.
- `.env.example`.
- Guide de test.
- Build de production.
- Rapport final.

Validation :
- Tests critiques réussis.
- Build valide.
- Aucun problème bloquant connu non documenté.
- Installation locale documentée.
- Fonctionnalités externes non configurées clairement identifiées.

## 32. CRITÈRES DE LIVRAISON FINALE

Le projet ne peut être déclaré terminé que si :
- Le site vitrine fonctionne.
- Authentification et permissions fonctionnent.
- Les événements sont réellement persistés.
- Les invitations publiques fonctionnent.
- Le RSVP fonctionne.
- Les billets et QR Codes sont générés.
- Le check-in fonctionne.
- Le photographe peut importer des médias.
- Les deux méthodes d'association fonctionnent.
- Les contributions sont modérées.
- Les galeries privées sont protégées.
- La distribution des souvenirs fonctionne avec un canal configuré.
- Les sponsors fonctionnent.
- Les trois plans existent.
- Les quotas sont appliqués côté serveur.
- Les dashboards affichent des données réelles.
- L'administration est protégée.
- Les tests essentiels passent.
- Le README permet une installation locale.
- Le build de production est valide.

Une fonctionnalité dépendant d'un service externe peut être déclarée « prête à configurer » uniquement si son architecture, son adaptateur, ses contrôles et son mode de test sont implémentés. Elle ne doit pas être présentée comme opérationnelle tant qu'un test réel ne l'a pas confirmé.

## 33. RAPPORT FINAL

À la livraison, fournir :
1. Résumé du produit.
2. Architecture retenue.
3. Fonctionnalités terminées.
4. Fonctionnalités partielles.
5. Intégrations à configurer.
6. Variables à renseigner.
7. Commandes de démarrage.
8. Comptes de démonstration.
9. Résultats détaillés des tests.
10. Résultat du build.
11. Emplacement du README.
12. Problèmes connus.
13. Prochaines recommandations.

Ne jamais exagérer l'état d'avancement.

**PRINCIPE FINAL : la qualité et la vérification priment sur la vitesse. Une phase n'est terminée que lorsque ses critères d'acceptation sont satisfaits et que les tests correspondants ont été exécutés.**