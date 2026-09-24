# Vérification — 22 septembre 2026

## Pages, interaction et langues

- Neuf HTML pré-rendus : accueil, agence et portfolio en français, anglais et néerlandais. Une seule H1 par page, liens de langue, métadonnées et hreflang contrôlés automatiquement.
- Le contrôle des traductions des HTML anglais/néerlandais n’a pas trouvé de chaîne française connue restée sans traduction.
- Navigation par menu entre portfolio et agence, puis changement néerlandais → anglais, validés dans le navigateur.
- Brief anglais : sélection « Prototype & MVP », contexte, récapitulatif et contenu du mailto vérifiés. Aucun email envoyé.
- Vues 390 et 320 px : aucune largeur de document supérieure au viewport sur les pages contrôlées.
- Mode mouvement réduit : désactivation, restitution des titres sans spans animés et conservation de la langue vérifiées. Le contenu et les liens restent disponibles.

## Décor

- Scène réelle Three.js/WebGL, inspectée dans le navigateur : bureau, détails, éclairage, profondeur, caméra au scroll et chapitres du portfolio.
- Résolution plafonnée ; rendu mobile simplifié à 30 images/s, desktop jusqu’à 60 images/s. Les mesures locales observées sont proches de ces plafonds ; ce n’est pas une mesure sur un téléphone physique ni une garantie pour tous les GPU.
- Moteur 3D chargé séparément : environ 159 Ko compressés lors du build mesuré. Pas de modèle GLB ni texture distante téléchargée.
- Les surfaces de lecture couvrent le canvas ; le rendu s’arrête quand aucune zone 3D n’est visible. L’onglet masqué et le mode mouvement réduit suspendent également l’animation.
- Repli sans WebGL : image d’ambiance et HTML du site conservés par l’implémentation. Pas de test matériel réel de perte de contexte GPU.

## Chat

- Tests automatiques du chat : 19 / 19, incluant fragments UTF-8, erreurs SSE/HTTP, isolation, persona, annulation, timeout, secours après 429, attente sans premier token et réponse vide.
- Test réel dans le navigateur : réponse complète en anglais via `nvidia/nemotron-3.5-lightning:free`, secours actif affiché.
- Autre essai réel : 53 fragments reçus via Nemotron, premier texte à environ 92 secondes. Le modèle n’a pas respecté la langue néerlandaise lors de cet essai ; les instructions de langue ont ensuite été renforcées.
- Dernier essai après renforcement : Nemotron sélectionné, mais délai global de 120 secondes atteint sans texte. Diagnostic TIMEOUT affichable, aucune fausse réussite. La réponse néerlandaise réelle n’a donc pas été revalidée.
- Les erreurs de quota et la latence du service gratuit restent externes au site. Aucun modèle payant n’a été utilisé.

## Commandes

- Build Vite + pré-rendu : succès. Le moteur Three.js reste un chunk dynamique de plus de 500 Ko non compressés, signalé par Vite ; environ 159 Ko compressés.
- ESLint : succès.
- npm audit lors de l’ajout de Three.js : 0 vulnérabilité signalée.

Le site est une version locale à relire. Domaine de publication et identité légale restent à renseigner avant mise en ligne.

Contrôle final de production : les neuf routes renvoient HTTP 200 et une route inconnue HTTP 404. Dans le navigateur, le portfolio anglais pré-rendu s’hydrate sans erreur ni avertissement console, le WebGL est actif et le compteur local indique 60 images/s avec anticrénelage multisample. L’ancre VESPER déplace le document et la caméra au bon chapitre. Build, lint et 24 tests repassés après les derniers changements ; audit des textes traduits toujours sans chaîne française connue restante.


## Extension du parcours et validation finale

- Atelier central conservé pour le funnel ; aile studio et galerie supplémentaires, avec charpente, ouvertures, mobilier et panneaux de projets. Les trajectoires sont des arcs continus et parcourables dans les deux sens.
- Trois tests de parcours ajoutés : progression pendant toute la traversée visible, hauteurs variables et retour arrière, échantillonnage des courbes pour le dégagement des plafonds, ouvertures et installations, y compris le cadrage mobile. Total : 24 tests réussis.
- Contrôle visuel dans le navigateur : entrée et rotation autour de la table du studio ; traversée de l’atelier ; approche et retour autour de Mastermind ; passage vers VESPER ; galerie FrameForge. Les compteurs locaux ont indiqué 60 images/s sur ordinateur et 30 images/s en viewport mobile. Pas de mesure sur téléphone physique.
- Production anglaise : accès direct à FrameForge, WebGL actif, aucune erreur ni avertissement console observé sur ce contrôle.
- Agence néerlandaise contrôlée à 390 et 320 px. Un débordement causé par « documentassistenten » à 320 px a été corrigé : largeur du document égale à la largeur utile de 305 px (320 px avec la barre de défilement du navigateur).
- Mode sans animation contrôlé : les trois textes sont présents, position relative et hauteur naturelle. Réactivation du mouvement vérifiée. Les passages mobiles ne sont pas épinglés et gardent les trois textes affichés.
- Build et lint réussis. Les neuf HTML sont pré-rendus ; audit des textes connus en anglais et néerlandais sans traduction française résiduelle. Aucun nouvel appel réel à OpenRouter pendant cet ajustement de scène.
