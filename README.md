# CV Manager API

NestJS + TypeORM REST API for managing CVs, users, and skills.

## Requirements

- Node.js 20+
- MySQL 8+
- npm 10+

## Configuration

1. Copy `.env.example` to `.env`.
2. Fill in your local database values.

Required variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `PORT` (optional, default: `3000`)

## Install

```bash
npm install
```

## Run

```bash
npm run start:dev
```

## Seed Database

```bash
npm run seed:cvs
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```