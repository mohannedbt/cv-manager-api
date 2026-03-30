# P2 Remaining Work (Second Half)

## Scope left for P2
- Exercise 4: JWT middleware (`auth-user` header), token decoding, request enrichment, and error handling.

## Tasks
- [ ] Create `src/common/middleware/auth-user.middleware.ts`.
- [ ] Read `auth-user` header in format `Bearer <jwt>`.
- [ ] Verify token with a shared secret from `.env` (`JWT_SECRET`).
- [ ] Extract `userId` from token payload.
- [ ] Attach `userId` to request object (`req.userId`).
- [ ] Handle errors with proper HTTP responses:
- [ ] Missing header -> `401 Unauthorized`.
- [ ] Invalid format -> `400 Bad Request`.
- [ ] Invalid or expired token -> `401 Unauthorized`.
- [ ] Apply middleware only to protected routes (at least CV write routes).
- [ ] Add typings for request extension (`userId`) in a dedicated interface.
- [ ] Add unit tests for middleware success and failure cases.
- [ ] Add one e2e scenario for a protected route requiring `auth-user`.

## Acceptance checklist
- [ ] Requests with valid JWT reach handlers and have `req.userId` populated.
- [ ] Requests without/with bad JWT are blocked with correct status codes.
- [ ] Existing CRUD behavior still passes tests.
- [ ] `npm run build` and `npm test` pass.

## Runtime setup needed
- Configure DB env vars before running server:
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- Also set `JWT_SECRET` for middleware verification.
