# Lumina - Application de partage d'images

Application web de type Instagram permettant aux utilisateurs de partager des images avec descriptions, hashtags et mentions.

## Prérequis

- Node.js >= 18.x
- npm >= 9.x
- Docker et Docker Compose

## Installation

```bash
git clone <url-du-repo>
cd ugram-h2026-team-12

npm install
```

## Scripts disponibles

```bash
npm start
npm run build
npm test
npm run test:cov
npm run format
npm run lint
```

## Lancer avec Docker

```bash
docker-compose up --build

docker-compose up -d --build

docker-compose down
```

L'application sera accessible sur `http://localhost:3000`

## Structure du projet

```
src/
├── __data__/           # Données JSON mockées
├── components/         # Composants React réutilisables
│   ├── Avatar/
│   ├── ConfirmModal/
│   ├── FormActions/
│   ├── FormField/
│   ├── ImageUpload/
│   ├── MentionText/
│   ├── PageHeader/
│   ├── PageLayout/
│   ├── PasswordInput/
│   ├── PostCard/
│   ├── SearchInput/
│   ├── Sidebar/
│   └── UserCard/
├── pages/              # Pages de l'application
│   ├── CreatePostPage/
│   ├── EditPostPage/
│   ├── HomePage/
│   ├── LoginPage/
│   ├── PostDetailPage/
│   ├── ProfilePage/
│   ├── SettingsPage/
│   ├── SignupPage/
│   └── UsersPage/
├── services/           # Services (auth, API)
├── types/              # Types TypeScript
└── utils/              # Utilitaires et helpers
```

## Fonctionnalités

- Authentification (login/signup)
- Gestion de profil utilisateur
- Consultation de la liste des utilisateurs
- Publication d'images avec description, hashtags et mentions
- Modification et suppression de ses publications
- Feed d'images trié par date
- Consultation des profils et images des autres utilisateurs

## Technologies utilisées

- React 19
- TypeScript
- React Router
- Formik + Yup (validation de formulaires)
- CSS (responsive design)
