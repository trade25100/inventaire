# Ma Chambre — Inventaire GitHub Pages

Site statique pour inventorier les objets de votre chambre : nom, quantité, code-barres ou QR, emplacement précis, image URL, catégorie, prix, date d'achat, notes, recherche, filtres, export/import JSON et export CSV.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub public (par exemple `ma-chambre`).
2. Ajoutez **index.html**, **style.css** et **app.js** à la racine du dépôt (vous pouvez aussi déposer tous les fichiers de ce ZIP).
3. Dans le dépôt, allez à **Settings > Pages**.
4. Dans **Build and deployment**, sélectionnez **Deploy from a branch**, branche **main**, dossier **/(root)**, puis **Save**.
5. Ouvrez `https://VOTRE-PSEUDO.github.io/ma-chambre/` après publication.

## Utilisation

- Ajoutez vos objets et leur emplacement (ex. `Armoire > tiroir 2 > boîte bleue`).
- Cliquez **Scanner un code** pour scanner un QR ou un code-barres avec votre téléphone.
- Cliquez **QR** sur une fiche pour générer et imprimer son étiquette.
- Sauvegardez souvent avec **Exporter JSON** ; restaurez avec **Importer JSON**.

## Limites importantes

- Les données sont enregistrées uniquement dans le `localStorage` du navigateur et de l'appareil utilisé. GitHub Pages **ne synchronise pas** les inventaires entre appareils.
- Un QR imprimé renvoie à une fiche par identifiant, mais cette fiche doit déjà exister dans le navigateur qui scanne (ou avoir été importée).
- Les URL d'images doivent être publiques et accessibles ; les fichiers images locaux ne sont pas téléversés.
- Le scanner et les QR utilisent des bibliothèques CDN : connexion Internet nécessaire au chargement de ces fonctionnalités.
- Pour une vraie synchronisation multi-appareils, ajouter ultérieurement un service de base de données et une authentification (ex. Supabase/Firebase).
- Ne publiez pas vos sauvegardes JSON dans un dépôt GitHub public : elles peuvent contenir des informations privées.


## Scanner USB LENVII (Windows / Mac)

1. Brancher le lecteur LENVII à l'ordinateur par USB.
2. Configurer le lecteur en mode **USB Keyboard / USB-KBW** avec les codes de configuration de son manuel (pas USB-COM / RS232).
3. Ouvrir le site GitHub Pages, cliquer **Activer le scan USB**, puis présenter un code-barres ou QR au lecteur.
4. Pour un code connu : bouton **+1 en stock** ou **Modifier la fiche**. Pour un nouveau code : bouton **Créer une fiche**.
5. Si possible, activer le suffixe **Enter / CR** sur le scanner. Sans suffixe, le site attend 450 ms après la dernière frappe.

Le navigateur reçoit les codes comme du texte saisi au clavier ; aucune API USB spéciale n'est nécessaire. Laisser le curseur dans le champ « Code lu par le scanner » pendant le scan. Les QR contenant des URL sont traités comme des codes texte. Le scanner n'identifie pas automatiquement le nom du produit : celui-ci doit être saisi dans la fiche.

## Correction automatique AZERTY / QWERTY

Dans la section Scanner USB, cochez **Corriger automatiquement les chiffres reçus en AZERTY**. Les caractères `& é " ' ( - è _ ç à` sont convertis respectivement en `1 2 3 4 5 6 7 8 9 0` **uniquement** si le code complet ressemble à une suite numérique mal interprétée. Le code corrigé est utilisé pour la recherche et l'enregistrement. Désactivez l'option pour les QR textuels ou les codes contenant réellement des tirets ou symboles : ces cas peuvent être ambigus. La meilleure solution reste de régler le scanner sur **French / AZERTY** dans son manuel.
