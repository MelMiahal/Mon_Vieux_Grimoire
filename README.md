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
npm start
```

Le serveur Express écoute sur `http://localhost:4000`. Ses premières routes
sont `GET /` et `GET /api/health`. MongoDB n'est pas nécessaire pour cette
étape.