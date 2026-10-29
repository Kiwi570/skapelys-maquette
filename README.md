# Skapelys — maquette « Chantier numérique »

Maquette statique (HTML, CSS, JavaScript, sans étape de construction) de la refonte du site
[skapelys.fr](https://skapelys.fr), agence web à Bourg-en-Bresse. Site complet : 8 pages et une page 404,
aux mêmes adresses que le site actuel (aucune redirection à prévoir pour le référencement).
Version des feuilles de style et scripts : `?v=5`.

## Pages

| Fichier | Adresse |
|---|---|
| `index.html` | `/` |
| `creation-site-web-bourg-en-bresse.html` | `/creation-site-web-bourg-en-bresse` |
| `refonte-site-internet-bourg-en-bresse.html` | `/refonte-site-internet-bourg-en-bresse` |
| `referencement-seo-bourg-en-bresse.html` | `/referencement-seo-bourg-en-bresse` |
| `maintenance-site-wordpress-bourg-en-bresse.html` | `/maintenance-site-wordpress-bourg-en-bresse` |
| `depannage-site-wordpress-bourg-en-bresse.html` | `/depannage-site-wordpress-bourg-en-bresse` |
| `mentions-legales.html` | `/mentions-legales` |
| `politique-de-confidentialite.html` | `/politique-de-confidentialite` |
| `404.html` | `toute adresse inconnue` |

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
- Mentions légales : mettre à jour l'hébergeur si le site final n'est plus chez IONOS (la maquette est sur Vercel).

## Données à confirmer avec le client

- Nombre d'avis : l'accueil actuel affiche 7, les autres pages et le widget 10 (la maquette affiche 10).
- Avis de Sofiane Massouab (même nom de famille que le fondateur) : retiré en attendant confirmation.
- Un avis cite « Adel Web Solutions » (ancien nom ?), repris tel quel.
- Formule One Page : fiche Google Business Profile et fonctionnalités avancées présentées comme non incluses (d'après la FAQ).
- Lien WhatsApp : numéro supposé identique au téléphone (07 71 13 99 91).
- Délai « sous 24 h ouvrées » : calculé comme le jour ouvré suivant, hors week-ends et jours fériés.
- L'adresse `/creation-site-web-bourg-en-bresse` sans « / » final sert une ancienne version (E-commerce dès 1 490 €, livraison 48-72 h).
- Politique de confidentialité : contenu du site actuel, reformulé fidèlement ; à faire relire par le client.
- Le site actuel affiche un bandeau « Nous utilisons Google Analytics… » alors que sa politique indique ne pas utiliser
  Google Analytics ni de cookies de suivi. La maquette n'utilise aucun cookie : à trancher avant la mise en ligne.
- La politique mentionne Trustindex pour les avis ; la maquette affiche les avis sans service tiers.
- Captures mobiles d'Alp Park et KBM Taxi à fournir.
- Pages Refonte, Référencement et Dépannage : textes repris du site actuel. Le comparateur avant/après, la page de résultats
  Google et le diagnostic animé sont des démonstrations illustratives, signalées comme telles.

## Historique

- v5 : images d'ouverture dédiées (Grok) pour les pages Refonte, Référencement, Dépannage et les deux pages légales.
- v4 : site complet. Nouvelles pages Refonte (comparateur avant/après), Référencement SEO (page de résultats animée,
  six chantiers), Dépannage (diagnostic animé, étapes, pannes fréquentes), Mentions légales et Politique de
  confidentialité (sommaire qui suit la lecture). Menu Services déroulant, tous les liens internes au site.
- v3 : effets et transitions repris image par image (rideau, liens sans .html, compteurs, accordéons, curseur,
  parallaxe, menu téléphone, formulaire, Safari, grille WebGL, en-tête de 901 à 1180 px).
- v2 : audit complet (contrastes, cibles tactiles, titres, visuels, pause des avis, schema.org…).
- v1 : première maquette (accueil, création, maintenance, 404).

## Images

- `assets/img/marque`, `mascotte`, `equipe`, `realisations` : images du site actuel.
- `assets/img/grok` : images générées avec Grok (aucune personne réelle, aucun texte).
- `assets/og` : images de partage 1200×630 composées pour chaque page.
