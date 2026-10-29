# Test Strategy

## Scope
This assessment covers the Demo App claims platform end-to-end, including:
- Next.js frontend
- BFF Spring Boot service
- Claims Spring Boot service
- Redis caching
- Kafka/WebSocket event flow

The objective is to identify the highest-risk areas and automate a focused set of tests that provide meaningful confidence without trying to cover the entire application exhaustively.

## Source review summary
The system architecture is as follows:
- Frontend routes are protected by middleware in [demo-app-ui/middleware.ts](./demo-app-ui/middleware.ts)
- Authentication is handled in the BFF via cookies and JWT processing in [bff-service/src/main/java/com/example/demo/config/CookieAuthenticationFilter.java](./bff-service/src/main/java/com/example/demo/config/CookieAuthenticationFilter.java)
- Security configuration and role mapping are in [bff-service/src/main/java/com/example/demo/config/SecurityConfig.java](./bff-service/src/main/java/com/example/demo/config/SecurityConfig.java) and [claims-service/src/main/java/com/example/demo/config/SecurityConfig.java](./claims-service/src/main/java/com/example/demo/config/SecurityConfig.java)
- Claim validation and business logic are in [claims-service/src/main/java/com/example/demo/domain/claim/Claim.java](./claims-service/src/main/java/com/example/demo/domain/claim/Claim.java)
- Admin access and dashboard data are in [claims-service/src/main/java/com/example/demo/adapter/in/web/AdminClaimsController.java](./claims-service/src/main/java/com/example/demo/adapter/in/web/AdminClaimsController.java), [claims-service/src/main/java/com/example/demo/adapter/in/web/DashboardController.java](./claims-service/src/main/java/com/example/demo/adapter/in/web/DashboardController.java), and [claims-service/src/main/java/com/example/demo/adapter/out/cache/DashboardStatsCache.java](./claims-service/src/main/java/com/example/demo/adapter/out/cache/DashboardStatsCache.java)
- Realtime updates are handled by WebSocket and Kafka in [bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java](./bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java) and [demo-app-ui/src/features/claims/hooks/use-realtime-claim-updates.ts](./demo-app-ui/src/features/claims/hooks/use-realtime-claim-updates.ts)

The framework implementation was built to follow this architecture and test the same boundaries directly through a live Playwright suite, with UI flows and API contracts validated against the running application.

## Live validation evidence
I validated the current app in browser session:
- Unauthenticated access to /claims redirects to /login
- Admin login with admin@example.com / ChangeMe123! succeeds and lands on /admin/dashboard
- Claimant login with claimant@example.com / ChangeMe123! succeeds and lands on /claims
- Claimant attempting /admin/dashboard receives 403 and is redirected back to /claims

## Risk-based prioritization

### Highest-risk areas
1. Authentication and authorization boundaries
   - Security-sensitive and easiest place for a defect to become a data exposure
2. Claim lifecycle logic
   - Core business rules and integrity checks
3. Cross-service integration
   - BFF -> claims service and Kafka/WebSocket integration are brittle
4. Dashboard cache behavior
   - Inconsistent cached results can mislead admins

### Lower-priority areas
- Theme toggles and purely cosmetic UI
- Exhaustive parameter variations for non-critical screens
- Broad end-to-end coverage outside the critical flows above

## Test approach
### 1. Browser-level Playwright tests
Use JavaScript Playwright to validate the user-facing system from the browser, especially:
- login/logout
- route access control
- claim creation/validation
- admin claim status updates
- dashboard access and counts
- realtime connection behavior

### 2. Focused test design
Each test should validate a single business behavior and a clear user outcome. Avoid implementation-detail assertions.

### 3. BDD-like naming conventions
Prefer test names that read like specifications, such as:
- should allow an admin user to access the dashboard
- should block a claimant from viewing the admin dashboard
- should reject a claim with a future incident date

## Proposed test suite priority
### P0 (must have)
- Auth and route protection
- Claim lifecycle validation
- Admin status transitions
- Core dashboard aggregation

### P1 (high value)
- Realtime updates
- Cache bypass and flush behavior
- Session refresh behavior

### P2 (nice to have if time remains)
- Broader negative path coverage
- Secondary edge cases and UI polish validation

## Risks identified during code inspection
### 1. WebSocket auth fallback to query parameter token
This was found in [bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java](./bff-service/src/main/java/com/example/demo/adapter/in/websocket/WebSocketAuthInterceptor.java). It accepts a token from the URL query string if cookie auth is absent. This is a genuine security concern because URLs can be logged and exposed in multiple places.

### 2. Broad exception handling in user auto-provisioning
In [bff-service/src/main/java/com/example/demo/application/auth/LoginUseCaseImpl.java](./bff-service/src/main/java/com/example/demo/application/auth/LoginUseCaseImpl.java), a broad IllegalStateException is treated as a missing-user scenario. This may mask downstream service failures and creates logic ambiguity.

### 3. Token / admin service integration dependency
The BFF depends on service-account token acquisition for admin and provisioning flows. This is a central integration point that should be rigorously tested.

## Test execution principles
- Prefer user-visible outcomes over internal state checks
- Use deterministic fixtures and clear data setup
- Keep tests small and targeted
- Make failures readable and actionable
- Do not aim for exhaustive coverage of irrelevant flows

## Outcome
This strategy is designed to provide credible confidence in the most damaging and brittle areas of the platform, with emphasis on security boundaries, business logic accuracy, and integration reliability.
