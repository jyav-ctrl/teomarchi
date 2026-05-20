# TEOMARCHI - Structure du projet

Ce dossier est la version active du projet TEOMARCHI et le seul dossier a utiliser pour les modifications GitHub.

## Dossier actif

```text
je-veux-que-tu-te-connectes/
```

Contient l'application publique, les regles Firebase, les tests et l'historique Git connecte a :

```text
https://github.com/jyav-ctrl/teomarchi
```

## Organisation locale recommandee

Dans le dossier parent `codes /`, les copies non actives sont rangees hors du projet principal :

```text
codes /
├── je-veux-que-tu-te-connectes/              # projet actif GitHub
├── _archives/
│   ├── 2026-05-10-je-veux-que-tu-te-connectes/
│   └── teomarchi-ancienne-version/
└── _prototypes/
    └── code-moi-la-logique-pure-javascript/
```

## Regles de travail

- Modifier uniquement `je-veux-que-tu-te-connectes/` pour les changements destines a GitHub.
- Conserver `_archives/` comme snapshots historiques, sans developpement actif.
- Conserver `_prototypes/` pour les essais separes qui ne doivent pas etre deployes directement.
- Ne pas copier manuellement des fichiers entre versions sans comparer les differences.

