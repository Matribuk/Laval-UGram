# 📋 TODO - Ugram Project

## ✅ Livrable 1 — Bases de l'application

---

## 🖥️ Frontend

### 👤 Gestion des usagers

* [x] Page **profil usager (connecté)**
  * [x] Photo de profil
  * [x] Nom d'usager
  * [x] Prénom / Nom
  * [x] Email
  * [] Numéro de téléphone
  * [x] Date d'inscription
* [x] Page **édition du profil**
  * [x] Modifier prénom / nom
  * [x] Modifier email
  * [x] Modifier numéro de téléphone
  * [x] Modifier photo de profil
* [x] Page **liste des usagers**
  * [x] Recherche par nom, username, email
* [x] Page **profil public d'un usager**
  * [x] Infos de base
  * [x] Liste de ses images

---

### 🖼️ Gestion des images

* [x] Page **téléversement d'image**
  * [x] Champ description
  * [x] Champ mots-clés (hashtags)
  * [x] Champ mention d'usager (avec résolution UUIDs)
* [x] Page **édition d'une image (propriétaire uniquement)**
  * [x] Description
  * [x] Hashtags
  * [x] Vérification propriétaire
* [x] Action **suppression d'une image**
* [x] Page **mes images**
  * [x] Grille de photos
  * [x] Navigation vers détail
* [x] Page **consultation d'une image**
  * [x] Affichage complet
  * [x] Boutons edit/delete pour propriétaire
* [x] Page **liste globale des images**
  * [x] Feed avec tous les posts
  * [x] Tri par date

---

### ✅ Validation & UX

