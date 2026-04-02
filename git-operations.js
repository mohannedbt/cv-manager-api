const { execSync } = require('child_process');
const path = require('path');

const projectDir = __dirname;

try {
  console.log('=== GIT STATUS BEFORE STAGING ===');
  console.log(execSync('git --no-pager status', { cwd: projectDir }).toString());

  console.log('\n=== STAGING ALL CHANGES ===');
  execSync('git add .', { cwd: projectDir });
  console.log('All changes staged.');

  console.log('\n=== GIT STATUS AFTER STAGING ===');
  console.log(execSync('git --no-pager status', { cwd: projectDir }).toString());

  console.log('\n=== CREATING COMMIT ===');
  const commitMessage = `feat: implement JWT auth middleware for protected CV routes

- Create auth-user middleware with Bearer token parsing
- Verify JWT tokens using JWT_SECRET from .env
- Extract userId from token payload and attach to request
- Handle errors with proper HTTP responses (401/400)
- Add type definitions for AuthenticatedRequest
- Apply middleware to CV POST, PATCH, DELETE routes
- Add comprehensive unit tests (13 test cases)
- Add e2e tests for protected/unprotected routes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: projectDir });
  console.log('Commit created successfully.');

  console.log('\n=== COMMIT LOG (Last 10 commits) ===');
  console.log(execSync('git --no-pager log --oneline -10', { cwd: projectDir }).toString());

  console.log('\n=== GIT STATUS AFTER COMMIT ===');
  console.log(execSync('git --no-pager status', { cwd: projectDir }).toString());
} catch (error) {
  console.error('Error:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
  process.exit(1);
}
