# Assessment Defect Log

## Scope
This log records issues identified through source code inspection and live validation of the running application. These are not assumptions; they are tied directly to reviewed code paths and observed behavior in the local demo environment.

## Summary
I found multiple issues worth documenting, including one that should be treated as critical due to a security exposure pattern, a live API contract bug observed during execution, and a real UI ambiguity issue caused by duplicate controls.

## Defect 1 — Critical: WebSocket accepts JWT from URL query parameter
- Severity: Critical
- Files involved:
  - [bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java](./bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java)
- Rationale
  The interceptor attempts to read the token from cookies first but then falls back to a query string parameter:
  - `extractTokenFromCookies(request)`
  - `queryParams.getFirst("token")`
  This means a valid JWT can be supplied via the URL instead of a secure cookie.
- Why it matters
  URLs can be stored in logs, browser history, proxy logs, analytics tooling, and referrer chains. Using a JWT in a URL is a significant security anti-pattern and increases the chance of token leakage.
- Evidence
  The code explicitly contains the fallback:
  - check cookie token
  - if absent, read query parameter `token`
- Recommended action
  Remove the query-string token fallback entirely and require cookie-based auth only for WebSocket handshake.

## Defect 2 — High: Broad exception handling in login auto-provisioning can mask real failures
- Severity: High
- Files involved:
  - [bff-service/src/main/java/com/example/demo/application/auth/LoginUseCaseImpl.java](./bff-service/src/main/java/com/example/demo/application/auth/LoginUseCaseImpl.java)
  - [bff-service/src/main/java/com/example/demo/adapter/out/claimsservice/ClaimsServiceAdapter.java](./bff-service/src/main/java/com/example/demo/adapter/out/claimsservice/ClaimsServiceAdapter.java)
- Rationale
  The login flow does the following:
  - try to fetch the user by `userId`
  - catch `IllegalStateException`
  - assume the user is missing and auto-provision a new user
  However, `ClaimsServiceAdapter.getUser()` throws `IllegalStateException` for more than just a not-found condition. The method also throws `IllegalStateException` on other failures, which means a genuine backend failure can be mistaken for a missing user.
- Why it matters
  This hides real service problems behind a misleading recovery path and can create inconsistent user state or obscure diagnosis.
- Evidence
  The code path is clear in both files.
- Recommended action
  Differentiate between `user not found` and other exception types. Handle the not-found case explicitly and fail fast for backend/service issues.

## Defect 3 — Medium: Admin flow relies on brittle service-account token behavior
- Severity: Medium
- Files involved:
  - [bff-service/src/main/java/com/example/demo/adapter/out/keycloak/ServiceAccountTokenProviderImpl.java](./bff-service/src/main/java/com/example/demo/adapter/out/keycloak/ServiceAccountTokenProviderImpl.java)
  - [bff-service/src/main/java/com/example/demo/adapter/out/claimsservice/ClaimsServiceAdapter.java](./bff-service/src/main/java/com/example/demo/adapter/out/claimsservice/ClaimsServiceAdapter.java)
- Rationale
  Service-account token acquisition is a critical dependency for admin calls and user creation flows. The token is cached and refreshed based on expiry, but any failure in that path can break admin features.
- Why it matters
  Admin operations and user provisioning depend on this central integration. When it breaks, the app may fail in ways that are not obvious from the user-facing error or test result.
- Evidence
  The service-account token provider and adapter are central to admin flows.
- Recommended action
  Add explicit health-check and failure-mode tests for service-account token acquisition and refresh behavior.

## Defect 4 — Medium: Frontend middleware is not a security control
- Severity: Medium
- Files involved:
  - [demo-app-ui/middleware.ts](./demo-app-ui/middleware.ts)
- Rationale
  The file explicitly documents that this middleware only checks cookie existence and is not a security control. It is useful UX logic, but it should not be treated as a real guard.
- Why it matters
  This can create a false sense of security if developers assume it enforces route protection by itself.
- Evidence
  The code comment states the exact limitation: “This prevents flash of unauthenticated content but is NOT a security control.”
- Recommended action
  Leave this in place for UX, but make sure actual enforcement remains in the backend and not in the middleware alone.

