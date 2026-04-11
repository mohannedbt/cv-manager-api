# CV Manager API

NestJS + TypeORM API for managing users, skills, and CVs.

## Implemented Scope

- CV CRUD with relation validation (User and Skill existence checks)
- Standalone seeding script
- Auth module with register/login
- JWT + Passport strategies (local + jwt)
- Middleware-based token parsing for protected CV write routes
- Ownership and role-based authorization rules

## Data Model

- User 1-* CV
- CV *-* Skill

## Requirements

- Node.js >= 20
- npm >= 10
- MySQL 8+

## Configuration

Create a .env file in project root with:

- DB_HOST=localhost
- DB_PORT=3306
- DB_USERNAME=root
- DB_PASSWORD=
- DB_NAME=cv_manager
- JWT_SECRET=replace_with_a_real_secret
- PORT=3000

Notes:

- DB values have local fallbacks in [src/app.module.ts](src/app.module.ts).
- JWT_SECRET is required for token signing/verification.

## Install

```bash
npm install
```

## Run API

```bash
npm run start
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test -- --runInBand
```

## Seed Database (Standalone App)

```bash
npm run seed:cvs
```

Seeder entry point: [src/commands/cv.seeder.ts](src/commands/cv.seeder.ts)

## Authentication and Authorization

### Auth endpoints

- POST /auth/register
- POST /auth/login

### CV route protection model

- POST/PATCH/DELETE /cvs use middleware token parsing from auth-user header
- GET /cvs and GET /cvs/:id use Passport JWT guard (Authorization: Bearer <token>)

### Ownership and roles

- CV creation owner is always the connected user
- Non-admin users can only read their own CVs
- Non-owners cannot update/delete other users' CVs
- Admin can read all CVs

## Quick Manual Verification

Use [tp-audit.http](tp-audit.http) to validate:

- register/login for user and admin
- create/list/update/delete ownership rules
- admin-vs-user visibility
- missing/invalid token failure paths