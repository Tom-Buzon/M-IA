# Attic-Ai : direction et sources

## Intention

La marque vient du grenier où Tom a commencé. Le site doit montrer un atelier de construction et de conseil, avec des réalisations concrètes et une variété de disciplines. La landing ne fait pas la promotion d’un projet particulier. Le portfolio porte Mastermind.

Trois registres liés par la typographie et le logo :
- Accueil : photo d’ambiance sombre, bois, lumière chaude et bleu de fenêtre. Besoin → approche → capacités → origine → objections → brief.
- Agence : fond clair et encre sombre, détails de missions, critères de mesure, parcours de contact. Aucune reprise des tarifs historiques non validés.
- Portfolio : chapitres sombres, couleurs liées aux projets, variations d’échelle, graphe et storyboard interactifs, parallax faible sur desktop. Défilement natif et mode mouvement réduit.

Les contenus restent visibles sans animation. Les mouvements ne constituent pas un prérequis à la lecture. Les interactions au survol ont aussi des états au clavier.

## Skills appliqués

Installés dans C:/Users/suean/.codex/skills :
- cro — coreyhaines31/marketingskills : parcours de conversion, une prochaine action claire.
- copywriting — même source : langage concret, promesses vérifiables, réponses aux objections.
- site-architecture — même source : trois pages et rôles éditoriaux distincts.
- editorial-portfolio-chapters — MengTo/Skills : études de cas en chapitres, alternance des échelles et contextes.
- cinematic-scroll-storytelling — MengTo/Skills : narration au défilement, mouvements limités, version statique complète.

## Sources de contenu

Ancien site récupéré dans Git, portfolio HTML fourni, README locaux de Mastermind-V2, GameSense/VESPER, Clip Generator/FrameForge ; rendu Blender issu du projet LeidenHouse. Les projets historiques sont présentés comme archives, sans reprendre les pourcentages, durées ou résultats non vérifiés. 3DGenStudio est un outil tiers, pas une création attribuée à Tom.

## Médias

- public/images/attic-studio.webp : illustration d’ambiance générée avec imagegen, pas une photographie du vrai atelier. Prompt : grenier européen, poutres sombres, fenêtre de toit bleu nuit, établi avec lampe chaude à droite, espace sombre à gauche, quelques outils électroniques et clavier MIDI, photographie architecturale éditoriale, sans personne, logo ou texte.
- public/images/vesper.webp : conversion WebP de GameSense/tests/vesper-map-fr.png. Capture réelle de la carte développeur et du guidage LIA.
- public/images/blender-room.webp : conversion WebP de LeidenHouse/1 floor/model/v02/output/04_bureau.png. Rendu réel, sans plan coté ni adresse.
- Graphe Mastermind et storyboard FrameForge : illustrations interactives de principes, légendées comme telles.

Les originaux n’ont pas été modifiés. Poids cumulé des trois images : environ 218 Ko.

## Références de mouvement — septembre 2026

Demandées par Tom et étudiées dans le navigateur :
- https://www.boonglobal.io/ : navigation compacte puis déployée, typographie décodée, détails de signal et compositions superposées.
- https://emotion-agency.com/ : sentiment de déplacement dans un lieu, ambiance immersive et continuité de visite.

Les couleurs, illustrations et contenus de ces sites ne sont pas repris. La direction Attic-Ai repose sur un grenier habité : bois, encre sombre, métal patiné, lumière de travail chaude et lumière froide des fenêtres. La page agence conserve ses surfaces de lecture claires.

Après la demande d’une expérience plus vivante, la scène est devenue un espace WebGL continu, plutôt qu’un fond de particules en 2D. Caméra au défilement, poussière avec profondeur, réseau suspendu, formes d’onde, bobines et séquences de montage animées. Le mobilier comprend charpente assemblée, bibliothèque, fauteuil à roulettes, clavier, souris, tasse, carnet, câbles, carte électronique, oscilloscope, casque, rack et radiateur. Matières et détails sont générés localement par le code du projet ; aucune banque de modèles n’a été intégrée.

Les étapes se calent sur la position réelle des sections, y compris après traduction. Les passages immersifs possèdent des liens pour rejoindre directement le contenu. Le contenu professionnel n’est pas caché dans le canvas. Le mode sans animation conserve une vue fixe et supprime les passages longs.

Le décor est une interprétation stylisée de l’atelier et non un relevé du logement personnel de Tom. Les visuels des vrais projets restent distincts et légendés.

Documentation technique : https://threejs.org/docs/ ; https://openrouter.ai/docs/guides/best-practices/reasoning-tokens

## Parcours élargi — ajustement du 22 septembre

Le grenier central reste le lieu du funnel. Deux volumes supplémentaires ont été construits : une aile studio à gauche (16 × 18 unités) et une galerie à droite (16 × 41 unités). Ils ne remplacent pas les stations de l’atelier initial. Chaque aile possède plancher, charpente, pignons, fenêtres et mobilier. Le studio accueille table de cadrage, tableau, bibliothèque, poste de travail et coin d’échange. La galerie ajoute quatre installations, des archives et des panneaux consacrés aux projets ; les captures VESPER et Blender proviennent des mêmes fichiers locaux que les études de cas.

Les trois documents conservent leurs rôles : accueil pour le funnel, agence pour les services et la méthode, portfolio pour les projets. Mastermind reste dans le portfolio. Les parcours et regards sont définis séparément dans `src/scene/tour.js`, puis interpolés sur des courbes centripètes. Les arcs passent par les ouvertures et autour des stations, avec des changements de côté dans les intervalles libres. Le champ de vision mobile s’élargit sans décaler la caméra à travers les murs.

Sur ordinateur, les passages occupent 195 svh : une composition reste visible pendant le travelling et déroule trois courts temps de narration. La caméra continue pendant l’entrée et la sortie du passage ; il n’y a ni scroll-snap ni verrouillage d’une scène. Les positions viennent des dimensions réelles du HTML, après traduction. Les liens permettent de rejoindre directement la section suivante. Sur écran étroit, écran bas, sans WebGL ou en mouvement réduit, tous les textes restent visibles et les sections reprennent leur hauteur naturelle.

La poussière et les installations gardent leur animation propre lorsque le scroll s’arrête. Le déplacement de caméra demeure lié au scroll. La méthode de l’agence est également lisible sur une vue en mouvement du studio ; les fiches services gardent leurs surfaces claires.
