# Mon vieux Grimoire

## Lancer le projet

Le front-end et le back-end se lancent dans deux terminaux distincts.

Dans le premier terminal, depuis la racine du projet :

```sh
npm install
npm start
```

Dans le second terminal, préparez puis lancez le back-end :

```sh
cd backend
npm install
Copy-Item .env.example .env
npm start
```

Le fichier `.env` contient l'adresse de connexion MongoDB. La configuration
fournie utilise une base MongoDB locale nommée `mon-vieux-grimoire`. Adaptez
`MONGODB_URI` dans `.env` si votre MongoDB se trouve ailleurs.

Le serveur back-end écoute sur le port `4000`, utilisé par le front-end.