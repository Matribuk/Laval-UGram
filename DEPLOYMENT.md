# Documentation de déploiement AWS - Ugram

## Table des matières

1. [Architecture AWS](#architecture-aws)
2. [Services déployés](#services-déployés)
3. [URLs de production](#urls-de-production)
4. [Configuration détaillée](#configuration-détaillée)
5. [Configuration SSL/TLS](#configuration-ssltls)
6. [Logging & Monitoring (CloudWatch)](#logging--monitoring-cloudwatch)
7. [Résumé des coûts AWS](#résumé-des-coûts-aws-estimation)

---

## Architecture AWS

L'application Ugram est déployée sur AWS avec l'architecture suivante:

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet Users                         │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ HTTP                           │ HTTP
             │                                │
             ▼                                ▼
┌────────────────────────┐       ┌───────────────────────────┐
│   S3 Static Website    │       │   Elastic Beanstalk       │
│  (React Frontend)      │◄──────│   (NestJS Backend)        │
│                        │  API  │                           │
│ ugram-frontend-prod    │       │ ugram-backend-prod        │
│      -team12           │       │                           │
└────────────────────────┘       └───────────┬───────────────┘
                                             │
                                             │ PostgreSQL
                                             │ (SSL disabled)
                                             ▼
                                 ┌───────────────────────────┐
                                 │   RDS PostgreSQL 16.13    │
                                 │                           │
                                 │   ugram-db-prod           │
                                 └───────────────────────────┘
                                             ▲
                                             │
                                             │ Uploads
                                             │
                                 ┌───────────────────────────┐
                                 │   S3 Bucket (Images)      │
                                 │                           │
                                 │ ugram-images-prod-team12  │
                                 └───────────────────────────┘
```

---

## Résumé des ressources AWS

| Type de ressource | Nom/ID | Description | Région |
|-------------------|--------|-------------|--------|
| **RDS Instance** | `ugram-db-prod` | PostgreSQL 16.13 (db.t4g.micro) | us-east-1a |
| **EB Environment** | `ugram-backend-prod` | Node.js 20 (t3.micro) | us-east-1 |
| **EC2 Instance** | `i-08992cc46c3f44973` | Backend API (52.200.42.141) | us-east-1 |
| **S3 Bucket** | `ugram-frontend-prod-team12` | Static Website Hosting (Frontend) | us-east-1 |
| **S3 Bucket** | `ugram-images-prod-team12` | Image storage | us-east-1 |
| **S3 Bucket** | `elasticbeanstalk-us-east-1-295129087394` | EB application versions (auto) | us-east-1 |
| **VPC** | `vpc-07fe678d46804cb30` | Default VPC | us-east-1 |
| **Subnet** | `subnet-045b592938283f1c9` | Instance subnet | us-east-1 |
| **Security Group** | `sg-0340878994ffc67fd` (ugram-db-sg) | RDS security group | us-east-1 |
| **Security Group** | `sg-0ef5881248b14681e` | EB security group | us-east-1 |
| **Security Group** | `sg-0b534f4377c75be99` (default) | Default VPC security group | us-east-1 |
| **Parameter Group** | `ugram-pg16-no-ssl` | RDS params (SSL disabled) | us-east-1 |
| **IAM Role** | `aws-elasticbeanstalk-service-role` | EB service role | Global |
| **IAM Role** | `aws-elasticbeanstalk-ec2-role` | EC2 instance profile | Global |
| **CloudWatch Log Groups** | `/aws/elasticbeanstalk/ugram-backend-prod/*` | Logs EB (5 log groups) | us-east-1 |

**Total:** 15 ressources AWS créées (8 automatiques : 1 bucket S3 EB, 1 EC2 instance, 1 default SG, 5 CloudWatch log groups)

---

## Services déployés

### 1. AWS RDS (Base de données)

**Instance:** `ugram-db-prod`

- **Engine:** PostgreSQL 16.13
- **Instance class:** db.t4g.micro (2 vCPU ARM, 1 GiB RAM)
- **Storage:** 20 GiB gp2 (General Purpose SSD)
- **Endpoint:** `ugram-db-prod.cs7s8q406w8d.us-east-1.rds.amazonaws.com`
- **Port:** 5432
- **Region & AZ:** us-east-1a
- **Database name:** ugram
- **Public accessibility:** Non
- **Deletion protection:** Disabled
- **Backup retention:** 7 jours
- **Encryption:** Enabled (AWS KMS key: aws/rds)
- **Parameter Group:** `ugram-pg16-no-ssl` (custom, In sync)
  - `rds.force_ssl = 0` (SSL désactivé, voir [Configuration SSL/TLS](#configuration-ssltls))
- **Monitoring:** Database Insights - Standard

**Credentials:**
- Username: `postgres`
- Password: `your-database-password`

**Security Group:**
- Nom: `ugram-db-sg`
- Inbound rules:
  - CIDR/IP: 0.0.0.0/0 (PostgreSQL access)
  - EC2 Security Group **X** (depuis Elastic Beanstalk)
- Outbound rules:
  - CIDR/IP: 0.0.0.0/0 (All traffic)

### 2. AWS Elastic Beanstalk (Backend API)

**Environment:** `ugram-backend-prod`

- **Application:** ugram-backend
- **Environment ID:** `e-seeg95sjjm`
- **Platform:** Node.js 20 running on 64bit Amazon Linux 2023
- **Platform version:** 6.8.0
- **Running version:** ugram-backend-version-7
- **Instance type:** t3.micro (x86_64, 2 vCPU)
- **Region:** us-east-1
- **URL:** http://ugram-backend-prod.us-east-1.elasticbeanstalk.com
- **Domain:** ugram-backend-prod.us-east-1.elasticbeanstalk.com
- **Health:** Green
- **Environment type:** Single instance
- **Node command:** `npm start`

**Network Configuration:**
- **...**
- **Public IP address:** Enabled

**Monitoring:**
- **System:** Enhanced health reporting (free, meilleur monitoring)
- **Health event streaming to CloudWatch Logs:** Enabled
- **Instance log streaming to CloudWatch Logs:** Enabled
- **Log retention:** 7 days
- **Lifecycle:** Delete logs upon termination
- **Cloudwatch custom metrics:** Disabled (évite coûts supplémentaires)
- **X-Ray enabled:** Disabled

**Proxy Server:**
- **Type:** nginx

**Environment Variables :**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/auth/google/callback
FRONTEND_URL=http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com

# Database (RDS)
DB_HOST=ugram-db-prod.cs7s8q406w8d.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-database-password
DB_DATABASE=ugram

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=1d

# Server
PORT=8080
NODE_ENV=production

# CORS
CORS_ORIGIN=http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com

# Storage (S3)
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET_NAME=ugram-images-prod-team12
```

**Note importante:** La variable `DB_SSL` n'est PAS définie dans Elastic Beanstalk. Le backend gère SSL via le parameter group RDS qui a `rds.force_ssl = 0`, donc aucune connexion SSL n'est requise.

**IAM Roles:**
- **...***
- **EC2 Instance Profile:** `aws-elasticbeanstalk-ec2-role` (avec accès S3)

**EC2 Instance Details:**
- **...**
- **Public IPv4:** `52.200.42.141`

### 3. AWS S3 (Stockage)

**Buckets créés (3 au total):**

1. `ugram-frontend-prod-team12` - Frontend React (Static Website Hosting)
2. `ugram-images-prod-team12` - Stockage des images uploadées
3. `elasticbeanstalk-us-east-1-295129087394` - Bucket automatique pour Elastic Beanstalk (versions d'application)

#### Bucket Frontend (Static Website Hosting)

**Bucket:** `ugram-frontend-prod-team12`

- **Region:** us-east-1
- **Static website hosting:** Enabled
- **Index document:** index.html
- **Error document:** index.html (pour React Router)
- **URL:** http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com
- **Block all public access:** Off (désactivé)
- **Object Ownership:** Bucket owner enforced (ACLs disabled)
- **Objects count:** 8 (asset-manifest.json, favicon.ico, index.html, logo192.png, logo512.png, manifest.json, + folders assets/ et static/)

**Bucket Policy:** Public read access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ugram-frontend-prod-team12/*"
    }
  ]
}
```

**CORS:** Non configuré (pas nécessaire pour static website hosting)

#### Bucket Images (Uploads)

**Bucket:** `ugram-images-prod-team12`

- **Region:** us-east-1
- **Block all public access:** Off (désactivé)
- **Object Ownership:** Bucket owner enforced (ACLs disabled)
- **Public access:** Enabled (pour les images publiques)
- **Usage:** Stockage de toutes les images uploadées par les utilisateurs (photos de profil, posts)
- **Access:** Le backend (Elastic Beanstalk) utilise le SDK AWS S3 pour uploader/lire les images via le IAM role `aws-elasticbeanstalk-ec2-role`
- **CORS Configuration:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com",
      "http://ugram-backend-prod.us-east-1.elasticbeanstalk.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

**Bucket Policy:** Public read access pour les images

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ugram-images-prod-team12/*"
    }
  ]
}
```


#### Bucket Elastic Beanstalk (Automatique)

**Bucket:** `elasticbeanstalk-us-east-1-295129087394`

- **Region:** us-east-1
- **Purpose:** Stockage des versions d'application backend (créé automatiquement par Elastic Beanstalk)
- **Block all public access:** Off
- **Object Ownership:** Object writer (ACLs enabled)
- **Contents:**
  - `.elasticbeanstalk` (0 B)
  - 5 fichiers `backend-deploy.zip` (versions différentes, ~342 KB chacun)
  - `resources/` folder

**Note:** Ce bucket est généré automatiquement par AWS Elastic Beanstalk.

---

### Configuration du stockage S3 dans le backend

Le backend utilise un module `storage` qui supporte deux modes:

1. **Mode local (développement):**
   - Variable: `STORAGE_TYPE=local`
   - Les images sont stockées dans `./uploads/` sur le serveur
   - Servies via nginx depuis `/uploads/`

2. **Mode S3 (production):**
   - Variable: `STORAGE_TYPE=s3`
   - Les images sont uploadées sur S3 via AWS SDK
   - URL publiques: `https://ugram-images-prod-team12.s3.us-east-1.amazonaws.com/{filename}`
   - Authentification: IAM role `aws-elasticbeanstalk-ec2-role`

### 4. Networking


**Networking Résumé:**
```
Internet (0.0.0.0/0)
       │
       │ HTTP (Port 80)
       ▼
[sg-0ef5881248b14681e] ◄─── EC2 Instance (52.200.42.141)
       │                    Instance ID: i-08992cc46c3f44973
       │                    VPC: vpc-07fe678d46804cb30
       │                    Subnet: subnet-045b592938283f1c9
       │
       │ PostgreSQL (Port 5432)
       ▼
[sg-0340878994ffc67fd] ◄─── RDS (ugram-db-prod)
                            Endpoint: ugram-db-prod.cs7s8q406w8d.us-east-1.rds.amazonaws.com
                            VPC: vpc-07fe678d46804cb30
```

---

## URLs de production

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com | Application React (S3 Static Website) |
| **Backend API** | http://ugram-backend-prod.us-east-1.elasticbeanstalk.com | API NestJS (Elastic Beanstalk) |
| **Database** | ugram-db-prod.cs7s8q406w8d.us-east-1.rds.amazonaws.com:5432 | PostgreSQL RDS (accessible depuis EB uniquement) |
| **Images S3** | https://ugram-images-prod-team12.s3.us-east-1.amazonaws.com/ | Bucket d'images (accessible publiquement) |

**Endpoints API principaux:**
- Authentification: `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/auth/login`
- Google OAuth: `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/auth/google`
- Images: `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/images`
- Utilisateurs: `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/users`

---

## Configuration détaillée

### Google OAuth Configuration

**Google Cloud Console:**

1. **Project ID:** (configuré par l'équipe)
2. **Authorized JavaScript origins:**
   - `http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com`
   - `http://localhost:3000` (développement)

3. **Authorized redirect URIs:**
   - `http://ugram-backend-prod.us-east-1.elasticbeanstalk.com/api/auth/google/callback`
   - `http://localhost:8080/api/auth/google/callback` (développement)

**Flow OAuth:**
1. User clique "Sign in with Google" sur le frontend
2. Frontend redirige vers `BACKEND/api/auth/google`
3. Backend redirige vers Google OAuth consent screen
4. Google redirige vers `GOOGLE_CALLBACK_URL` (backend)
5. Backend crée JWT et redirige vers `FRONTEND_URL/oauth/callback?token=xxx&user=xxx`
6. Frontend stocke le token et affiche l'utilisateur connecté

### Frontend Configuration

**Build process:**

```bash
cd Frontend

# 1. Mettre à jour .env pour production
echo "REACT_APP_API_URL=http://ugram-backend-prod.us-east-1.elasticbeanstalk.com" > .env

# 2. Build
npm run build

# 3. Préparer les fichiers pour S3
./prepare-s3-upload.sh

# 4. Upload vers S3 (via AWS Console)
# Sélectionner tous les fichiers dans s3-upload/ et les uploader à la racine du bucket

# 5. Nettoyer
./clean-s3-upload.sh
```

**Scripts de déploiement:**
- `prepare-s3-upload.sh`: Copie les fichiers build dans `s3-upload/` pour upload manuel
- `clean-s3-upload.sh`: Nettoie le dossier temporaire `s3-upload/`

### Backend Configuration

**Fichiers de configuration importants:**

1. **`src/config/defaults.ts`** - Valeurs par défaut et lecture des variables d'environnement
   ```typescript
   export const STORAGE_CONFIG = {
     TYPE: process.env.STORAGE_TYPE || 'local',  // 's3' en production
     S3: {
       REGION: process.env.AWS_REGION || 'us-east-1',
       BUCKET: process.env.AWS_BUCKET_NAME || '',
       // Credentials automatiquement détectées depuis IAM role en production
     },
     MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
   };
   ```

2. **`.platform/nginx/conf.d/client_max_body_size.conf`** - Configuration nginx
   ```nginx
   client_max_body_size 10M;  # Permet uploads jusqu'à 10MB
   ```

3. **`Procfile`** - Commande de démarrage pour Elastic Beanstalk
   ```
   web: npm start
   ```

**Build process:**

```bash
cd backend

# 1. Build TypeScript
npm run build

# 2. Créer le package de déploiement
./zip-backend-for-deploy.sh

# 3. Upload vers Elastic Beanstalk
# Via AWS Console: Upload backend-deploy.zip dans l'environment ugram-backend-prod
```

**Structure du package de déploiement:**
```
backend-deploy.zip
├── dist/                          # Code compilé TypeScript → JavaScript
├── .platform/                     # Configuration Elastic Beanstalk
│   └── nginx/
│       └── conf.d/
│           └── client_max_body_size.conf  # Augmente limite upload à 10MB
├── package.json
├── package-lock.json
├── Procfile                       # Commande de démarrage (web: npm start)
└── .ebignore                      # Fichiers à exclure du déploiement
```

**Important:**
- Les variables d'environnement sont configurées dans Elastic Beanstalk (pas de fichier .env dans le zip)
- Le dossier `.platform/` contient les configurations spécifiques à EB (nginx, hooks, etc.)
- La limite d'upload nginx est augmentée à 10MB pour permettre les uploads d'images

---

## Configuration SSL/TLS

### SSL désactivé entre Elastic Beanstalk et RDS

**Raison:**

Par défaut, AWS RDS PostgreSQL force les connexions SSL (`rds.force_ssl = 1`). Pour le développement et le Livrable 2, nous avons désactivé cette contrainte pour simplifier la configuration.

**Configuration appliquée:**

1. **RDS Parameter Group:** `ugram-pg16-no-ssl` (custom parameter group)
   - **Family:** postgres16
   - **Parameter modifié:** `rds.force_ssl`
   - **Value:** `0` (désactivé)
   - **Status:** In sync (appliqué et actif)
   - **Apply method:** Pending-reboot → Applied (après reboot de l'instance RDS)

2. **Backend Environment Variable:**
   - **Important:** La variable `DB_SSL` n'est **PAS définie** dans Elastic Beanstalk
   - L'absence de cette variable fait que le backend ne tente pas d'établir une connexion SSL
   - Le code backend utilise `process.env.DB_SSL === 'true'` qui retourne `false` par défaut

3. **Code Backend** (`src/config/defaults.ts` et `src/config/database.config.ts`):
   ```typescript
   // defaults.ts
   export const DATABASE_CONFIG = {
     HOST: process.env.DB_HOST || 'localhost',
     PORT: parseInt(process.env.DB_PORT || '5433', 10),
     USERNAME: process.env.DB_USERNAME || 'ugram',
     PASSWORD: process.env.DB_PASSWORD || 'ugram_password',
     DATABASE: process.env.DB_DATABASE || 'ugram',
     SYNCHRONIZE: true,
     SSL: process.env.DB_SSL === 'true',  // false si DB_SSL n'est pas définie
   };

   // database.config.ts
   export default registerAs('database', () => {
     const config: any = {
       type: 'postgres' as const,
       host: DATABASE_CONFIG.HOST,
       port: DATABASE_CONFIG.PORT,
       username: DATABASE_CONFIG.USERNAME,
       password: DATABASE_CONFIG.PASSWORD,
       database: DATABASE_CONFIG.DATABASE,
       autoLoadEntities: true,
       synchronize: DATABASE_CONFIG.SYNCHRONIZE,
     };

     // SSL n'est pas ajouté à la config si DB_SSL n'est pas 'true'
     if (DATABASE_CONFIG.SSL) {
       config.ssl = { rejectUnauthorized: false };
     }

     return config;
   });
   ```

**Pourquoi cette approche fonctionne:**

1. **RDS Parameter Group** avec `rds.force_ssl = 0` permet les connexions sans SSL
2. **Backend** se connecte sans SSL car `DB_SSL` n'est pas définie (donc `DATABASE_CONFIG.SSL = false`)
3. **Pas de conflit:** RDS accepte les connexions non-SSL et le backend n'essaie pas de forcer SSL

**Implications:**

- ✅ **Avantage:** Configuration simplifiée, pas besoin de gérer les certificats SSL
- ✅ **Avantage:** Pas de variable d'environnement supplémentaire à gérer dans EB
- ⚠️ **Inconvénient:** Les données transitent en clair entre EB et RDS
- 🔒 **Sécurité:** Les deux services sont dans le même VPC privé (`vpc-07fe678d46804cb30`), donc le trafic ne sort pas d'AWS et reste isolé dans le réseau privé Amazon

### HTTPS (Frontend/Backend)

**Status actuel:** HTTP uniquement

- **Frontend:** http://ugram-frontend-prod-team12.s3-website-us-east-1.amazonaws.com
- **Backend:** http://ugram-backend-prod.us-east-1.elasticbeanstalk.com

**Pourquoi HTTP:**

Le Livrable 2 n'exige pas HTTPS. Pour activer HTTPS, il faudrait configurer CloudFront devant S3 et un Load Balancer devant Elastic Beanstalk, ce qui génèrerait des coûts supplémentaires hors Free Tier (~$16-20/mois).

---

## Logging & Monitoring (CloudWatch)

### Configuration CloudWatch Logs

**AWS CloudWatch Logs** est configuré pour streamer automatiquement tous les logs de l'environnement Elastic Beanstalk vers CloudWatch. Cela permet un monitoring centralisé et une recherche facile des logs.

**Configuration appliquée via Console EB:**

1. **Health Reporting:** Enhanced (gratuit, meilleur monitoring)
2. **Health event streaming:** Activé
3. **Instance log streaming:** Activé
4. **Retention:** 7 jours (configurable jusqu'à 10 ans)
5. **Lifecycle:** Delete logs upon termination (évite coûts résiduels)

### Log Groups disponibles

Les logs suivants sont automatiquement streamés vers CloudWatch:

| Log Group | Description |
|-----------|-------------|
| `/aws/elasticbeanstalk/ugram-backend-prod/environment-health.log` | Santé de l'environnement EB |
| `/aws/elasticbeanstalk/ugram-backend-prod/var/log/web.stdout.log` | Logs applicatifs NestJS (stdout) |
| `/aws/elasticbeanstalk/ugram-backend-prod/var/log/nginx/access.log` | Logs d'accès nginx (requêtes HTTP) |
| `/aws/elasticbeanstalk/ugram-backend-prod/var/log/nginx/error.log` | Logs d'erreur nginx |
| `/aws/elasticbeanstalk/ugram-backend-prod/var/log/eb-engine.log` | Logs de déploiement EB |

### Coûts CloudWatch Logs

**Free Tier AWS CloudWatch (permanent):**
- ✅ **5 GB ingestion/mois** (logs envoyés)
- ✅ **5 GB storage/mois** (logs stockés)

**Estimation pour ce projet:**
- Volume de logs: ~100-300 MB/mois (trafic faible, projet de cours)
- **Coût: $0/mois** (100% couvert par Free Tier)
- Retention: 7 jours (réduit le storage)
- Lifecycle: Logs supprimés automatiquement si environnement terminé

**Si dépassement du Free Tier (peu probable):**
- Ingestion: $0.50/GB
- Storage: $0.03/GB/mois

---

## Résumé des coûts AWS (estimation)

### Services dans le Free Tier (12 mois)

| Service | Free Tier | Usage actuel | Dépassement? |
|---------|-----------|--------------|--------------|
| **RDS** | 750h/mois db.t2.micro/db.t3.micro/db.t4g.micro | ~730h/mois (1 instance db.t4g.micro) | ✅ Non |
| **Elastic Beanstalk** | Gratuit (on paie EC2) | - | ✅ Gratuit |
| **EC2** | 750h/mois t2.micro/t3.micro | ~730h/mois (1 instance t3.micro) | ✅ Non |
| **S3 Storage** | 5 GB | ~1 GB estimé (3 buckets) | ✅ Non |
| **S3 Requests** | 20,000 GET, 2,000 PUT | Faible usage | ✅ Non |
| **Data Transfer** | 100 GB/mois sortant | Faible usage | ✅ Non |
| **CloudWatch Logs** | 5 GB ingestion + 5 GB storage | ~0.3 GB/mois | ✅ Non |

### Coût estimé mensuel

- **Mois 1-12 (avec Free Tier):** ~$0 USD
  - RDS db.t4g.micro: $0 (couvert par Free Tier 750h/mois)
  - EC2 t3.micro: $0 (couvert par Free Tier 750h/mois)
  - S3 Storage: $0 (~1 GB, couvert par 5 GB Free Tier)
  - S3 Requests: $0 (faible usage, couvert par Free Tier)
  - Data Transfer: $0 (faible usage, couvert par 100 GB/mois Free Tier)

- **Après 12 mois (sans Free Tier):** ~$20-30 USD/mois
  - RDS db.t4g.micro: ~$12-14/mois (storage gp2 20 GiB inclus)
  - EC2 t3.micro: ~$7-8/mois
  - S3 Storage + Requests: ~$1-2/mois
  - Data Transfer: ~$1-5/mois (selon utilisation)

**Note sur les crédits AWS:**
- **Crédits disponibles:** $119.95
- **Durée du cours:** 2 mois (Mars-Avril 2026)
- **Free Tier actif:** Oui (jusqu'à 12 mois après création du compte)
- **Estimation:** L'infrastructure reste **gratuite** pendant toute la durée du cours grâce au Free Tier. Les crédits AWS ne devraient pas être nécessaires.

**Important:** Le Free Tier se réinitialise chaque mois (750 heures = ~31 jours continus). Une seule instance RDS et une seule instance EC2 en cours d'exécution autorisé, limites du Free Tier.

---

## Auteur

**Équipe:** GLO-3112 - Team 12

---

## Ressources

- [Documentation AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Documentation AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Documentation AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [NestJS Deployment Guide](https://docs.nestjs.com/faq/deployment)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
