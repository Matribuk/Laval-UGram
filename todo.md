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
* [x] Indexation (date, usager, hashtags si pertinent)

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
* [x] README.md complet
  * [x] Description du projet
  * [x] Instructions d'installation
  * [x] Instructions de lancement
  * [x] Variables d'environnement
  * [x] Docker / Docker Compose
* [x] DEPLOYMENT.md avec documentation complète déploiement
  * [x] Services AWS utilisés (RDS, EB, S3)
  * [x] IDs et endpoints exacts
  * [x] Variables d'environnement avec valeurs
  * [x] Architecture réseau et security groups
  * [x] Troubleshooting détaillé

---

### 🐳 Docker & Déploiement

* [x] Dockerfile frontend
* [x] Dockerfile backend
* [x] Docker Compose fonctionnel
  * [x] Frontend
  * [x] Backend
  * [x] Base de données
* [x] Build automatisé (npm scripts)
* [x] Lancement du projet en une commande

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
* [x] Recherche d'images par description (backend prêt: `GET /images/search?description=`)
  * [x] Champ de recherche sur page feed/explore
  * [x] Intégration API recherche description
* [x] Recherche d'images par hashtag (backend prêt: `GET /images/hashtag/:hashtag`)
  * [x] Clic sur hashtag → recherche
  * [x] Page résultats hashtag

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

* [x] Ajouter un `Procfile` à la racine du backend
  * Contenu : `web: npm run start:prod`
