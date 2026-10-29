# QA Strategy

## Objective
The purpose of this QA strategy is to validate the Demo App claims workflow against the business and security requirements observed during live assessment of the application, frontend, BFF, and claims service. The approach emphasizes evidence-driven testing over assumptions, with execution against the running application and structured artifact capture for each test case.

## Scope
This strategy covers the highest-risk and business-critical flows for the claims platform:

- authentication and route protection
- claimant and admin role behavior
- claim creation and validation rules
- admin decision-making and status transitions
- dashboard aggregation and cache behavior
- realtime update behavior
- API contract validation for claim and dashboard endpoints

## Risk-based prioritization
The assessment identified the following risk areas:

1. Authentication and authorization failures
   - unauthenticated access to protected pages
   - claimant access to admin routes
   - role-based API restrictions

2. Claim validation integrity
   - future incident dates
   - invalid amounts and amounts beyond limits
   - invalid location/description length rules
   - bad or incomplete payloads

3. Admin workflow integrity
   - invalid state transitions
   - incorrect enforcement of business rules
   - status update visibility in UI/API

4. Dashboard correctness and cache behavior
   - stale or inconsistent totals
   - cache flush and bypass flows
   - incorrect values when cache is stale

5. Realtime / WebSocket behavior
   - connection initialization for authenticated users
   - invalid token / handshake rejection scenarios
   - status propagation after state changes

## Test approach

### 1. UI validation
UI tests verify that the user experience and role-based access are correct in the browser. They also validate claim creation, step navigation, validation feedback, and admin actions.

### 2. API validation
API tests verify backend contract behavior independently from the browser layer. These checks confirm whether endpoints return expected status codes, payloads, and role restrictions.

### 3. Live application validation
The framework executes against the actual running app and uses live evidence from the browser and API responses. This reduces false positives from static code assumptions.

### 4. Evidence capture
Each test case records:
- log output
- step screenshots
- video recording
- trace file
- pass/fail result to the Playwright run output

## Test design principles
- Test the real app behavior, not assumptions from source code alone
- Validate both happy-path and rejection paths
- Cover both UI and API layers
- Include role-based checks for claimant versus admin users
- Prefer regression-safe automation for critical workflows
- Preserve evidence for every test case

## Priority groups

### P0 — must run every cycle
- valid login for claimant
- valid login for admin
- invalid login rejected
- claimant blocked from admin route
- valid claim submission
- invalid claim amount/date/location checks
- admin status update transitions
- dashboard stats endpoint / cache behavior

### P1 — run for each release or wider regression
- description length validation checks
- claimant cannot see other claimant claims
- admin can update claims and state changes reflect in response
- realtime status indicator visible
- websocket handshake rejection for bad token

### P2 — run during deeper regression / exploratory validation
- stale cache vs fresh data behavior
- reconnect handling after websocket interruption
- broader edge-case admin transitions

## Automation structure
The framework is split into layered concerns:

- UI specs for browser interactions
- API specs for contract validation
- support utilities for users, credentials, and artifact capture
- service/domain helpers to keep data generation and app logic reusable

This keeps the suite maintainable and aligned with the risk-based test priorities.

## Execution model
- Default mode: headless
- Optional mode: headed via Playwright CLI flag
- Tests run against the local app at `http://localhost:3001`
- Each test is isolated with its own artifact directory under `test-results`

## Expected outcomes
The framework is intended to provide measurable assurance that:
- only valid roles access the correct areas
- claim validation rules are enforced consistently
- admin transitions are controlled by approved rules
- dashboard totals remain accurate with cache logic
- realtime notifications and session behavior function as designed

## Exit criteria
The QA cycle is considered successful when all prioritized P0 and P1 tests pass with trace/video/log evidence, and no unresolved critical or high-severity defects remain unverified.