## Defect 5 — Low: Cookies are configured with secure(false)
- Severity: Low
- Files involved:
  - [bff-service/src/main/java/com/example/demo/adapter/in/web/AuthController.java](./bff-service/src/main/java/com/example/demo/adapter/in/web/AuthController.java)
  - [bff-service/src/main/java/com/example/demo/config/SecurityConfig.java](./bff-service/src/main/java/com/example/demo/config/SecurityConfig.java)
- Rationale
  Cookies are set with `.secure(false)`.
- Why it matters
  This is acceptable for local HTTP-only development, but in production over HTTPS it is less secure and should be enabled when the environment supports it.
- Evidence
  The cookie configuration is explicit in the code.
- Recommended action
  Use secure cookies in non-local environments and keep HTTP-only local testing separate from production configuration.

## Defect 6 — High: Invalid claim payloads are rejected with 403/500 instead of the expected 400 validation response
- Severity: High
- Files involved:
  - [bff-service/src/main/java/com/example/demo/adapter/in/web/ClaimsController.java](./bff-service/src/main/java/com/example/demo/adapter/in/web/ClaimsController.java)
  - [demo-app-ui/src/features/claims/schemas/claim-schemas.ts](./demo-app-ui/src/features/claims/schemas/claim-schemas.ts)
- Rationale
  While executing the live API checks, a claimant session authenticated against the app was used to send a POST to `/api/claims` with a future incident date and otherwise invalid claim body. The application did not return the expected validation-level 400 response. Instead, the live test returned 403 on the first attempt and 500 on retry.
- Why it matters
  This means the API is rejecting the request at the wrong layer. A malformed or invalid claim is not being handled as a validation failure; instead, the request is being blocked by auth/handler behavior. That breaks the expected API contract and makes real validation failures difficult to diagnose.
- Evidence
  During live execution, a Playwright request using an authenticated claimant session produced:
  - `status 403` with body `{"timestamp":"...","status":403,"error":"Forbidden","path":"/api/claims"}`
  - retry returned `500`
  The test expectation was `400`.
- Recommended action
  Trace the POST `/api/claims` authorization and validation path to ensure invalid bodies fail with 400 validation errors, while genuine auth failures remain 401/403 for unauthorized callers.

## Defect 7 — Medium: Duplicate “Submit Claim” buttons create ambiguous UI actions
- Severity: Medium
- Files involved:
  - [demo-app-ui/src/components/layout/app-header.tsx](./demo-app-ui/src/components/layout/app-header.tsx)
  - [demo-app-ui/src/features/claims/components/wizard-step-3.tsx](./demo-app-ui/src/features/claims/components/wizard-step-3.tsx)
- Rationale
  The app exposes two visually similar `Submit Claim` controls: the header nav button and the final claim wizard submit action. During live test execution, Playwright reported a strict-mode violation because both matched the same locator.
- Why it matters
  This creates UI ambiguity for both users and automation. It increases the chance of accidental wrong action selection and makes test reliability worse when generic selectors are used.
- Evidence
  Live execution emitted a strict-mode error:
  - locator `getByRole('button', { name: /^Submit Claim$/i })` matched 2 elements
  The failure was reproduced during admin-flow execution in the live app.
- Recommended action
  Add distinct test IDs or make one control unique by context (for example, only the wizard final submit should be labeled as `Submit Claim`, while the header action should be renamed to `Create Claim` or similar).

## Live observed behavior
### Validated in the live app
- Unauthenticated access to /claims redirects to /login
- Claimant login succeeds
- Admin login succeeds
- Claimant cannot access admin dashboard successfully; the app returns 403 and redirects to /claims
- One live UI defect was reproduced: duplicate `Submit Claim` controls caused strict-mode selector failures in automation
- One live API defect was reproduced: invalid claim submission returned 403/500 instead of the expected 400 validation response

These observations align with the intended role-based access model but also expose real implementation gaps in validation and UI control design.

## Overall assessment
The most severe discovered issues are the WebSocket token fallback and the API validation-layer bug. The UI duplicate-button ambiguity is lower severity but still real and should be fixed because it creates confusion and brittle automation. The remaining issues are mostly about reliability, logic clarity, and deployment-hardening rather than immediate user-visible breakage.
