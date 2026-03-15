# UGram Backend

Backend API for the UGram Instagram-like application (GLO-3112 - Laval University).

## Tech Stack

- **Framework**: NestJS 11 (Node.js + TypeScript)
- **Database**: PostgreSQL 16 with TypeORM
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcrypt password hashing
- **Storage**: Local filesystem (S3-ready)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL database
docker compose up -d

# Start development server
npm run start:dev
```

### Environment Variables

See `.env.example` for all available configuration options.

## API Documentation

Interactive API documentation (Swagger UI):

**http://localhost:8080/api/docs**

## API Base URL

```
http://localhost:8080/api
```

## Authentication

The API uses JWT Bearer token authentication.

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": null,
    "profilePictureUrl": null,
    "createdAt": "2026-01-22T01:04:37.784Z"
  }
}
```

### Using the token

Include the JWT token in the Authorization header for protected endpoints:

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (paginated) |
| GET | `/api/users/search?q=query` | Search users by username |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/:id/images` | Get user's images (paginated) |
| PATCH | `/api/users/:id` | Update user profile |
| POST | `/api/users/:id/profile-picture` | Upload profile picture |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images` | Upload a new image |
| GET | `/api/images` | List all images (paginated) |
| GET | `/api/images/hashtag/:hashtag` | Search images by hashtag |
| GET | `/api/images/:id` | Get image by ID |
| PATCH | `/api/images/:id` | Update image |
| DELETE | `/api/images/:id` | Delete image |

## Pagination

All list endpoints support pagination:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page |

Response format:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## DTOs (Data Transfer Objects)

### RegisterDto
```typescript
{
  username: string;      // Required, unique
  email: string;         // Required, unique, valid email
  password: string;      // Required, min 6 characters
  firstName?: string;    // Optional
  lastName?: string;     // Optional
}
```

### LoginDto
```typescript
{
  email: string;         // Required
  password: string;      // Required
}
```

### UpdateUserDto
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;        // Must be unique if changed
  phoneNumber?: string;
}
```

**Note:** Profile pictures cannot be updated via `PATCH /api/users/:id`. Use the dedicated endpoint `POST /api/users/:id/profile-picture` with multipart/form-data instead.

### CreateImageDto
```typescript
{
  description?: string;           // Max 2000 chars
  hashtags?: string[];            // Array or comma-separated string (# symbols are stripped automatically)
  mentionedUserIds?: string[];    // Array of valid user UUIDs (v4 format)
}
```

### UpdateImageDto
```typescript
{
  description?: string;
  hashtags?: string[];
  mentionedUserIds?: string[];
}
```

## Entities

### User
```typescript
{
  id: string;                  // UUID
  username: string;            // Unique
  email: string;               // Unique
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Image
```typescript
{
  id: string;                  // UUID
  url: string;                 // Path to image file
  description: string | null;
  userId: string;              // Owner's UUID
  user: User;                  // Relation
  hashtags: Hashtag[];         // Many-to-many relation
  mentions: ImageMention[];    // One-to-many relation
  createdAt: Date;
  updatedAt: Date;
}
```

### Hashtag
```typescript
{
  id: string;                  // UUID
  name: string;                // Unique, lowercase
}
```

### ImageMention
```typescript
{
  id: string;                  // UUID
  imageId: string;
  mentionedUserId: string;
  mentionedUser: User;         // Relation
}
```

## File Upload

### Image Upload
```http
POST /api/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

image: <file>                    # Required
description: "My photo"          # Optional
hashtags: "sunset,beach,nature"  # Optional, comma-separated
mentionedUserIds: "uuid1,uuid2"  # Optional, comma-separated
```

### Profile Picture Upload
```http
POST /api/users/:id/profile-picture
Content-Type: multipart/form-data
Authorization: Bearer <token>

image: <file>
```

**Constraints:**
- Max file size: 5 MB
- Allowed types: JPEG, PNG, GIF, WebP

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Cannot access/modify resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Email/username already exists |

Error format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "path": "/api/users"
}
```

## CORS

Default allowed origin: `http://localhost:5173`

Configure `CORS_ORIGIN` in `.env` to change.

## Development Scripts

```bash
npm run start:dev    # Development with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
```