* [x] Ajouter un `.ebignore` pour exclure les fichiers inutiles (node_modules, src, tests)
* [x] Mettre à jour `defaults.ts` pour lire **toutes** les configs depuis `process.env`
  * [x] `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  * [x] `JWT_SECRET`
  * [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  * [x] `GOOGLE_CALLBACK_URL` (pointer vers l'URL EB en prod)
* [x] Mettre à jour le `.env.example` avec toutes les variables nécessaires
* [x] Vérifier que `npm run build` compile sans erreurs (`dist/` généré)
* [x] Tester `npm run start:prod` localement après build
* [x] Mettre à jour la config CORS pour accepter l'URL S3/CloudFront en production
  * Variable `CORS_ORIGIN` dans `main.ts` (déjà lu depuis `process.env`)
* [x] Mettre à jour **Google Cloud Console** avec le nouveau callback URL EB après déploiement
* [x] Script de déploiement créé (`zip-backend-for-deploy.sh`)

---

### 🖥️ Frontend — Déploiement S3

* [x] Créer un fichier `.env.production` avec `REACT_APP_API_URL=<URL Elastic Beanstalk>`
  * URL backend: `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com`
* [x] Builder l'application : `npm run build`
* [x] Uploader le dossier `build/` dans le bucket S3
* [x] Activer l'hébergement de site statique sur le bucket S3
* [x] Configurer la politique du bucket pour accès public en lecture
* [ ] (Optionnel) Configurer CloudFront devant le bucket S3

---

### 🐳 Infrastructure AWS (équipe DevOps)

* [x] Créer une instance **RDS PostgreSQL** sur AWS
  * [x] PostgreSQL 16.13, db.t4g.micro (Free Tier)
  * [x] Endpoint: `ugram-db-prod.cs7s8q406w8d.us-east-1.rds.amazonaws.com`
  * [x] Parameter group custom créé (`ugram-pg16-no-ssl` avec `force_ssl=0`)
  * [x] Security Group configuré pour autoriser EB
* [x] Créer un environnement **Elastic Beanstalk** (Node.js platform)
  * [x] Environnement: `ugram-backend-prod`
  * [x] URL: http://ugram-backend-prod.us-east-1.elasticbeanstalk.com
  * [x] Platform: Node.js 20 on Amazon Linux 2023
  * [x] Instance: t3.micro
  * [x] IAM role: `aws-elasticbeanstalk-ec2-role` avec `AmazonS3FullAccess`
* [x] Configurer les variables d'environnement dans la console EB :
  * [x] `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  * [x] `JWT_SECRET`
  * [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  * [x] `CORS_ORIGIN` (URL S3/CloudFront du frontend)
  * [x] `PORT=8080`
  * [x] `NODE_ENV=production`
  * [x] `STORAGE_TYPE=s3`, `AWS_REGION`, `AWS_BUCKET_NAME`
* [x] Déployer le backend sur EB (zip du projet buildé)
  * [x] Script de déploiement: `zip-backend-for-deploy.sh`
  * [x] Fix nginx upload limit (10MB) via `.platform/nginx/conf.d/`
  * [x] Fix S3 credentials (utilise EC2 instance profile)
* [x] Créer le bucket S3 pour le frontend avec hébergement statique activé
  * [x] Bucket: `ugram-frontend-prod-team12`
  * [x] URL: http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com
  * [x] Hébergement statique activé
  * [x] Politique publique configurée
* [x] Créer le bucket S3 pour les images
  * [x] Bucket: `ugram-images-prod-team12`
  * [x] CORS configuré
  * [x] IAM role EC2 avec accès S3
  * [x] Upload d'images fonctionnel

---

### 📊 Logging & Monitoring

#### Logging Serveur (CloudWatch)
* [x] Logs automatiques Elastic Beanstalk → CloudWatch
  * [x] `/var/log/web.stdout.log` (logs applicatifs)
  * [x] `/var/log/nginx/access.log` (logs nginx access)
  * [x] `/var/log/nginx/error.log` (logs nginx errors)
  * [x] `/var/log/eb-engine.log` (logs déploiement EB)
* [x] **Configuration explicite CloudWatch Logs (3 pts grille)** ✅
  * [x] Health reporting: Enhanced
  * [x] Health event streaming activé
  * [x] Instance log streaming activé
  * [x] Retention: 7 jours
  * [x] Lifecycle: Delete on terminate
  * [x] Documentation complète dans DEPLOYMENT.md

#### Logging Client (Sentry) - FRONTEND
* [x] **Installation Sentry dans frontend (3 pts grille)** ✅
  * [x] Package `@sentry/react` installé
  * [x] Sentry.init() dans index.tsx
  * [x] SENTRY_DSN configuré (.env + .env.example)
  * [x] Error boundary Sentry
  * [x] Performance monitoring (browserTracing)
  * [x] Session replay (10% normal, 100% errors)

---

### 🔄 CI/CD (Intégration & Déploiement Continu)

* [x] **Intégration Continue - GitHub Actions (3 pts grille)** ⚠️
  * [x] Workflow build automatique sur push/PR
  * [x] Tests automatiques backend (`npm test`)
  * [x] Tests automatiques frontend (`npm test`)
  * [x] Linting automatique (ESLint)
  * [x] Build validation (frontend & backend)
  * [x] Fichier `.github/workflows/ci.yml`

* [x] **Déploiement Continu - GitHub Actions (3 pts grille)** ⚠️
  * [x] Déploiement automatique backend vers EB sur push `main`
  * [x] Déploiement automatique frontend vers S3 sur push `main`
  * [x] Utilisation secrets GitHub pour credentials AWS
  * [x] Fichier `.github/workflows/deploy.yml`
  * [x] Documentation du processus CD

---

### 📋 Finalisation de la remise

* [ ] Créer la branche `release` à partir de `main`
* [x] Ajouter le lien de l'application dans le README de la branche `release`
* [x] Vérifier que l'application fonctionne sur l'URL de production
  * [x] Upload images fonctionne (S3)
  * [x] Authentification Google OAuth fonctionne
  * [x] Recherche par description fonctionne
  * [x] Recherche par hashtag fonctionne
  * [x] CRUD posts fonctionne
  * [x] CRUD profil fonctionne
* [ ] Ne plus modifier le site après la date de remise

---

## 📊 Résumé Grille de Correction - Livrable 2

### ✅ Points Acquis (estimé: 89-92/100)

**Fonctionnalités (28-33/33):**
- ✅ OAuth Google (5 pts)
- ✅ Enregistrement (3 pts)
- ✅ Déconnexion (2 pts)
- ✅ Supprimer compte (2 pts)
- ✅ Rechercher usager (3 pts)
- ✅ Rechercher images par description (5 pts)
- ✅ Rechercher images par hashtag (5 pts)
- ❓ Fonctionnalités L1 valides (4 pts) - À tester

**Déploiement (17/22):**
- ✅ README.md (1 pt)
- ✅ Fichiers statiques S3 (5 pts)
- ✅ Serveur Elastic Beanstalk (5 pts)
- ✅ Logging serveur CloudWatch (3 pts)
- ✅ **Logging client Sentry (3 pts)** ← FAIT!
- ❌ Intégration continue (0/3 pts)
- ❌ Déploiement continu (0/3 pts)

**Architecture (estimé: 28-32/32):**
- ✅ Backend complet (validation, exceptions, RESTful, config env)
- ✅ Frontend complet (TypeScript, composants, responsive)
- ✅ Architecture globale claire
- ✅ Code propre et DRY

**Utilisabilité (estimé: 2-4/4):**
- ✅ Messages d'erreur clairs
- ❓ Validation formulaires à vérifier

---

### ⚠️ Points Manquants (8-11 pts)

**Backend/DevOps:**
1. **CI/CD GitHub Actions (6 pts total)**
   - Intégration continue (build + tests) (3 pts)
   - Déploiement continu (EB + S3) (3 pts)

2. **Points à valider manuellement (2-5 pts):**
   - Validation téléphone frontend
   - Responsive design complet
   - Fonctionnalités L1 encore valides

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
