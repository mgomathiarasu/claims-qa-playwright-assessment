# AI Working Journal

## Overview
This journal captures the key decisions, accepted assumptions, challenged points, and overrides used while building the Playwright QA framework for the claims application assessment.

## Assessment phase

### 2026-10-29
- Reviewed the live application and source code across the frontend, BFF, and claims service.
- Accepted the primary risk areas as authentication/authorization, claim validation, admin workflows, dashboard cache behavior, and realtime updates.
- Challenged the assumption that invalid claim responses would necessarily return a specific 400 contract; validated the live behavior directly in the app instead of assuming the expected backend response.
- Verified user flows against the actual running app using the provided credentials.
- Confirmed live evidence for claimant/admin route protection and successful login behavior.
- Recorded the critical WebSocket token concern and several real defects discovered during code review and live validation.

## Framework phase

### 2026-10-29
- Created a JavaScript Playwright framework aligned to the highest-risk assessment areas.
- Used modular structure with page objects, support fixtures, API helpers, and artifact utilities.
- Accepted the need for clean per-test evidence capture under `test-results` for logs, screenshots, video, and traces.
- Challenged earlier artifact assumptions when the test output was stale or incomplete; corrected the cleanup and capture process to produce fresh artifacts per test case.
- Overrode generic automation assumptions after observing strict-mode UI issues caused by duplicate `Submit Claim` buttons.
- Kept the suite evidence-first and focused on business behavior rather than implementation details.

## Test design decisions

### Accepted
- Focus on P0 and P1 flows: auth, claim validation, admin transitions, dashboard stats, websocket state visibility.
- Cover both UI and API checks to validate the system from user and contract perspectives.
- Capture artifact evidence for every relevant test case.
- Keep default execution headless, with an explicit headed option available.

### Challenged and corrected
- Initial assumptions around exact validation error payloads were tested against real app behavior before finalizing assertions.
- Initial artifact layout and cleanup logic were adjusted to remove stale output and ensure one fresh folder per test case.
- Duplicate or ambiguous selectors in the UI were handled by explicit locators rather than brittle generic matches.

### Overridden
- Avoided broad, low-value testing of cosmetic elements and non-critical flows.
- Did not rely solely on static code reading; live browser verification was used to confirm actual app behavior.
- Kept the framework scoped to the assessment requirements rather than adding unrelated coverage.

## Risk and defect handling
- Identified the critical WebSocket token concern where a JWT may be accepted from the URL query string.
- Documented the invalid claim payload response mismatch observed in the live app.
- Recorded UI ambiguity caused by duplicate `Submit Claim` controls.
- Kept all defect judgments tied to actual code inspection and live evidence.

## Final note
The framework and supporting assessment documentation are intentionally scoped to the highest-risk and highest-value flows required by the assessment brief. The implementation was shaped by live evidence, not assumptions, and the test suite is designed to provide meaningful confidence without pretending to cover the entire system exhaustively.
