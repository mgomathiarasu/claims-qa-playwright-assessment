# Test Cases

## Objective
This document lists the highest-value Playwright test cases to automate for the claims application. The priority is based on real risk, business criticality, and integration brittleness rather than broad coverage.

## Test execution assumptions
- App is running locally and accessible at http://localhost:3001
- Backend services are running and connected to Keycloak, Redis, Postgres, Kafka, and WebSocket endpoints as required
- Test accounts available:
  - Admin: admin@example.com / ChangeMe123!
  - Claimant: claimant@example.com / ChangeMe123!

## P0 — must automate first

### 1. Auth and route protection

#### TC-AUTH-01: claimant login succeeds and routes to claims page
- Precondition: user is logged out
- Steps:
  1. Navigate to /login
  2. Enter claimant email and password
  3. Submit login form
- Expected result:
  - redirect to /claims
  - page shows claimant-specific claims view
  - welcome banner includes claimant display name

#### TC-AUTH-02: admin login succeeds and routes to dashboard
- Precondition: user is logged out
- Steps:
  1. Navigate to /login
  2. Enter admin email and password
  3. Submit login form
- Expected result:
  - redirect to /admin/dashboard
  - admin dashboard is visible
  - admin navigation items are present

#### TC-AUTH-03: invalid login is rejected
- Precondition: user is logged out
- Steps:
  1. Navigate to /login
  2. Enter invalid email/password pair
  3. Submit form
- Expected result:
  - login fails
  - user remains on login page or sees auth error
  - no protected page is accessible after failure

#### TC-AUTH-04: logout clears session and redirects to login
- Precondition: user is logged in
- Steps:
  1. Click logout
- Expected result:
  - redirected to /login
  - protected routes are blocked again
  - auth cookies are no longer accepted for protected requests

#### TC-AUTH-05: claimant cannot access admin routes
- Precondition: claimant session is active
- Steps:
  1. Navigate directly to /admin/dashboard
- Expected result:
  - access is denied
  - user is redirected or blocked
  - user is not shown admin dashboard data

#### TC-AUTH-06: admin can access dashboard and users page
- Precondition: admin session is active
- Steps:
  1. Navigate to /admin/dashboard
  2. Navigate to /admin/users
- Expected result:
  - both pages load successfully
  - relevant admin data is visible

#### TC-AUTH-07: refresh token flow keeps the user session alive
- Precondition: user is logged in and access token expires or becomes invalid
- Steps:
  1. Trigger an authenticated call after token expiration
  2. Observe automatic refresh handling
- Expected result:
  - request succeeds after refresh
  - no forced redirect to login unless refresh actually fails

### 2. Claim lifecycle

#### TC-CLAIM-01: submit a valid claim
- Precondition: claimant is logged in
- Steps:
  1. Go to /claims/new
  2. Fill valid claim fields:
     - incident date in the past
     - incident location with valid length
     - description with valid length
     - claim amount > 0 and <= 1000000
  3. Submit the claim
- Expected result:
  - claim is created successfully
  - UI confirms creation
  - claim appears in claimant list

#### TC-CLAIM-02: reject claim with amount 0
- Steps:
  1. Attempt to submit a claim with claimAmount 0
- Expected result:
  - validation fails
  - no claim is created
  - user sees an error message

#### TC-CLAIM-03: reject claim with amount greater than 1,000,000
- Steps:
  1. Attempt to submit a claim with amount 1000001 or higher
- Expected result:
  - validation fails
  - no claim is created

#### TC-CLAIM-04: reject claim with future incident date
- Steps:
  1. Submit claim with incident date later than current date
- Expected result:
  - validation fails
  - claim not created

#### TC-CLAIM-05: reject claim with short description
- Steps:
  1. Submit claim with description shorter than 10 characters
- Expected result:
  - validation fails

#### TC-CLAIM-06: reject claim with long description
- Steps:
  1. Submit claim with description longer than 1000 characters
- Expected result:
  - validation fails

