# Mon vieux Grimoire

## Lancer le projet

Le front-end et le back-end se lancent dans deux terminaux distincts.

Dans le premier terminal, depuis la racine du projet :

```sh
npm install
npm start
```

Dans le second terminal, installez et démarrez le back-end :

```sh
cd backend
npm install
Copy-Item .env.example .env
npm start
```

Le backend requiert Node.js 20.9 ou une version ultérieure pour Sharp.
Par défaut, le fichier `.env.example` utilise la base MongoDB locale
`mon-vieux-grimoire`. Pour utiliser MongoDB Atlas ou un autre serveur,
remplacez `MONGODB_URI` dans `.env` par votre URI de connexion.

Définissez également `JWT_SECRET` dans `.env` avec une clé privée longue et
aléatoire. Ne partagez pas ce fichier et ne le poussez pas sur GitHub.
`PUBLIC_BASE_URL` indique l'adresse publique utilisée pour les couvertures
(par défaut `http://localhost:4000` en développement).

Le serveur Express se connecte à MongoDB avant d'écouter sur
`http://localhost:4000`.

## Authentification

- `POST /api/auth/signup` crée un utilisateur et stocke son mot de passe haché.
- `POST /api/auth/login` vérifie les identifiants et renvoie `userId` et un
  token JWT.
- `GET /api/auth/me` est une route protégée de vérification. Elle attend un
  en-tête `Authorization: Bearer <token>`.

## Livres et images

Les livres sont consultables sur `GET /api/books`, `GET /api/books/:id` et
`GET /api/books/bestrating`. Les utilisateurs authentifiés peuvent ajouter un
livre avec `POST /api/books`. La note initiale est facultative et comprise
entre 1 et 5 ; sans note, la moyenne commence à 0. Le créateur est enregistré
comme auteur de cette note. Les utilisateurs peuvent modifier leurs livres avec
`PUT /api/books/:id` ou le supprimer avec `DELETE /api/books/:id`. Les
utilisateurs authentifiés peuvent noter un livre une seule fois avec
`POST /api/books/:id/rating` et une note entière de 1 à 5. Les formulaires
d'ajout et de modification envoient les champs du livre dans le champ
multipart `book` et la couverture dans `image`.
Les couvertures JPEG, PNG et WebP sont redimensionnées à 1200 pixels maximum,
converties en WebP et servies depuis `/images`.