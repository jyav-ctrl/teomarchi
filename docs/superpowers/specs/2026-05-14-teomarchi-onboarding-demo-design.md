# TEOMARCHI Onboarding + Demo Credibility Design

Date: 2026-05-14

## Objectif

Transformer le premier contact avec TEOMARCHI en parcours compréhensible et crédible. Un visiteur doit comprendre rapidement ce que fait la plateforme, voir des exemples réalistes et savoir quoi faire ensuite sans créer de compte immédiatement.

Le sprint retenu est le sprint B : onboarding + contenu de démonstration clairement identifié.

## Problème À Résoudre

Le site possède déjà une identité forte et plusieurs modules, mais un nouvel utilisateur peut encore percevoir une plateforme vide ou difficile à comprendre. Les modules dynamiques, le Feed sans données et les fonctionnalités connectées doivent être accompagnés par des exemples publics lisibles.

Le but n'est pas de créer de faux utilisateurs réels. Les exemples doivent être assumés comme des contenus de démonstration.

## Public Prioritaire

La cible principale de ce sprint est :

- étudiants en architecture ;
- jeunes concepteurs ;
- designers d'espace ;
- indépendants ou petits studios qui veulent évaluer la plateforme.

Les agences et sponsors restent importants, mais l'onboarding doit d'abord convaincre un visiteur individuel qui découvre TEOMARCHI sans contexte.

## Principes Produit

- Aucun faux compte utilisateur n'est créé.
- Toute donnée de démonstration porte un badge visible "Démo".
- Les données Firebase réelles restent séparées des données de démonstration.
- Un utilisateur connecté ne doit jamais confondre ses données avec les exemples.
- L'expérience doit rester légère, sans framework et sans nouveau backend.
- Le parcours doit être utile sans connexion, mais proposer la connexion au bon moment.

## Parcours Utilisateur

### 1. Arrivée Publique

La landing affiche une section "Démarrer avec TEOMARCHI" avec deux actions principales :

- "Lancer la visite guidée" ;
- "Voir une démo".

Cette section explique en une phrase que TEOMARCHI sert à apprendre, comparer, organiser et publier des projets liés à l'architecture.

### 2. Visite Guidée

La visite guidée présente les modules en 4 étapes :

- Atlas : comprendre un système constructif par pays, climat et matériau ;
- Outils : convertir une échelle ou retrouver une dimension ;
- Panthéon : apprendre par architectes, doctrines et matériaux ;
- Journalier : organiser un projet avec tâches, deadlines et progression.

La visite utilise un panneau léger ou une carte d'aide persistante. Elle ne bloque pas la navigation.

### 3. Checklist "Commencer"

Une checklist visible sur la landing ou dans l'accueil propose :

- Explorer une entrée Atlas ;
- Tester le calcul d'échelle ;
- Lire une fiche Panthéon ;
- Consulter une règle Normes & Villes ;
- Créer un compte pour sauvegarder son profil ou son projet.

La progression de cette checklist peut être conservée localement comme préférence non sensible.

### 4. Démonstrations Réalistes

Les modules qui peuvent sembler vides reçoivent des exemples publics marqués "Démo" :

- Feed : 2 ou 3 publications techniques fictives réalistes, sans faux profil personnel ;
- Journalier : aperçu d'un projet exemple sans écrire dans les données utilisateur ;
- Showroom : cartes exemples sponsor ou matériaux avec badge "Démo" ;
- Profil : aperçu public du type de contenu qu'un profil pourrait afficher ;
- Landing : aperçus Atlas, Panthéon, Chronos, Normes et Écologie.

Les exemples doivent être éditoriaux et utiles, pas décoratifs.

## Architecture Front-End

### Fonctions À Prévoir

- `initOnboarding()`
- `renderOnboardingWelcome()`
- `renderStartChecklist()`
- `renderDemoBadge(label)`
- `getDemoContent(moduleId)`
- `shouldShowDemoContent(moduleId)`
- `markOnboardingStepDone(stepId)`
- `dismissOnboarding()`

Ces fonctions doivent suivre les patterns existants :

- guards DOM avant manipulation ;
- délégation d'événements ;
- pas de listeners empilés ;
- compatibilité SPA `data-nav` / `data-module`.

### État Local

Clé proposée :

```js
teomarchi.onboarding
```

Structure :

```js
{
  dismissed: false,
  completedSteps: ["atlas-preview", "scale-tool"],
  lastSeenAt: "2026-05-14T00:00:00.000Z"
}
```

Cet état est une préférence locale. Il ne remplace pas Firebase et ne doit pas être présenté comme sauvegarde SaaS.

### Données Démo

Les données démo doivent rester dans `app.js` pour ce sprint, dans des constantes dédiées :

- `DATA_DEMO_FEED`
- `DATA_DEMO_PROJECT`
- `DATA_DEMO_SHOWROOM`
- `DATA_DEMO_PROFILE`

Chaque objet inclut :

```js
{
  isDemo: true,
  label: "Démo"
}
```

Les données démo ne doivent pas être envoyées à Firestore.

## UX Et UI

Le design reste TEOMARCHI :

- noir profond ;
- blanc cassé ;
- doré discret ;
- cartes sobres ;
- typographie éditoriale ;
- micro-interactions légères.

Les badges "Démo" doivent être visibles mais non agressifs. L'utilisateur doit comprendre que ces contenus sont des exemples, pas des publications réelles.

## Accessibilité

Le sprint doit inclure :

- boutons avec `aria-label` si le texte n'est pas suffisant ;
- panneau de visite avec focus initial ;
- fermeture clavier via `Escape` si panneau modal ;
- checklist lisible au clavier ;
- zone `aria-live="polite"` pour changements de progression ;
- contrastes conformes aux couleurs existantes.

## États Vides

Les états vides ne doivent pas être supprimés. Ils doivent être plus utiles :

- utilisateur non connecté : afficher exemples démo + CTA connexion ;
- utilisateur connecté sans contenu : afficher vrai état vide + actions concrètes ;
- Firestore indisponible : afficher message clair et non technique ;
- mode dégradé : afficher contenu local public ou démo si pertinent.

## Tests D'Acceptation

Ajouter ou mettre à jour les tests pour vérifier :

- la landing contient une section "Démarrer avec TEOMARCHI" ;
- les actions "Lancer la visite guidée" et "Voir une démo" existent ;
- aucun contenu démo ne crée une session ou un utilisateur fictif ;
- les contenus démo portent `isDemo: true` ou un badge "Démo" ;
- le Feed vide affiche des exemples démo publics si aucun post réel n'est disponible ;
- un utilisateur connecté voit ses données réelles en priorité ;
- les fonctions d'onboarding ont des guards anti-null ;
- aucun listener n'est empilé après navigation SPA ;
- les textes techniques internes ne réapparaissent pas dans l'UI publique.

## Hors Scope

Ce sprint ne contient pas :

- PWA complète ;
- service worker ;
- refonte SEO complète ;
- migration backend massive ;
- génération PDF ;
- nouveau framework ;
- nouveau système de paiement.

Ces sujets restent importants, mais ils doivent être traités dans des sprints séparés pour éviter de fragiliser la SPA.

## Résultat Attendu

Après ce sprint, TEOMARCHI doit donner une impression plus fiable dès la première visite :

- le visiteur comprend les modules ;
- le site montre de la valeur sans compte ;
- les exemples semblent crédibles ;
- les données démo sont honnêtement signalées ;
- l'utilisateur sait quelle action faire ensuite.
