# Mon carnet de recettes

Carnet de recettes en français. La lecture est publique. L'ajout d'une fiche demande une connexion administrateur. Les recettes sont dans Neon PostgreSQL, les photos dans Vercel Blob.

## Fonctions

- Liste des recettes en cartes
- Fiche d'une recette
- Formulaire : titre, ingrédients, préparation, photo
- Connexion par mot de passe administrateur (cookie httpOnly signé)
- Photos JPEG, PNG ou WebP, 4 Mo maximum, contrôlées sur le serveur

## Lancer en local

```bash
npm install
npm run dev
```

Copiez `.env.example` vers `.env.local` et renseignez les variables sur votre machine. Ne commitez jamais ce fichier.

## Variables d'environnement

Noms uniquement, toutes côté serveur :

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `AUTH_SECRET`
- `ADMIN_PASSWORD`

`AUTH_SECRET` sert à signer le cookie de session. Choisissez une longue chaîne aléatoire. `ADMIN_PASSWORD` est le mot de passe de l'unique administrateur.

## Base de données

Exécutez `db/schema.sql` une fois dans l'éditeur SQL Neon, après la création de la base. Le script crée la table `recipes`.
