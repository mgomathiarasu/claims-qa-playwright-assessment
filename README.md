# Claims QA Playwright Framework

This project is a JavaScript Playwright test framework built to validate the Demo App’s authentication, claims workflow, admin rules, dashboard behavior, and realtime functionality using the live application as the source of truth.

## What is included

- UI automation for claimant/admin authentication and route protection
- Claim creation and validation checks
- Admin status transition validation
- Dashboard stats/cache behavior verification
- Realtime status checks
- API-level validation for claim and dashboard endpoints
- Per-test artifact capture for logs, screenshots, video, and trace
- Default headless execution with a headed override

## Project structure

```text
playwright-qa-framework/
├─ README.md
├─ package.json
├─ playwright.config.js
├─ .env.example
├─ .gitignore
├─ src/
│  ├─ api/
│  │  ├─ authApi.js
│  │  ├─ claimsApi.js
│  │  └─ adminApi.js
│  ├─ domain/
│  │  └─ claimFactory.js
│  ├─ service/
│  │  ├─ authService.js
│  │  └─ claimService.js
│  └─ infrastructure/
│     ├─ config.js
│     └─ logger.js
├─ tests/
│  ├─ ui/
│  │  ├─ auth.spec.js
│  │  ├─ claims-workflow.spec.js
│  │  └─ admin-flow.spec.js
│  ├─ api/
│  │  └─ claims-api.spec.js
│  └─ support/
│     ├─ fixtures/
│     │  └─ users.js
│     ├─ page-objects/
│     │  ├─ loginPage.js
│     │  ├─ claimsPage.js
│     │  └─ adminDashboardPage.js
│     ├─ apiClient.js
│     └─ testArtifacts.js
├─ test-results/
│  ├─ logs/
│  ├─ Screenshots/
│  ├─ Video/
│  └─ Trace/
└─ docs/
   └─ QA_STRATEGY.md
```

## Implemented test coverage

### UI tests
- Auth and route protection
  - admin login success
  - claimant login success
  - invalid login rejected
  - claimant blocked from admin route
- Claim creation and validation
  - valid claim submission through wizard
  - invalid claim amount/date/location checks
  - description length validation
  - claimant cannot delete claims from list
- Admin workflow
  - submitted claim can move to under review
  - dashboard cache controls remain usable
  - realtime status indicator visible for authenticated users

### API tests
- claimant can fetch their own claims
- admin dashboard stats endpoint returns data
- invalid claim payload is rejected by backend validation

## Execution commands

From the project folder:

```powershell
cd "C:\Users\aspir\Documents\tech-assess-qa\tech-assess-qa\demo-app\code\playwright-qa-framework"

# run all UI tests
npx.cmd playwright test tests/ui --reporter=line

# run all API tests
npx.cmd playwright test tests/api --reporter=line

# run all tests
npx.cmd playwright test --reporter=line

# headed mode
npx.cmd playwright test tests/ui --headed --reporter=line
```

Default execution is headless. Use `--headed` to open the browser visually.

## Artifact output structure

Each test creates artifacts under `test-results/`:

- `logs/` — one log file per test case
- `Screenshots/` — per-test folders with step-level screenshots
- `Video/` — per-test `.webm` video
- `Trace/` — per-test `.zip` trace

Before each execution, stale output is cleaned so the current run reflects fresh artifacts only.

## Notes
- The app must be running locally before executing tests.
- The framework is aligned to the assessment priorities: auth, claim validation, admin lifecycle, dashboard/cache behavior, and realtime flows.
- All automation is designed to capture evidence and avoid relying on assumptions from static code alone.
