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

Assurez-vous qu'un serveur MongoDB local est démarré. Le fichier `.env` fourni
utilise la base `mon-vieux-grimoire` sur la machine locale ; modifiez
`MONGODB_URI` si votre base est hébergée ailleurs.

Le serveur Express se connecte à MongoDB avant d'écouter sur
`http://localhost:4000`.