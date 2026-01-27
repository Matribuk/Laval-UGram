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

* [ ] Petit téléphone (640x1136)
* [ ] Téléphone régulier (750x1334)
* [ ] Grand téléphone (1242x2208)
* [ ] Tablette (1536x2049)
* [ ] Desktop
  * [ ] 1920x1080
  * [ ] 1366x768
  * [ ] 1024x780

---

### Test unitaire

 * [ ] 40% de coverage
 * [ ] 50% de coverage
 * [ ] 60% de coverage
 * [ ] 70% de coverage
 * [ ] 80% de coverage

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
