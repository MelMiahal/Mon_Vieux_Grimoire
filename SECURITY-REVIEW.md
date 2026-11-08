# Revue finale de sécurité et de livraison

## Résumé

La revue du code applicatif n'a pas identifié de vulnérabilité exploitable dans les flux examinés. L'audit npm frontend a initialement signalé 84 avis (6 critiques, 35 élevés, 22 modérés et 21 faibles). Après `npm audit fix` sans option forcée, le lockfile a été mis à jour et l'audit signale encore 34 avis : 11 élevés, 7 modérés et 16 faibles, sans avis critique.

Le backend ne présente aucun avis dans ses dépendances de production. Les correctifs restants du frontend ne sont pas appliqués automatiquement : npm propose notamment une mise à niveau majeure de React Router et une mise à niveau de `react-scripts` vers `0.0.0`. Une migration ou une mise à niveau majeure doit être évaluée et testée séparément.

## Avis de dépendances frontend restants

La majorité des paquets concernés sont des dépendances transitives de React/Create React App. `react-router-dom` et `react-scripts` sont aussi déclarés directement dans le manifeste frontend ; React Router est utilisé à l'exécution.

| Sévérité | Nombre | Paquets concernés |
|---|---:|---|
| Élevée | 11 | `@svgr/plugin-svgo`, `css-select`, `nth-check`, `postcss`, `rollup-plugin-terser`, `serialize-javascript`, `svgo`, `webpack-dev-middleware`, `webpack-dev-server`, `workbox-build`, `ws` |
| Modérée | 7 | `css-minimizer-webpack-plugin`, `react-router`, `react-router-dom`, `react-scripts`, `resolve-url-loader`, `sockjs`, `uuid` |
| Faible | 16 | `@jest/core`, `@rollup/plugin-node-resolve`, `@svgr/webpack`, `@tootallnate/once`, `deepmerge`, `fork-ts-checker-webpack-plugin`, `http-proxy-agent`, `jest`, `jest-cli`, `jest-config`, `jest-environment-jsdom`, `jest-runner`, `jest-watch-typeahead`, `jsdom`, `react-dev-utils`, `workbox-webpack-plugin` |

Avis notables relevés par npm :

- React Router : redirection ouverte et injection de constructeur. npm propose `react-router-dom@7.18.5`, changement majeur depuis la version 6 utilisée par le projet.
- `postcss`, `serialize-javascript`, `webpack-dev-middleware`, `webpack-dev-server`, `nth-check`, `svgo` et `ws` : avis de sécurité élevés dans la chaîne de dépendances.
- Plusieurs autres avis concernent Jest, jsdom, Workbox et les outils de compilation de Create React App.

Les versions précises, plages affectées et avis associés sont consultables via `npm audit`. Aucun correctif forcé n'a été appliqué.

## Vérifications exécutées

- Frontend : `npm test -- --watchAll=false --runInBand` — 5 suites, 7 tests réussis.
- Frontend : `npm run build` — build réussi, avec avertissements ESLint existants (`alert`, `confirm`, `console`) et avertissements de dépréciation.
- Backend : `npm test --prefix backend` — 21 tests réussis.
- Backend : `npm audit --prefix backend --omit=dev` — 0 vulnérabilité.
- `git diff --check` — aucune erreur d'espacement.

## Points à traiter avant un déploiement public

- Le `Dockerfile` frontend utilise Node 19, qui est ancien. Pour exécuter le backend, il faut un runtime Node `>=20.9`, comme le déclare son manifeste.
- L'URL de l'API frontend est codée en dur sur `http://localhost:4000`. Elle devra être configurée pour l'hôte du backend en production.
- La résolution des 34 avis frontend nécessite une décision sur la migration de l'outillage Create React App et l'évolution majeure de React Router. Ne pas utiliser `npm audit fix --force` sans migration et validation dédiées.