#### TC-CLAIM-07: reject claim with short incident location
- Steps:
  1. Submit claim with location shorter than 5 characters
- Expected result:
  - validation fails

#### TC-CLAIM-08: reject claim with long incident location
- Steps:
  1. Submit claim with location longer than 200 characters
- Expected result:
  - validation fails

#### TC-CLAIM-09: claimant can list only their own claims
- Precondition: claimant has one or more claims
- Steps:
  1. Navigate to /claims
- Expected result:
  - only claims tied to the logged-in claimant are shown

#### TC-CLAIM-10: different claimant cannot fetch another claimant’s claim
- Precondition: two different user accounts exist with different claims
- Steps:
  1. Log in as claimant A
  2. Attempt to access claimant B’s claim ID
- Expected result:
  - request is denied or access is blocked
  - unauthorized access is not displayed

### 3. Admin status transitions

#### TC-ADMIN-01: admin can update claim status to allowed next status
- Precondition: admin is logged in and a claim exists
- Steps:
  1. Open admin claims list
  2. Update claim status to a valid next status
- Expected result:
  - update succeeds
  - claim reflects new status

#### TC-ADMIN-02: illegal transition is blocked
- Example: SUBMITTED -> CLOSED or REJECTED -> APPROVED
- Expected result:
  - API/UI rejects invalid transition
  - no status update occurs

#### TC-ADMIN-03: claim status change is reflected in claimant view
- Steps:
  1. Admin updates a claim from one status to another
  2. Log in as claimant and view their claim
- Expected result:
  - claimant sees updated claim status

### 4. Dashboard aggregation

#### TC-DASH-01: dashboard totals match underlying data
- Precondition: admin is logged in
- Steps:
  1. Navigate to /admin/dashboard
- Expected result:
  - total users and total claims match known seeded data or current database state

#### TC-DASH-02: cache hit flow works
- Precondition: dashboard cache has data available
- Steps:
  1. Load dashboard stats normally
  2. Reload or revisit dashboard without bypass
- Expected result:
  - response indicates cache hit behavior if implemented as expected

#### TC-DASH-03: bypass-cache mode returns fresh data
- Precondition: admin is logged in
- Steps:
  1. Request dashboard stats with bypass flag enabled
- Expected result:
  - fresh data is returned
  - no stale cache value is used

#### TC-DASH-04: flush cache does not break the endpoint
- Precondition: admin is logged in
- Steps:
  1. Trigger flush cache action
  2. Reload dashboard
- Expected result:
  - endpoint remains operational
  - dashboard loads successfully after cache flush

#### TC-DASH-05: stale cache vs fresh data is observable and correct
- Preconditions: cache contains old values, DB has new values
- Steps:
  1. Update datasource
  2. Load dashboard without bypass, then with bypass
- Expected result:
  - cache path and fresh path behave consistently with expected TTL and invalidation

### 5. Realtime updates

#### TC-RT-01: status change emits websocket message
- Precondition: admin and claimant sessions are connected to realtime updates
- Steps:
  1. Admin changes claim status
- Expected result:
  - claimant receives realtime websocket message reflecting claim status change

#### TC-RT-02: reconnect logic recovers after disconnect
- Precondition: app is connected to websocket
- Steps:
  1. Force disconnect or close websocket
  2. Wait for retry logic
- Expected result:
  - connection reconnects automatically within retry window
  - app resumes receiving updates

#### TC-RT-03: websocket without valid token is rejected
- Steps:
  1. Attempt WebSocket handshake without a valid token or with invalid token
- Expected result:
  - handshake fails
  - no realtime updates are accepted

## P1 — high-value after P0

- Triage of failed refresh cases
- Deeper negative path coverage for claim update permissions
- Dashboard stale-data scenarios with background DB change
- Additional realtime edge cases

## P2 — optional if time permits

- Theme toggling smoke tests
- Non-critical UI rendering checks
- Additional claim list filtering and sorting tests

## Completion criteria
The critical test suite is considered complete when the P0 set is passing and the most important security and business risk areas have automation coverage.
