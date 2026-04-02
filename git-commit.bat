@echo off
cd /d "C:\GL3\semester 2\Nest.js\cv-manager-api"
echo === GIT STATUS BEFORE STAGING ===
git status
echo.
echo === STAGING ALL CHANGES ===
git add .
echo.
echo === GIT STATUS AFTER STAGING ===
git status
echo.
echo === CREATING COMMIT ===
git commit -m "feat: implement JWT auth middleware for protected CV routes

- Create auth-user middleware with Bearer token parsing
- Verify JWT tokens using JWT_SECRET from .env
- Extract userId from token payload and attach to request
- Handle errors with proper HTTP responses (401/400)
- Add type definitions for AuthenticatedRequest
- Apply middleware to CV POST, PATCH, DELETE routes
- Add comprehensive unit tests (13 test cases)
- Add e2e tests for protected/unprotected routes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo.
echo === COMMIT LOG ===
git log --oneline -10
echo.
echo === GIT STATUS AFTER COMMIT ===
git status
