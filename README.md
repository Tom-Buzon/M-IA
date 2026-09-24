# Attic-Ai — Build & conseil

Site de Tom Buzon : trois vraies pages, déclinées en français, anglais et néerlandais, avec HTML pré-rendu, décor WebGL et API OpenRouter en streaming.

## Démarrer

Node.js 20.12+ :

```sh
npm ci
# Renseigner .env à partir de .env.example
npm run dev
```

Une seule commande lance Vite sur http://localhost:5173 et l’API sur http://localhost:3001. Le fichier existant reste compatible :

```dotenv
openrouterToken=your-openrouter-api-key
model=qwen/qwen3.8-27b:free
OPENROUTER_FALLBACK_MODEL=nvidia/nemotron-3.5-lightning:free
```

OPENROUTER_API_KEY et OPENROUTER_MODEL sont également acceptés. Le secours Nemotron gratuit est actif par défaut ; une valeur vide de OPENROUTER_FALLBACK_MODEL le désactive. Aucun modèle payant n’est substitué. Redémarrer le serveur après modification de .env. Aucun secret ne doit porter le préfixe VITE_.

## Pages et langues

- `/` : funnel besoin → approche → capacités → origine → questions → contact. Mastermind reste dans le portfolio.
- `/agence/` : sept domaines de services, livrables, indicateurs à mesurer, méthode et brief.
- `/portfolio/` : Mastermind, VESPER, FrameForge, Blender, Car AI et archives.

Les versions anglaises et néerlandaises utilisent les préfixes `/en/` et `/nl/`. Les liens de langue conservent la page visitée. Navigation par documents HTML, pas de routeur SPA. Le build produit neuf HTML pré-rendus avec titres, descriptions, attribut lang et liens hreflang. JavaScript hydrate ensuite les interactions.

## Décor et mouvement

`src/scene/atticWorld.js` construit un atelier fictif en Three.js : charpente, plancher, bibliothèque, établi électronique, poste de développement, graphe spatial, station audio, montage et maquette. Grain du bois, textiles et écrans sont des textures procédurales. Le décor n’est pas une reproduction du domicile de Tom.

La caméra suit les repères `data-scene-stop`, mesurés dans le document traduit. `SpatialPassage` crée les passages de visite avec texte en premier plan. Les sections de lecture restent des surfaces contrastées. Le menu est un dialogue plein écran ; la caméra accompagne son ouverture.

Le moteur est chargé séparément du contenu. Particules calculées sur GPU, plancher instancié, résolution limitée, ombres et bloom sur desktop, rendu simplifié à 30 images/s sur petit écran. Le rendu s’arrête lorsque le décor est couvert ou l’onglet masqué. Le mode mouvement réduit garde une vue fixe. L’image d’ambiance et tout le contenu restent disponibles si WebGL échoue.

GSAP et Lenis assurent révélations de titres, transitions au défilement et navigation douce sur desktop. Les liens et le défilement natif restent utilisables. Le bouton de mouvement mémorise la préférence localement ; les préférences système sont respectées.

## Modifier le contenu

- `persona.md` : personnalité, connaissances et limites du conseiller, relues à chaque demande.
- `src/data.js` : offres et archives ; identifiants stables.
- `src/pages/` : contenu des trois pages.
- `src/i18n/catalog.json` : traductions anglaises et néerlandaises des textes français.
- `src/i18n/core.js` : traduction et liens localisés.
- `src/index.css` et `src/motion.css` : styles et expérience animée.
- `src/scene/atticWorld.js` : décor, matières, éclairage et positions de caméra.
- `docs/design.md` : intentions et références.

Le brief prépare un email ou copie son contenu ; rien n’est envoyé ni enregistré automatiquement.

## Chat

POST `/api/chat/message` reçoit `{ messages: [{ role: 'user', content: '...' }], locale: 'fr' }`. Historique alterné user/assistant : 21 messages, 6 000 caractères par message, 32 000 caractères au total. La persona et la langue sont ajoutées côté serveur. L’historique reste en mémoire dans la page courante.

Le serveur relaie le streaming SSE et tente Nemotron après un 429, une indisponibilité temporaire ou une réponse vide du premier modèle. Une attente de 30 secondes sans texte sur le premier modèle déclenche également le secours. Le délai global est de 120 secondes. Une fois le premier texte affiché, le serveur ne mélange pas les réponses de deux modèles. Les erreurs de clé ou de crédit restent explicites.

L’interface affiche le modèle choisi, les erreurs HTTP disponibles, les limites de débit et un message d’attente lorsque le fournisseur tarde. Les diagnostics bruts et la clé ne sont jamais affichés. L’utilisateur peut interrompre une génération. Les paramètres de raisonnement des deux modèles configurés privilégient une réponse directe.

Tests réels du 22 septembre 2026 : secours Nemotron et réponse en anglais validés. Un autre essai a nécessité environ 92 secondes avant le premier fragment : la disponibilité et la latence des modèles gratuits restent variables. Voir `docs/verification.md` pour le dernier état.

Protections de démonstration : corps 48 Ko, 15 demandes/minute/IP, deux flux simultanés/IP, validation des rôles et rejet cross-site. Pas de journalisation des messages ou de la clé. OpenRouter et le fournisseur reçoivent les échanges.

## Vérifier et servir

```sh
npm run build
npm test
npm run lint
npm start
```

Les tests couvrent les fragments SSE, la persona, l’isolation des conversations, les erreurs, le secours, les annulations, les délais et les neuf pages traduites. Ils n’utilisent pas la vraie clé.

Express sert les documents pré-rendus et l’API depuis la même origine. Configurer PORT, HOST et APP_ORIGIN pour l’hébergement. Le reverse proxy doit transmettre SSE sans buffering avec un délai supérieur à 120 secondes. Une installation distribuée doit partager les quotas entre instances.

Avant publication : renseigner le domaine canonique, le sitemap et l’identité légale de l’activité. Aucun témoignage, tarif ou résultat client n’a été inventé.

## Navigation dans le grenier

`src/scene/tour.js` définit les trajectoires des trois pages et le lien entre hauteur des sections et progression de caméra. `src/scene/atticWorld.js` construit le grenier central, l’aile studio et la galerie supplémentaire. `SpatialPassage.jsx` fait évoluer trois temps de texte pendant les travellings ; les textes sont pré-rendus et tous visibles en version mobile ou sans animation. Les traductions se trouvent dans `src/i18n/catalog.json`.

Le test `tests/tour.test.js` couvre les hauteurs variables, le retour arrière et le dégagement des trajets par rapport aux murs, plafonds et stations, avec le cadrage mobile.
