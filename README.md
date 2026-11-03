# Ma Chambre — Inventaire LENVII (GitHub Pages)

Site statique en français, compatible GitHub Pages et lecteurs USB LENVII 1D/2D/QR en mode **USB Keyboard / USB-KBW**.

## Publication

1. Décompresser le ZIP.
2. Déposer **index.html, style.css, app.js et extras.js** à la racine du dépôt GitHub.
3. GitHub → Settings → Pages → Deploy from a branch → main / (root).
4. Ouvrir l'URL GitHub Pages en HTTPS.

## Fonctions

- Barre latérale (`aside`), recherche, filtres, catégories, images URL, prix, quantités, sauvegardes JSON/CSV.
- Scanner USB LENVII : cliquer **Activer le scan USB** puis lire le code. Le lecteur doit fonctionner comme un clavier. Le suffixe Entrée est recommandé.
- Correction QWERTY → AZERTY pour les codes numériques. **Attention** : désactiver la correction pour certains QR contenant du texte.
- Plan interactif par zones : créer une zone, renseigner les emplacements comme `Armoire > Étagère 2`, cliquer sur une zone pour filtrer l'inventaire.
- Alertes de stock : seuil réglable sur chaque fiche (2 par défaut).
- Historique local : création, modification, suppression et mouvements +1/-1; l'historique commence avec cette version.
- Plusieurs photos par objet via URLs HTTPS/HTTP, sans upload de fichiers.
- Étiquettes QR individuelles et feuille imprimable. Les QR ouvrent l'URL de la fiche, mais la fiche n'est accessible que sur un navigateur qui contient les données correspondantes.
- Recherche facultative d'un EAN/UPC sur Open Food Facts (principalement produits alimentaires). Les résultats peuvent être absents, incomplets ou erronés et nécessitent Internet. Aucun catalogue universel de tous les objets achetés n'est fourni.
- Scan caméra via html5-qrcode (bibliothèque externe), QR via qrcode (bibliothèque externe).

## Conservation des données

Les fiches sont conservées dans la clé localStorage historique `ma-chambre-inventaire-v1`. Cette version ne supprime pas l'inventaire existant **sur le même navigateur et la même origine GitHub Pages**. L'historique et les zones ont des clés séparées. Les anciens exports JSON sont importables. Le nouveau JSON exporte les fiches, les zones et l'historique.

**Avant de remplacer le site, exportez votre inventaire JSON.** Une navigation privée, un autre navigateur, un autre ordinateur ou un changement d'URL GitHub Pages ne partagent pas le même stockage. GitHub Pages ne synchronise pas les données et les QR ne créent pas de fiches publiques. Une synchronisation nécessiterait un backend.

## Dépannage

- Scanner envoyant `&é"...` : passer le lecteur en clavier français AZERTY ou cocher la correction numérique dans l'application.
- Scanner non détecté : tester dans Bloc-notes/TextEdit et vérifier le mode USB-KBW; garder le champ de scan actif.
- Bibliothèques QR/caméra indisponibles : vérifier la connexion aux CDN.
- Recherche produit absente : Open Food Facts ne référence pas nécessairement votre objet.
- Images absentes : URL non accessible, blocage anti-hotlink ou image supprimée.
