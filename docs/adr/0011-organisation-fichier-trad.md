# 11. Organisation des fichiers de traductions

Date : 2020-07-09

## État

En cours d'expérimentation

## Contexte

L'application App de Pix va avoir une version anglaise. Pour cela, nous devons traduire les textes présents sur l'application `mon-pix`.
Pour gérer la traduction, nous utilisons l'add-on Ember `ember-intl`. Les traductions sont disponibles au format JSON dans le dossier `translations`.
Le fichier JSON de la langue française sera directement envoyé à notre traductrice. 

## Décision

### Fichiers de traductions
Les textes se trouvent dans des fichiers uniques `fr.json`/`en.json`.

Les textes sont rangés par ordre alphabétique.

Les fichiers de traduction contiennent :
- Une partie `common` : tous les mots que l'on peut retrouver dans toutes les pages de Pix (ex: Pix, Annuler, Obligatoire), les mots liés à des composants réutilisés partout
- Une partie `navigation` : lien des menus, liens "Retour à l'accueil"
- Une partie `api-error-messages` : les traductions des erreurs remontées par l'API
- Une partie pour les pages `pages` : (ex : `pages.list-certifications`, `pages.challenges`)

Dans la partie `common` :
- Une partie `actions` avec les actions disponibles à plusieurs endroits (Annuler, etc...)
- Une partie `fields` avec les champs de formulaire de la page

Dans chaque page : 
- Un `title` avec le titre de la page
- Une partie `actions` avec les boutons et les actions possibles sur les pages

Les variables utilisées doivent aider à comprendre le contexte de la phrase.
- Les variables doivent être écrites en kebab-case (ex : `certification-header-title)
- Pour gérer les dates (et les formats) : `{{format-date this.certification.date format='L'}}`. Les formats sont dans le fichier `mon-pix/app/formats.js`
- Pour gérer le pluriel : `"description": "{ daysBeforeReset, plural, =0 {0 day} =1 {1 day} other {# days} } left before reset."`

Durant les traductions, le texte en attente de traduction peut être du [Lorem Ipsus](https://fr.lipsum.com/),  de la traduction rapide ou garder le texte en français. 

### Tests

- Le `setupIntl` pour les tests d'intégration se fait dans `setupRenderingTest`
- Les tests ont pour local `fr`
- On ne test pas les traductions (le plugin vérifie la présence de la traduction) 

## Références : 
- https://ember-intl.github.io/ember-intl/





