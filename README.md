# Squelette de site — Asmaa Belh

Site statique (HTML / CSS / JS, sans dépendance ni build). Ouvrir `index.html` dans un navigateur suffit.

## Arborescence

| Page | Fichier | Rubrique du brief |
|---|---|---|
| Accueil | `index.html` | Vue d'ensemble : hero, Asmaa, univers, prochaine retraite, livres, podcast, newsletter |
| Asmaa | `asmaa.html` | Qui est Asmaa (#qui) · Son parcours (#parcours) · Son approche (#approche) · Formations et pratiques (#formations) |
| Programmes | `programmes.html` | Sexy & Sacrée · Cartographie · Avoir une conversation difficile · Comprendre ma femme |
| Immersions & Retraites | `immersions-retraites.html` | Présentation · Dates · Lieux · Programme · Tarifs · Inclus · Inscription · Photos/vidéos |
| ORR | `orr.html` | Découvrir l'expérience (#experience) · Les rituels (#rituels) · La boutique (#boutique) |
| Podcasts | `podcasts.html` | Les derniers épisodes (#derniers) · Tous les podcasts (#tous) |
| Livres | `livres.html` | Sexy & Sacrée · Love Programme · L'ouvrage autour de l'argent (#argent) · Tous les livres |
| Galerie | `galerie.html` | Grille filtrable de photos |
| Contact | `contact.html` | Email · téléphone · réseaux · formulaire |

Le header, le menu plein écran numéroté (réf. maquette) et le footer sont générés par `assets/js/main.js` : l'arborescence se modifie dans la constante `MENU`.

## Repères « À fournir »

Chaque contenu manquant est signalé par un bloc en pointillés avec une étiquette. Le bouton flottant en bas à droite permet de masquer ces repères pour juger la maquette « propre ».

## Checklist des contenus à recevoir

**Asmaa** : textes reçus et intégrés (biographie, approche, méthodes & pratiques, venir comme vous êtes). Reste : photos professionnelles.

**Immersions & Retraites** : textes Retraites et Immersions reçus et intégrés. Reste : photos des lieux, dates des prochaines retraites, tarifs éventuels, outil de liste d'attente.

**Programmes** : pour chacun des 4 programmes : présentation, format, durée, tarif, lien d'inscription, visuel.

**ORR** : signification, présentation de l'expérience, liste des rituels, produits de la boutique, liens (site + boutique), visuels.

**Podcasts** : nom, présentation, cover, liens plateformes (Spotify, Apple, YouTube…), lien du dernier épisode à intégrer.

**Livres** : couverture HD, résumé, extrait, liens d'achat, avis, pour chaque livre (dont le titre exact de l'ouvrage autour de l'argent).

**Galerie** : 11 images extraites des vidéos (scène, public, coulisses) avec visionneuse. Reste : photos des retraites et portraits.

**Contact** : email, téléphone (si souhaité), Instagram, YouTube, Spotify, TikTok, autres.

## Charte provisoire

- Direction validée : **à l'identique des visuels de campagne** (noir, marbre, or). Les 3 pistes claires comparées au départ sont archivées hors du site (`../archives/directions.html`).
- Couleurs : noir `#0b0a0a`, bordeaux `#3d0f1a`, or `#d4b46a` (dégradé or pour le logo, le titre et les boutons), ivoire `#f5efe4`.
- Photos : dans `assets/img/`. Les affiches sources (1024 px) ont été agrandies x4 par IA (Real-ESRGAN, script dans le scratchpad de session) avant recadrage ; pour un rendu optimal, remplacer par les exports HD dès réception.
- Typographies : Cormorant Garamond (titres), Playfair Display (titre d'accueil), Jost (texte). Hébergées sur le site dans `assets/fonts/` (licence SIL OFL), déclarées dans `assets/css/fonts.css`.
- Tout est ajustable dans les variables en tête de `assets/css/style.css`.

## Technique

- **Aperçu de lien** (WhatsApp, iMessage, réseaux) : `assets/img/og-image.jpg`, déclaré dans chaque page.
- **Icônes** : `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (monogramme AB).
- **Pages ajoutées** : `mentions-legales.html`, `confidentialite.html` (champs légaux à compléter), `404.html`.
- **Accessibilité** : lien « Aller au contenu », page active signalée, menu utilisable au clavier (focus piégé, Échap pour fermer), animations coupées si l'utilisateur les désactive.
- **Brouillon non indexé** : `noindex` sur toutes les pages et `robots.txt`. À retirer à la mise en production.
- **Couvertures de livres** : copies locales dans `assets/img/livre-*.jpg` (plus d'appel aux images Amazon).
- **Images WebP** : chaque JPEG a sa version `.webp` (55 % plus légère), servie via `<picture>` avec le JPEG en secours. Pour ajouter une image, générer aussi sa version WebP.
- **Galerie** : `assets/img/galerie/` (pleine taille + `-thumb`), visionneuse au clic (flèches, Échap, glisser sur mobile).
- **Données structurées** (schema.org) : Personne et Site sur l'accueil, Personne sur la page Asmaa, les deux Livres sur la page Livres.
- **Formulaires** (contact, liste d'attente, lettre) : validation en français, piège anti-robots, mention de confidentialité. Pour les rendre réels, coller l'adresse d'envoi du service choisi (Formspree, Getform, Basin…) dans `FORM_ENDPOINTS` en haut de la section formulaires de `assets/js/main.js`. Vide = mode démonstration.
- **Suivi et saisie des contenus** : `a-fournir.html` liste automatiquement toutes les zones « À fournir » du site. La cliente peut écrire ses textes sous chaque élément (sauvegarde automatique dans son navigateur, progression par page), puis télécharger un fichier `.txt` de ses réponses à renvoyer avec ses photos. Page non liée dans le menu.
- **Liens externes surveillés** : `python3 tools/check.py --externes` vérifie que les vidéos Dropbox existent toujours (taille réelle du fichier) et que les fiches Amazon répondent. GitHub le lance chaque lundi à 7 h (UTC) ; en cas de lien disparu, GitHub envoie un email au propriétaire du dépôt. Amazon bloque parfois les robots : c'est alors un simple avertissement.
- **Contrôle qualité automatique** : `python3 tools/check.py` vérifie liens, ancres, images, textes alternatifs, métadonnées, versions WebP et absence de ressources externes. Il tourne aussi sur GitHub à chaque publication (onglet Actions, workflow « Vérification du site »).
- **Mouvements** : entrée progressive du texte d'en-tête, zoom lent sur la photo, filets dorés animés, reflet sur les boutons, bouton de retour en haut. Tout est coupé si le visiteur a réduit les animations dans son système.
- **Mode présentation** : ajouter `?presentation` à n'importe quelle adresse (ex. `index.html?presentation`) pour montrer le site sans bandeau ni consignes « À fournir ». Le réglage est mémorisé dans le navigateur ; `?presentation=0` revient au mode travail. En présentation (et automatiquement une fois le site en production), chaque consigne est masquée avec le bloc qui la contient s'il devient vide, les boutons sans destination mènent à Contact, et les pages encore vides (ORR, Podcasts) affichent un bloc « Bientôt ». Attributs utiles : `data-pres` (texte de remplacement), `data-pres-hide` (bloc masqué), `data-pres-only` (bloc affiché seulement en présentation).
- **Mise en production** : `python3 tools/mise-en-ligne.py --domaine https://www.domaine.fr` simule le passage en ligne (retrait du noindex et du bandeau, robots.txt, sitemap.xml, domaine dans les liens et données structurées, fichier CNAME). Ajouter `--confirmer` pour appliquer, puis `python3 tools/check.py` et publier.
- **Comparateur de rendu** : `tools/comparer-rendu.js` vérifie qu'une modification de `style.css` ne change rien à l'écran (mode d'emploi en tête du fichier). Utilisé pour le nettoyage de la feuille de style : 25 règles mortes supprimées, 21 doublons fusionnés, 0 écart sur 12 pages à 3 largeurs.
- **Sans JavaScript** : un menu et un pied de page de secours en HTML simple (remplacés par le script dès qu'il se charge) et une règle `<noscript>` gardent tout le contenu visible et les pages reliées entre elles, pour les robots d'indexation et les navigateurs qui bloquent les scripts.
- **Test de lecture des vidéos** : `sh tools/tester-videos.sh` (site servi en local) lance un Chrome sans fenêtre, clique sur les boutons de lecture et vérifie que les vidéos avancent réellement. Utile car Chrome suspend les vidéos dans les onglets en arrière-plan, ce qui fausse les tests manuels dans ces conditions.
- **Tests de bout en bout** : `node tools/e2e.js` (site servi en local, Node 22+, Chrome) vérifie dans un vrai navigateur 22 comportements : chargement sans erreur des 12 pages, aucun débordement sur mobile, menu au clavier, formulaires, préremplissage, liste d'attente, visionneuse, mode présentation, repères de section, retour en haut, page de suivi. Lancés aussi par GitHub à chaque publication.
- **Originaux des visuels** : hors du site, dans `../sources-images/`.
