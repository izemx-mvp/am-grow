# AM Grow AgriFlow

# Prompt Lovable — Backoffice AM Grow (spécifications détaillées)

Copiez-collez tout le bloc ci-dessous dans Lovable pour générer le backoffice.

---

## PROMPT À COLLER DANS LOVABLE

Crée une application web **backoffice / tableau de bord interne** pour **AM Grow**, une entreprise marocaine de production agricole sous serres, basée à Sidi Ouassay (région d'Agadir), spécialisée dans la culture de produits maraîchers et de fruits rouges destinés à l'exportation. Ce backoffice centralise le suivi agronomique et technique de la ferme (traitements, engrais, suivi des plantations — aujourd'hui éclaté sur des fichiers Excel) et pilote un agent IA d'analytique qui affecte chaque achat/consommation à sa zone, parcelle ou culture, avec un contrôle budgétaire et des alertes. La comptabilité (achats, ventes, banque, fournisseurs, paiements) reste gérée dans **Zoho Books**, que le client garde tel quel — cette plateforme vient compléter ce que Zoho ne couvre pas, pas le remplacer.

Le design doit être somptueux, moderne, animé, du niveau d'un SaaS premium (type Linear, Vercel Dashboard, Stripe Dashboard) — mais avec une identité résolument agricole et vivante, pas un tableau administratif générique. La priorité absolue de ce prompt reste **fonctionnelle** : chaque page listée ci-dessous décrit précisément ses boutons, filtres, barres de recherche, tris, pagination et aperçus — chacun de ces éléments doit se comporter exactement comme décrit, avec un vrai changement d'état visible côté front. S'il y a un doute entre "plus joli" et "vraiment fonctionnel", choisis toujours fonctionnel.

**Règles techniques non négociables, valables sur toute l'application :**
1. Le login est un pur mock sans validation bloquante : champs en état contrôlé (`useState` + `value`/`onChange`, jamais un simple `defaultValue`), et les deux boutons de connexion redirigent systématiquement vers le tableau de bord au clic.
2. Sur **chaque** liste avec recherche/filtre/tri (Suivi agronomique, Analytique & Budget), le tableau affiché et le compteur de résultats doivent lire **exactement la même variable filtrée** calculée une seule fois — jamais deux sources de vérité différentes.
3. Chaque bouton d'action (ajouter, valider, générer, tester la connexion, enregistrer) doit déclencher un vrai changement d'état local (nouvel élément ajouté, statut modifié, badge mis à jour, chiffre recalculé) accompagné d'un toast de confirmation — jamais un clic silencieux sans effet visible.
4. **Rien de purement décoratif ou écrit "en théorie" n'est acceptable.** Chaque effet visuel décrit dans ce prompt (fond aurora animé, cartes en verre dépoli, lift au survol, brillance qui traverse les boutons, compteurs KPI progressifs, transitions de page en fondu, skeletons shimmer) doit être réellement codé et visible à l'écran, pas seulement mentionné en commentaire — applique-les de façon identique et cohérente sur **toutes** les pages concernées. De la même façon, chaque champ de recherche, chaque filtre, chaque tri et chaque bouton listé plus bas doit fonctionner réellement au premier chargement de l'aperçu, sans exception.

### 1. Identité visuelle

- **Logo réel** : AM Grow n'a pas de site web, mais son logo réel ("amg farms") a été fourni par le client. Utilise **exactement** le SVG ci-dessous comme logo dans la sidebar, l'écran de login et le favicon — ne le remplace pas par un logo générique, et ne le redessine pas différemment :

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 120 420 290" role="img" aria-label="amg farms logo">
  <defs>
    <style>
      .word { font-family: 'Poppins', sans-serif; font-weight: 700; }
      .sub { font-family: 'Poppins', sans-serif; font-weight: 600; }
    </style>
  </defs>
  <g transform="translate(320,300) skewX(-6)">
    <text class="word" x="0" y="0" font-size="150" fill="#1F5039" text-anchor="middle" letter-spacing="2">amg</text>
  </g>
  <g transform="translate(418,158) scale(0.75)">
    <path d="M0,46 C0,46 -3,18 14,4 C31,-10 46,0 46,0 C46,0 44,26 28,38 C15,48 0,46 0,46 Z" fill="#E7B84C"/>
    <path d="M6,44 C10,30 18,16 30,6" stroke="#1F5039" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <text class="sub" x="320" y="378" font-size="34" fill="#9CA3A0" text-anchor="middle" letter-spacing="10">FARMS</text>
</svg>
```

- **Couleur principale** : vert forêt du logo, `#1F5039` — `--primary-dark: #163B29` / `--primary-glow: #2E7A52`.
- **Couleur d'accent** : or/doré de la petite feuille du logo, `#E7B84C` — `--accent-soft: #FBF3E1` / `--accent-glow: #F0CD7C`.
- **Couleur secondaire** : gris du sous-texte "FARMS" du logo, `#9CA3A0`, à réutiliser pour les libellés discrets et les états inactifs.
- **Fond/texte** : `--background: #ffffff` / `--foreground: #16221B` / `--muted: #F3F7F4` / `--border: #E2E9E4`.
- **Polices** : "Poppins" (600-800) pour les titres — la même police que le logo, pour une continuité visuelle parfaite —, "Inter" pour le corps — via Google Fonts.
- **Univers visuel** : rangées de serres, cultures maraîchères, fruits rouges (framboises, fraises), palettes d'export, environnement agricole propre et organisé — pas d'imagerie de bureau générique. Écran de login : grande photo de serre agricole ou de récolte de fruits rouges, avec dégradé vert profond en superposition.
- **Fond d'écran coloré et vivant (priorité de design n°1, à faire avant tout le reste)** : abandonne le fond blanc plat. Construis un arrière-plan riche en profondeur derrière toutes les pages : plusieurs formes de dégradé "aurora" superposées (mélange de `--primary-glow` vert et `--accent-glow` doré), à une opacité clairement visible (~15-25% sur les zones de dégradé, fondu vers transparent), qui dérive lentement en boucle (`@keyframes`, 20-30s). Le résultat doit se sentir "vivant" au premier coup d'œil, tout en gardant les cartes et le texte parfaitement lisibles par-dessus (cartes en verre dépoli suffisamment opaques). Applique ce même fond sur l'écran de login ET sur toutes les pages internes.
- **Autres effets, à appliquer partout et pas seulement mentionnés une fois** : cartes en verre dépoli avec ombres douces teintées (vert ou doré selon le contexte, jamais un gris générique) qui se soulèvent au survol ; boutons avec un léger effet de brillance qui traverse au survol ; chiffres et KPI qui comptent progressivement de 0 à leur valeur finale à l'affichage ; transitions de page fluides en fondu + léger décalage (framer-motion `AnimatePresence`) ; skeletons avec effet de balayage lumineux (shimmer) pendant les traitements simulés ; scrollbar personnalisée discrète dans les tons verts sur les zones à défilement interne.

### 2. Écran de connexion

- Deux colonnes plein écran (`min-h-screen w-full`, aucune zone morte) : formulaire à gauche, photo de serre/récolte + dégradé vert à droite avec "AM Grow Control" et une accroche ("Toute votre ferme, dans un seul endroit — sans rien déconnecter de ce qui marche déjà").
- Champs pré-remplis en état contrôlé : Email `contact@amgrow.ma`, mot de passe `AMGrow@2026`. Encart "Accès démonstration" + bouton "Connexion instantanée (démo)". Les deux boutons redirigent systématiquement vers `/dashboard`, sans aucune condition de validation.

### 3. Sidebar — comportement précis

Sidebar fixe à gauche, avec un comportement de fermeture/ouverture réellement fonctionnel :
- **État ouvert** (par défaut) : largeur ~260px, logo "amg farms" en haut (voir SVG en section 1), puis la liste des 4 modules de navigation avec icône + libellé, chacun étant un lien qui charge réellement la page correspondante et affiche un indicateur visuel (fond teinté + barre latérale colorée dorée) sur le module actif.
- **Bouton de fermeture** : en bas de la sidebar, icône chevron/hamburger avec le libellé "Réduire". Au clic, la sidebar anime sa largeur jusqu'à ~64px (transition ~200ms ease), les libellés disparaissent (fondu), seules les icônes restent centrées, et le bouton devient une icône "Agrandir" qui rouvre la sidebar au clic suivant. Tooltip au survol de chaque icône quand la sidebar est réduite.
- Le contenu principal (`main`) se réajuste en largeur à chaque changement d'état (`margin-left` animé), jamais de saut brutal. L'état ouvert/réduit est mémorisé (state local).
- Modules de navigation, dans cet ordre : **Tableau de bord**, **Configuration**, **Suivi agronomique & technique**, **Analytique & Budget**.

Header en haut de chaque page : recherche rapide "aller à" (tape une référence de zone/parcelle ou de fiche de suivi, Entrée redirige vers sa page détail si elle existe), icône notifications (badge avec le nombre d'alertes budgétaires ou agronomiques non lues, ouvre un petit panneau listant les dernières activités), avatar (M. Amin, AM Grow) avec menu déroulant (Profil / Déconnexion → redirige vers `/`).

### 4. Page "Configuration" — prérequis réel, 3 onglets

**Onglet "Connexions"**
- Statut de connexion simulée à **Zoho Books** : badge "Connecté ✅", horodatage de dernière synchronisation, bouton "Tester la connexion" (animation ~1,5s : "Connexion à Zoho Books… Vérification des accès…", puis toast de confirmation et mise à jour de l'horodatage).
- Un court texte explicatif : Zoho Books reste l'outil de référence pour la comptabilité (achats, ventes, banque, fournisseurs, paiements) — cette plateforme vient s'y connecter pour enrichir l'analyse, sans dupliquer ni remplacer cette partie.

**Onglet "Zones & Cultures"**
- Tableau éditable des zones/parcelles de la ferme : nom de la zone (ex. Serre A1, Serre B3, Parcelle plein champ 2), type de culture (maraîchage — tomate, poivron, courgette — ou fruits rouges — fraise, framboise, myrtille), superficie (ha), responsable de zone. Ajout/édition/suppression de lignes.
- Ce référentiel est utilisé partout ailleurs dans l'application pour affecter un traitement, un engrais ou une dépense à sa zone d'origine.

**Onglet "Seuils budgétaires & alertes"**
- Budget mensuel alloué par zone/catégorie de dépense (intrants, main d'œuvre, équipement), champ numérique en MAD.
- Seuil de déclenchement d'alerte (ex. 90% du budget consommé), avec choix du niveau de sévérité (orange à 80%, rouge à 100%).
- Destinataires des alertes (liste d'emails internes, mockée).

Bouton "Enregistrer la configuration" (par onglet) : au clic, toast de succès, badge "Configuration active ✅" en haut de page. **Effet réel et vérifiable** : les zones créées ici apparaissent comme options partout où une affectation par zone est demandée (Suivi agronomique, Analytique & Budget) ; les seuils définis ici déclenchent réellement les alertes affichées sur le Tableau de bord et la page Analytique & Budget.

### 5. Page "Tableau de bord"

- 5 cartes KPI qui comptent progressivement à l'affichage, chacune cliquable et redirigeant vers la page correspondante : "Budget consommé ce mois (MAD)", "Alertes budgétaires actives", "Fiches de suivi agronomique ce mois", "Zones sous seuil critique", "Dernière synchronisation Zoho Books".
- Graphique en barres du budget consommé par zone sur les 6 derniers mois, données mockées cohérentes avec les autres pages.
- Flux "Activité récente" avec au moins 6 entrées horodatées réalistes (ex. "Traitement phytosanitaire enregistré — Serre A1 — il y a 20 min", "Alerte budgétaire déclenchée — Parcelle 2 à 92% du budget mensuel — il y a 1h", "Synchronisation Zoho Books effectuée — il y a 2h").
- Bandeau d'avertissement si la Configuration n'est pas encore validée ("Configurez vos zones et vos seuils budgétaires avant de commencer le suivi"), avec bouton "Configurer" qui redirige vers `/configuration`. Bandeau qui disparaît réellement une fois la configuration validée (state partagé, ex. contexte React global).

### 6. Page "Suivi agronomique & technique" — centralisation des fichiers Excel

**a) Liste**
- Barre d'outils : recherche en temps réel (zone, culture, mot-clé), filtres déroulants fonctionnels (Type : Traitement phytosanitaire / Engrais / Suivi de plantation — Zone, à partir du référentiel de la Configuration — Période), tri de colonnes cliquable (Date, Zone, Type, Responsable), bouton "Réinitialiser les filtres".
- Pagination fonctionnelle (10/25/50 lignes par page), total affiché et lignes du tableau provenant strictement de la même liste filtrée (règle n°2).
- Génère **20 fiches de suivi mockées réalistes**, réparties sur les zones définies en Configuration, avec des exemples concrets : "Traitement fongicide — Serre A1 — 15L", "Apport d'engrais NPK — Parcelle 2 — 40kg", "Suivi de plantation fraisier — Serre B3 — stade floraison".
- Bouton "Ajouter une fiche de suivi" : modal avec formulaire (zone, type, date, produit/intrant utilisé, quantité, responsable, notes) ; à la validation, ajoute réellement une fiche en tête de liste, toast de confirmation, badge "Nouveau" temporaire.

**b) Détail d'une fiche**
- Affiche tous les champs saisis, plus un historique des modifications (timeline verticale animée), et un lien direct vers la zone concernée (page Zones & Cultures en Configuration).
- Bouton "Associer une dépense" : relie cette fiche à un montant, qui vient alimenter automatiquement l'onglet Analytique & Budget de la zone concernée (effet réel et vérifiable — pas juste une note visuelle).

### 7. Page "Analytique & Budget" — cœur de l'agent IA

- En-tête : sélecteur de zone (toutes les zones ou une zone spécifique), avec un indicateur de compatibilité visuelle immédiate (barre colorée verte/orange/rouge selon le niveau de consommation budgétaire de la zone sélectionnée).
- **Tableau d'allocation** : chaque dépense/consommation (intrants, main d'œuvre, équipement) affectée à sa zone/parcelle/culture, avec montant, catégorie, date, et lien vers la fiche de suivi d'origine si applicable.
- **Graphique de répartition** par zone et par catégorie de dépense (barres empilées), recalculé en direct selon les filtres.
- **Suivi budgétaire** : pour chaque zone, barre de progression budget alloué vs consommé (définis en Configuration), avec badge d'alerte animé (orange/rouge) dès que le seuil configuré est dépassé.
- Bouton "Générer le rapport du mois" : animation de traitement (~2s, étapes textuelles : "Récupération des dépenses… Calcul par zone… Génération du rapport…"), puis ajoute réellement un rapport téléchargeable à une liste "Rapports générés" en bas de page, avec toast de confirmation. Boutons **Aperçu** et **Télécharger** fonctionnels sur chaque rapport de la liste.
- **Assistant IA** : bouton flottant "Demander à l'assistant IA" en bas à droite (glow animé, toujours visible en scrollant), ouvre un panneau coulissant à droite (~400px). Bulles de conversation, 4-5 questions suggérées au premier ouverture (ex. "Quelle zone consomme le plus ce mois-ci ?", "Y a-t-il des alertes budgétaires actives ?", "Quel est le budget restant sur la Serre A1 ?", "Résume la répartition des dépenses par catégorie"). Champ de saisie libre + bouton d'envoi, indicateur "L'assistant écrit…" (~800-1200ms) avant chaque réponse. Implémentation : une fonction unique `getAssistantReply(question, data)` qui génère une réponse pertinente à partir des données mockées d'allocation et de budget via une correspondance par mots-clés simple.

### 8. Exigences transverses

- Stack : React + Tailwind + shadcn/ui + framer-motion, entièrement responsive (mobile → sidebar en drawer).
- Toutes les données sont mockées en state local, cohérentes entre les pages — une même zone garde les mêmes informations partout où elle apparaît (dashboard, configuration, suivi agronomique, analytique).
- Toasts de confirmation sur chaque action, états vides soignés ("Aucun résultat pour cette recherche"), mode clair uniquement.
- **Avant de livrer, vérifie concrètement, page par page** (pas en supposant que le code "devrait" marcher — recharge réellement l'aperçu et teste chaque interaction) :
  - Que **chaque** champ de recherche, **chaque** filtre déroulant, **chaque** tri de colonne et **chaque** pagination, sur **chaque** page qui en possède (Suivi agronomique, Analytique & Budget), mettent bien à jour le même tableau affiché que le compteur de résultats.
  - Que **chaque** bouton de l'application clique réellement à quelque chose : "Ajouter une fiche de suivi", "Associer une dépense", "Générer le rapport du mois", "Tester la connexion" (Zoho Books), "Enregistrer la configuration" (sur chacun des 3 onglets), Aperçu, Télécharger, la sidebar (réduire/agrandir), et l'assistant IA (ouverture, envoi de message).
  - Que les zones créées en Configuration apparaissent bien comme options dans le Suivi agronomique et l'Analytique & Budget, et que les seuils configurés déclenchent réellement les badges d'alerte.
  - Qu'associer une dépense à une fiche de suivi met bien à jour les totaux affichés dans l'onglet Analytique & Budget de la zone concernée.
  - Que **tous** les effets visuels de la section 1 (fond aurora animé, verre dépoli, lift au survol, brillance des boutons, compteurs KPI progressifs, transitions de page, skeletons shimmer) sont bien visibles sur toutes les pages concernées, pas seulement sur l'écran de login ou le tableau de bord.
  - Si un seul de ces points ne fonctionne pas à la relecture, corrige-le avant de considérer le travail terminé — ne livre jamais une page avec un bouton, un filtre ou un effet qui ne fait rien.

---

*Prompt préparé à partir de la fiche besoins d'AM Grow (M. Amin), avec le logo réel "amg farms" fourni par le client — recréé en SVG vectoriel pour un rendu net à toute résolution, couleurs extraites directement du logo (vert `#1F5039`, doré `#E7B84C`, gris `#9CA3A0`).*

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb85097c-e42c-4d9f-8295-d9c243676bac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