* [x] Validation des formulaires
  * [x] Email
  * [] Numéro de téléphone (format: +, chiffres, espaces, tirets)
  * [x] Mentions d'usagers (@username)
  * [x] Hashtags (#tag)
* [x] Messages d'erreur clairs et explicites (react-toastify)
* [x] États de chargement (LoadingSpinner)
* [x] Gestion des erreurs API (4xx / 5xx)
  * [x] Erreurs de validation backend
  * [x] Erreurs d'authentification
  * [x] Erreurs de permissions

---

### 🎨 Responsive Design

* [x] Petit téléphone (640x1136)
* [x] Téléphone régulier (750x1334)
* [x] Grand téléphone (1242x2208)
* [x] Tablette (1536x2049)
* [x] Desktop
  * [x] 1920x1080
  * [x] 1366x768
  * [x] 1024x780

---

### Test unitaire

 * [x] 40% de coverage
 * [x] 50% de coverage
 * [x] 60% de coverage
 * [x] 70% de coverage
 * [x] 80% de coverage

---

### 🧱 Architecture Frontend

* [x] Découpage en composants réutilisables
  * [x] Avatar, Button, FormField, etc.
  * [x] PageLayout, Sidebar, Header
* [x] DRY (pas de duplication de logique)
  * [x] Services centralisés (usersService, postsService)
  * [x] Transformations backend→frontend
* [x] Configuration centralisée (URLs, API, env)
  * [x] Base URL dans services
  * [x] API client Axios configuré
* [x] TypeScript correctement utilisé
  * [x] Interfaces (User, Post, etc.)
  * [x] Typage strict
  * [x] Types backend vs frontend
  * [x] Modules
  * [x] Syntaxe ES2015+
* [x] Formatage automatique (Prettier / ESLint)

---

## 🧠 Backend

### 🗄️ Base de données

* [x] Schéma usager
* [x] Schéma image
* [x] Relations usager ↔ images
* [ ] Indexation (date, usager, hashtags si pertinent)

---

### 🔌 API REST

* [x] Consultation profil usager
* [x] Édition profil usager
* [x] Liste des usagers
* [x] Profil public d'un usager + images
* [x] Téléversement d'image
* [x] Modification d'image
* [x] Suppression d'image
* [x] Liste des images d'un usager
* [x] Consultation d'une image
* [x] Liste globale des images (tri par date)
* [x] Upload de photo de profil

---

### 🛡️ Validation & Sécurité

* [x] Validation de **tous** les paramètres en entrée
  * [x] DTOs avec class-validator
  * [x] Validation UUID
  * [x] Validation formats (email, phone, etc.)
* [x] Gestion des erreurs
  * [x] Mapping correct vers codes HTTP (400, 401, 403, 404, 500)
* [x] Messages d'erreur cohérents côté API
* [x] Vérification des droits (propriétaire de l'image)

---

### 🧱 Architecture Backend

* [x] Structure claire du projet (NestJS)
* [x] Séparation routes / services / modèles
  * [x] Controllers
  * [x] Services
  * [x] Entities (TypeORM)
  * [x] DTOs
* [x] DRY (logique réutilisable)
* [x] Configuration via variables d'environnement
* [x] Aucun secret dans le code
* [x] Code formaté et lisible

---

## ⚙️ DevOps / Projet

### 🗂️ Git & Documentation

* [x] Dépôt GitHub initialisé
* [x] Commits clairs et réguliers
* [ ] README.md complet
  * [ ] Description du projet
  * [ ] Instructions d'installation
  * [ ] Instructions de lancement
  * [ ] Variables d'environnement
  * [ ] Docker / Docker Compose

---

### 🐳 Docker & Déploiement

* [ ] Dockerfile frontend
* [ ] Dockerfile backend
* [ ] Docker Compose fonctionnel
  * [ ] Frontend
  * [ ] Backend
  * [ ] Base de données
* [ ] Build automatisé (npm scripts)
* [ ] Lancement du projet en une commande

---

### 🧩 Qualité & Architecture globale

* [x] Architecture globale claire
* [x] Configuration centralisée
* [x] Code propre et maintenable
* [x] Respect des standards
* [x] Automatisation du formatage (ESLint + Prettier)

---

---

## ✅ Livrable 2 — Fonctionnalités supplémentaires

---

## 🖥️ Frontend

### 🔐 Authentification OAuth

* [x] Authentification via Google OAuth (backend prêt)
  * [x] Bouton Google Sign-In → redirige vers `GET /auth/google`
  * [x] Page callback OAuth (`/oauth/callback`)
  * [x] Gestion du token JWT retourné

### 👤 Gestion du compte

* [x] Inscription usager (signup)
* [x] Déconnexion usager (logout)
* [x] Suppression du compte (backend prêt: `DELETE /users/:id`)
  * [x] Bouton supprimer compte (page settings)
  * [x] Modal de confirmation
  * [x] Appel API suppression

### 🔍 Recherche avancée

* [x] Recherche d'usagers (par nom, username, email)
* [ ] Recherche d'images par description (backend prêt: `GET /images/search?description=`)
  * [ ] Champ de recherche sur page feed/explore
  * [ ] Intégration API recherche description
* [ ] Recherche d'images par hashtag (backend prêt: `GET /images/hashtag/:hashtag`)
  * [ ] Clic sur hashtag → recherche
  * [ ] Page résultats hashtag

### 🛡️ Gestion des privilèges

* [x] Vérification propriétaire pour édition image
* [x] Vérification propriétaire pour suppression image
* [x] Boutons edit/delete visibles uniquement pour propriétaire

---

## 🧠 Backend

### 🔐 Authentification OAuth

* [x] Configuration OAuth (1 fournisseur requis)
  * [x] Google Strategy (passport-google-oauth20)
  * [x] Endpoint `GET /auth/google`
  * [x] Callback `GET /auth/google/callback`
  * [x] Création/liaison compte via OAuth
  * [x] Génération JWT après OAuth

### 👤 Gestion du compte

* [x] Endpoint inscription (`POST /auth/signup`)
* [x] Endpoint connexion (`POST /auth/login`)
* [x] Endpoint déconnexion (`POST /auth/logout`)
* [x] Endpoint suppression compte (`DELETE /users/:id`)
  * [x] Suppression cascade (images via onDelete: CASCADE)

### 🔍 Recherche avancée

* [x] Recherche usagers (`GET /users?search=`)
* [x] Recherche images par description (`GET /images/search?description=`)
* [x] Recherche images par hashtag (`GET /images/hashtag/:hashtag`)

### 🛡️ Gestion des privilèges

* [x] Guard propriétaire pour modification image
* [x] Guard propriétaire pour suppression image
* [x] Guard propriétaire pour modification profil

---

## ⚙️ DevOps / Déploiement

### 🐳 Docker & Déploiement automatisé

* [ ] Dockerfile frontend
* [ ] Dockerfile backend
* [ ] Docker Compose fonctionnel
  * [ ] Frontend
  * [ ] Backend
  * [ ] Base de données
* [ ] Build automatisé (npm scripts)
* [ ] Lancement du projet en une commande
* [ ] Pipeline CI/CD (GitHub Actions)
  * [ ] Build automatique
  * [ ] Tests automatiques
  * [ ] Déploiement automatisé
## ⚙️ DevOps / Déploiement (Livrable 2)

> **Rappel de remise** : Le lien de l'application (S3 ou CloudFront) doit être inclus dans le README de la branche `release`. Le site **ne doit pas être modifié après la date de remise**.

---

### 🧠 Backend — Préparation au déploiement (Elastic Beanstalk)

* [ ] Ajouter un `Procfile` à la racine du backend
  * Contenu : `web: npm run start:prod`
* [ ] Ajouter un `.ebignore` pour exclure les fichiers inutiles (node_modules, src, tests)
* [ ] Mettre à jour `defaults.ts` pour lire **toutes** les configs depuis `process.env`
  * [ ] `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  * [ ] `JWT_SECRET`
  * [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  * [ ] `GOOGLE_CALLBACK_URL` (pointer vers l'URL EB en prod)
* [ ] Mettre à jour le `.env.exemple` avec toutes les variables nécessaires
* [ ] Vérifier que `npm run build` compile sans erreurs (`dist/` généré)
* [ ] Tester `npm run start:prod` localement après build
* [ ] Mettre à jour la config CORS pour accepter l'URL S3/CloudFront en production
  * Variable `CORS_ORIGIN` dans `main.ts` (déjà lu depuis `process.env`)
* [ ] Mettre à jour **Google Cloud Console** avec le nouveau callback URL EB après déploiement

---

### 🖥️ Frontend — Déploiement S3

* [ ] Créer un fichier `.env.production` avec `REACT_APP_API_URL=<URL Elastic Beanstalk>`
* [ ] Builder l'application : `npm run build`
* [ ] Uploader le dossier `build/` dans le bucket S3
* [ ] Activer l'hébergement de site statique sur le bucket S3
* [ ] Configurer la politique du bucket pour accès public en lecture
* [ ] (Optionnel) Configurer CloudFront devant le bucket S3

---

### 🐳 Docker/CI — Infrastructure AWS (équipe DevOps)

* [ ] Créer une instance **RDS PostgreSQL** sur AWS
* [ ] Créer un environnement **Elastic Beanstalk** (Node.js platform)
* [ ] Configurer les variables d'environnement dans la console EB :
  * `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  * `JWT_SECRET`
  * `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  * `CORS_ORIGIN` (URL S3/CloudFront du frontend)
  * `PORT=8080`
* [ ] Déployer le backend sur EB (zip du projet buildé ou via EB CLI)
* [ ] Créer le bucket S3 pour le frontend avec hébergement statique activé
* [ ] Pipeline CI/CD (GitHub Actions)
  * [ ] Build + tests automatiques sur chaque push
  * [ ] Déploiement automatique sur EB (backend)
  * [ ] Déploiement automatique sur S3 (frontend)

---

### 📋 Finalisation de la remise

* [ ] Créer la branche `release` à partir de `main`
* [ ] Ajouter le lien de l'application dans le README de la branche `release`
* [ ] Vérifier que l'application fonctionne sur l'URL de production **avant** la date limite
* [ ] Ne plus modifier le site après la date de remise

---

## 🔧 Points techniques résolus

* [x] Connexion Frontend ↔ Backend
* [x] Authentification JWT
* [x] CORS configuré
* [x] Gestion des tokens (localStorage + interceptors)
* [x] Transformation données backend → frontend
  * [x] UUIDs vs numbers pour IDs
  * [x] URLs complètes pour images
  * [x] Mapping champs (profilePictureUrl → avatar, etc.)
* [x] Pagination backend supportée
* [x] Validation côté client (Yup) et serveur (class-validator)
* [x] Gestion erreurs avec messages utilisateur
* [x] Phone number validation compatible backend
* [x] Mentions avec résolution username → UUID
* [x] Hashtags parsing et validation
