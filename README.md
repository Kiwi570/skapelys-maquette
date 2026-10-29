# Skapelys — maquette « Chantier numérique »

Maquette statique (HTML, CSS, JavaScript, sans étape de construction) de la refonte du site
[skapelys.fr](https://skapelys.fr), agence web à Bourg-en-Bresse.
Version des feuilles de style et scripts : `?v=3`.

## Pages

| Fichier | Adresse |
|---|---|
| `index.html` | `/` |
| `creation-site-web-bourg-en-bresse.html` | `/creation-site-web-bourg-en-bresse` |
| `maintenance-site-wordpress-bourg-en-bresse.html` | `/maintenance-site-wordpress-bourg-en-bresse` |
| `404.html` | toute adresse inconnue |

Les pages Refonte, Référencement, Dépannage, Mentions légales et Politique de confidentialité
renvoient vers le site actuel.

## Bibliothèques hébergées avec le site

- GSAP 3.15 (ScrollTrigger, SplitText) : `assets/vendor/gsap/`
- OGL 1.0.11 (modules utilisés seulement) : `assets/vendor/ogl/`
- Polices variables WOFF2 (Unbounded, Geist, JetBrains Mono, licence OFL) : `assets/fonts/`
- Défilement fluide : petit module maison (`assets/js/modules/core.js`), le paquet Lenis
  n'ayant pas de fichier prêt à l'emploi sur GitHub et npm étant inaccessible à la construction.

## Mise à jour d'une version

Changer le numéro `?v=N` partout (pages et `import` des modules JavaScript), à l'identique.
Aucune règle Cache-Control dans `vercel.json` : Vercel revérifie chaque fichier à chaque visite.

## À retirer à la mise en ligne définitive

- La balise `<meta name="robots" content="noindex, nofollow">` de chaque page.
- L'en-tête `X-Robots-Tag` dans `vercel.json`.
- Les adresses `https://skapelys-maquette.vercel.app` des balises og:image et og:url (à remplacer par le domaine final).
- La mention « Maquette de démonstration » du pied de page et les mentions « simulé » des formulaires.
- Brancher le formulaire de devis sur un vrai service d'envoi.

## Données à confirmer avec le client

- Nombre d'avis : l'accueil actuel affiche 7, les autres pages et le widget 10 (la maquette affiche 10).
- Avis de Sofiane Massouab (même nom de famille que le fondateur) : retiré en attendant confirmation.
- Un avis cite « Adel Web Solutions » (ancien nom ?), repris tel quel.
- Formule One Page : fiche Google Business Profile et fonctionnalités avancées présentées comme non incluses (d'après la FAQ).
- Lien WhatsApp : numéro supposé identique au téléphone (07 71 13 99 91).
- Délai « sous 24 h ouvrées » : calculé comme le jour ouvré suivant, hors week-ends et jours fériés.
- L'adresse `/creation-site-web-bourg-en-bresse` sans « / » final sert une ancienne version (E-commerce dès 1 490 €, livraison 48-72 h).
- Captures mobiles d'Alp Park et KBM Taxi à fournir.

## Historique

- v3 : effets et transitions repris image par image. Rideau d'ouverture et de sortie visible (avec logo),
  liens internes sans .html (plus de redirection), prix sans saut de chiffre, accordéons sans à-coup,
  curseur recalé pendant le défilement, titres d'ouverture rendus au texte normal, parallaxe sans bord visible,
  menu téléphone animé avec focus piégé, hauteur du devis animée, carte et étoiles compatibles Safari,
  grille WebGL sans doublon à l'ouverture, en-tête sans chevauchement de 901 à 1180 px, formulaire collant réparé.
- v2 : audit complet. Contrastes et cibles tactiles corrigés, titres hiérarchisés (un seul H1 par page),
  photos des services dégagées, carte en double remplacée par la photo du bocage, trousseau visible,
  bouton pause sur les avis, écran des réalisations cliquable, barre d'avancement et indicateur de défilement,
  appel à l'action sous la FAQ, formulaire enrichi, boucles d'animation arrêtées hors écran,
  fiche entreprise schema.org (données réelles uniquement).
- v1 : première maquette (accueil, création, maintenance, 404).

## Images

- `assets/img/marque`, `mascotte`, `equipe`, `realisations` : images du site actuel.
- `assets/img/grok` : images générées avec Grok (aucune personne réelle, aucun texte).
- `assets/og` : images de partage 1200×630 composées pour chaque page.
