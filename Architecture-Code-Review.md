# CLPS .NET Solution — Architecture and Code Review

**Review date:** 2026-10-16  
**Scope:** `CLPS.Service.sln` and its .NET projects (`CLPS.Service`, `CLPS.WebUI`, `CLPS.Tests`). Static UI JavaScript is included where it is served by the WebUI and creates a security path to the API. Findings describe current source; environment and database deployment behavior are not inferred.

## 1. Architecture Assessment

### Summary

The solution is a layered ASP.NET Core application: the API project contains controllers, feature services, models, validators and infrastructure adapters; the separate WebUI project serves static files; the tests project references the service. Constructor injection and service interfaces establish some test seams, while database queries remain embedded in feature services rather than a repository layer.

### Architecture quality scores

| Area | Score / 10 | Evidence-based rationale |
|---|---:|---|
| Architecture quality | 5 | Controllers, services, validation and infrastructure are identifiable; feature orchestration and data access share one project and services contain embedded SQL. |
| Layer separation | 5 | Controllers call interfaces and services call database/integration abstractions, but domain/application/infrastructure are not separate projects. |
| Dependency management | 6 | `Program.cs` registers most services with constructor-injected interfaces. There is duplicate `ISftpService` registration and some constructor dependencies are unused. |
| Coupling | 4 | `CreateLTController` injects many feature services; workflows directly coordinate SQL, HydraX and print services. |
| Cohesion | 5 | Feature folders group related behavior, but `CreateLTController` covers many unrelated operations and some services own multiple workflow stages. |
| Clean Architecture compliance | 4 | Interface boundaries exist; infrastructure, controllers, application logic and models are co-located in `CLPS.Service`. |
| SOLID compliance | 4 | DI and interfaces are used, while large controller/service responsibilities and unused dependencies weaken single-responsibility and interface discipline. |

### Confirmed architecture issues

| ID | Severity | Risk | File | Class | Method | Evidence | Recommendation |
|---|---|---|---|---|---|---|---|
| A-01 | Medium | Controller changes and tests are coupled across LT, batch, printing, machine, site and UI-config workflows. | [Controllers/CreateLTController.cs](../Controllers/CreateLTController.cs) | `CreateLTController` | Constructor and actions | Constructor injects over 15 service/configuration dependencies; same controller declares the listed endpoint groups. | Split by business capability, keeping shared route conventions and response contracts consistent. |
| A-02 | Low | Unused or duplicate registrations/dependencies make the DI graph harder to understand. | [Program.cs](../Program.cs), [Services/CreateLT/Internal/CreateLTInternalService.cs](../Services/CreateLT/Internal/CreateLTInternalService.cs), [Services/LTInsert/LTInsertService.cs](../Services/LTInsert/LTInsertService.cs) | Top-level application, `CreateLTInternalService`, `LTInsertService` | DI setup, constructors | `ISftpService` is registered twice; `_batchService` in `CreateLTInternalService` and site configuration/factory fields in `LTInsertService` are not used by the current insert path. | Remove unused dependencies and duplicate registrations; verify all service registrations through a startup/DI test. |
| A-03 | Medium | Application services own SQL queries and transaction details, so schema changes can spread across feature code and query behavior is harder to test independently. | [Services/LTInsert/LTInsertService.cs](../Services/LTInsert/LTInsertService.cs), [Services/Order/GetOrderDetailsService.cs](../Services/Order/GetOrderDetailsService.cs), [Services/Batch/LTBatchService.cs](../Services/Batch/LTBatchService.cs) | `LTInsertService`, `GetOrderDetailsService`, `LTBatchService` | `InsertLTAsync`, `GetOrderDetailsAsync`, `GenerateLTBatch` | SQL statements are declared/constructed in feature service implementations and executed through `IDbContext`. | Keep transaction ownership explicit; extract query responsibilities where it improves testability and schema change isolation. |
| A-04 | Medium | A request-scoped `CreatePrintLTService` stores `installationId` as mutable service state for later retry/config reads. Concurrent use of the same scope can cross-contaminate settings. | [Services/CreatePrintLT/CreatePrintLTService.cs](../Services/CreatePrintLT/CreatePrintLTService.cs) | `CreatePrintLTService` | `ExecuteAsync`, `GetRetryCountAsync` | `installationId` is a mutable field set in `ExecuteAsync` and read later in `GetRetryCountAsync`. | Pass installation ID as a method parameter through retry/config methods; avoid per-operation state in services. |
| A-05 | Medium | The accepted LT class surface differs from the class values handled by LT ID prefix generation. | [Validators/CreateLTValidator.cs](../Validators/CreateLTValidator.cs), [Services/CreateLT/Internal/CreateLTInternalService.cs](../Services/CreateLT/Internal/CreateLTInternalService.cs) | `CreateLTValidator`, `CreateLTInternalService` | `ValidateAsync`, `GetPrefix` | Validator accepts `4S`; `GetPrefix` handles `3S` and `3SI` and throws otherwise. | Derive validator and ID-generation accepted values from one shared rule and test every accepted class end-to-end. |

## 2. Security Assessment

### Confirmed issues

| ID | Severity | Risk | File | Class | Method | Evidence | Recommendation |
|---|---|---|---|---|---|---|---|
| S-01 | Critical | Unauthenticated callers can obtain a token carrying a fixed Admin role because the login action accepts no credentials and performs no identity validation. | [Controllers/AuthController.cs](../Controllers/AuthController.cs) | `AuthController` | `login` | Claims are hard-coded to Name and Role=Admin; method has no input credential or user-validation dependency; token lifetime is one day. | Disable this endpoint outside local development; integrate an approved identity provider; issue short-lived tokens only after authenticating a real identity. |
| S-02 | Critical | Operational endpoints can be invoked without authentication, including actions that create, print or modify manufacturing state. | [Controllers/CreateLTController.cs](../Controllers/CreateLTController.cs) | `CreateLTController` | `CreateLT`, `LogonOutputBatch`, `LogoffOutputBatch`, `PrintOutputBatch`, `CreatePrintLT`, others | These actions are marked `[AllowAnonymous]`; other actions have no authorization attribute; `Program.cs` registers no fallback authorization policy. | Apply deny-by-default authorization and explicit permission policies to every API action that reads protected data or changes production state. |
| S-03 | High | Committed configuration contains a JWT signing key and database/HydraX credential values. | [appsettings.json](../appsettings.json) | Configuration | — | `Jwt:Key` and `Sites` entries include secret-like values. Values are intentionally not reproduced in this report. | Treat committed values as exposed: rotate them, remove them from source history where policy requires, and inject per-environment secrets from an approved secret store. |
| S-04 | High | SQL transport encryption is disabled and certificate trust is enabled in the connection-string builder. | [Infrastructure/Database/ConnectionFactory.cs](../Infrastructure/Database/ConnectionFactory.cs) | `ConnectionFactory` | `BuildConnectionString` | Sets `Encrypt = false` and uses `site.TrustServerCertificate` from configuration. | Require SQL encryption, validate certificates, and set secure defaults independent of environment configuration. |
| S-05 | High | HydraX credentials are sent using Basic authentication to the configured base URL; checked-in site examples configure an `http://` base URL. | [Infrastructure/HydraX/HydraXClient.cs](../Infrastructure/HydraX/HydraXClient.cs), [appsettings.json](../appsettings.json) | `HydraXClient` | `PostAsync` | Encodes username/password into an HTTP Basic Authorization header and posts to `config.BaseUrl`; sample config uses HTTP. | Require HTTPS for all HydraX endpoints, reject non-TLS URLs in production configuration, and rotate credentials. |
| S-06 | High | Any origin is allowed to call the API; combined with anonymous state-changing endpoints, browser-based cross-origin requests can reach production actions. | [Program.cs](../Program.cs) | Top-level application | CORS policy setup | `AllowAll` uses `AllowAnyOrigin`, `AllowAnyHeader`, `AllowAnyMethod`, and is applied with `UseCors("AllowAll")`. | Restrict CORS to explicit trusted origins and required methods/headers; authorization must remain the primary security control. |
| S-07 | Medium | Unhandled exception responses disclose exception messages and stack traces; several service/controller error paths return exception text. | [Program.cs](../Program.cs), [Controllers/CreateLTController.cs](../Controllers/CreateLTController.cs), [Services/Associate/AssociateService.cs](../Services/Associate/AssociateService.cs) | Top-level handler, `CreateLTController`, `AssociateService` | Exception handler, `GetUIConfig`, `ExecuteAsync` | Global JSON includes `exception.Message` and `exception.StackTrace`; `GetUIConfig` returns `ex.Message`; association errors wrap exception text and in one helper include SQL and parameters. | Return a stable generic error and correlation ID; log diagnostics server-side with sensitive values redacted. |

### Potential security risks

| ID | Severity | Risk | File | Class | Method | Evidence | Recommendation |
|---|---|---|---|---|---|---|---|
| S-08 | High | Potential DOM XSS if an API or integration-controlled message reaches UI status rendering: messages are inserted with jQuery `.html()` and some UI paths interpolate response fields into HTML templates. | [CLPS.WebUI/wwwroot/clps/js/ui.js](../../CLPS.WebUI/wwwroot/clps/js/ui.js), [CLPS.WebUI/wwwroot/clps/js/dashboard.js](../../CLPS.WebUI/wwwroot/clps/js/dashboard.js), [CLPS.WebUI/wwwroot/clps/js/events.js](../../CLPS.WebUI/wwwroot/clps/js/events.js) | UI functions | `showError`, `showSuccess`, `showWarning`, `changeOutputBatch`, `bindActionButtons` | Status functions use `$("#statusArea").html(...)`; UI interpolates `printMessage`/`newLT`/LT values into markup. Exploitability depends on whether attacker-controlled values can reach these response fields and the UI. | Render untrusted values through text nodes or an HTML encoder; avoid concatenating API data into markup; add tests using HTML/script payloads in API response fields. |
| S-09 | Medium | Login issues an Admin role claim, while the only observed endpoint-level authorization is generic `[Authorize]`; no role policy is applied to that action. | [Controllers/AuthController.cs](../Controllers/AuthController.cs), [Controllers/CreateLTController.cs](../Controllers/CreateLTController.cs) | `AuthController`, `CreateLTController` | `login`, `Associate` | Login creates `ClaimTypes.Role=Admin`; `Associate` uses `[Authorize]` without a role/policy declaration. | Define explicit roles/claims per operation and ensure identity claims come from the authentication authority. |

### Vulnerability categories reviewed

| Category | Review result |
|---|---|
| SQL injection | No confirmed SQL injection in the reviewed dynamic SQL paths. Query values are generally Dapper/SqlCommand parameters; generated sequence identifiers are derived from building values restricted to alphanumeric characters or normalized to alphanumeric. |
| XSS | Potential DOM XSS path is documented as S-08; reachability and exploitability require testing of response data paths. |
| CSRF | No cookie authentication or anti-forgery mechanism was identified; major state-changing API routes permit anonymous requests, so CSRF tokens would not address the primary authorization issue. |
| SSRF | No confirmed user-controlled URL passed into `HttpClient` was identified; HydraX URLs are resolved from configuration. |
| Insecure deserialization | No confirmed unsafe polymorphic deserialization or type activation was identified in inspected service code; `System.Text.Json` parses HydraX responses as `JsonDocument`. |
| Privilege escalation / broken authentication | Confirmed by S-01 and S-02. |
| Sensitive data exposure | Confirmed by S-03 and S-07; transport encryption concerns are S-04 and S-05. |
| Azure AD / Identity / Data Protection | No implementation identified in analyzed source code. |

## 3. Performance Assessment

### Confirmed performance concerns

| ID | Severity | Risk | File | Class | Method | Evidence | Recommendation |
|---|---|---|---|---|---|---|---|
| P-01 | Medium | LT creation is serialized behind one static semaphore per process, so unrelated orders and sites queue behind a single critical section. | [Services/CreateLT/Internal/CreateLTInternalService.cs](../Services/CreateLT/Internal/CreateLTInternalService.cs) | `CreateLTInternalService` | `CreateLTAsync` | Static `SemaphoreSlim(1,1)` is acquired before box retrieval and released in `finally`. | Remove process-wide serialization where database sequences/constraints provide safe allocation; otherwise narrow lock key/scope and measure throughput. |
| P-02 | Medium | The static box cache has no expiry or eviction and is keyed by order/class without installation identity; lifetime memory use grows with distinct keys and stale values can be reused. | [Services/Box/LTBoxService.cs](../Services/Box/LTBoxService.cs) | `LTBoxService` | `GetLatestBoxAsync`, `IncrementBoxAsync` | Static `ConcurrentDictionary<(string order, string ltClass), long>`; no expiry/removal in normal flow. | Scope keys by site, define invalidation/retention, and use DB-backed allocation if box correctness is cross-instance. |
| P-03 | Medium | `LTIdService` uses a static, unbounded cache keyed only by prefix/building; caches are process-local and not partitioned by database/site. | [Services/LT/LTIdService.cs](../Services/LT/LTIdService.cs) | `LTIdService` | `GenerateLTIDAsync`, `UpdateMemory` | Static dictionary key `${prefix}-${normalizedBuilding}`; no expiration/removal in normal flow. | Include installation/database identity in the key and define invalidation; verify identifier uniqueness across site databases and service instances. |
| P-04 | Low | Some asynchronous request paths still perform synchronous operations. | [Infrastructure/Database/DbContextWrapper.cs](../Infrastructure/Database/DbContextWrapper.cs), [Controllers/CreateLTController.cs](../Controllers/CreateLTController.cs) | `DbContextWrapper`, `CreateLTController` | `ExecuteAsync`, `GetPublic` | Async wrapper calls synchronous `connection.BeginTransaction()`; `GetPublic` calls `File.ReadAllText`. | Use asynchronous transaction and file APIs where supported and relevant to request latency. |
| P-05 | Medium | Retry loops on state-changing HydraX, print and logon/logoff operations can repeat effects after ambiguous timeouts or response loss. | [Services/CreatePrintLT/CreatePrintLTService.cs](../Services/CreatePrintLT/CreatePrintLTService.cs), [Services/LogonOutputBatch/LogonOutputBatchService.cs](../Services/LogonOutputBatch/LogonOutputBatchService.cs), [Services/PrintOutputBatch/PrintFileService.cs](../Services/PrintOutputBatch/PrintFileService.cs) | Workflow services | `ExecuteWithRetryAsync`, retry helpers, `UploadWithRetryAsync` | Retry helpers re-invoke supplied operations after exceptions; no common idempotency token contract is visible in these wrappers. | Confirm downstream idempotency; add operation IDs/deduplication or reconciliation before retrying non-idempotent side effects. |
| P-06 | Low | Local `.dd` files are deleted only after successful upload; an exception before cleanup leaves the temporary file behind. | [Services/PrintOutputBatch/PrintFileService.cs](../Services/PrintOutputBatch/PrintFileService.cs) | `PrintFileService` | `PrintFileAsync` | `TryDeleteTemporaryFile(localFile)` follows `UploadWithRetryAsync`; exception path catches and returns without a `finally` cleanup. | Move deletion to a `finally` block and log cleanup failure. |

### N+1 queries, indexes, scans and memory

- **N+1:** `CreateLabelDataService.CreateLabelDataInternalAsync` loads product, class, country and shipping data before iterating label-map fields. The shown `ResolveFieldValueAsync` path operates on in-memory values; no per-field database query was identified in that loop.
- **Index strategy:** the source includes `TOP 1 ... ORDER BY created_date DESC` and filters by LT/order/building/machine. No checked-in schema DDL or migration defines indexes, so missing-index status is **unknown**. Validate the deployed schema and execution plans before adding indexes.
- **Full scans:** query plans and table sizes are not included in source. No full scan is asserted from SQL text alone.
- **Memory:** the two static caches have no expiry/eviction; this is a code-confirmed boundedness concern when workload creates unbounded distinct keys. Label creation also materializes label fields and complete DD content in memory before writing.
- **Thread starvation/blocking:** no synchronous waits such as `.Result`/`.Wait()` were identified in the reviewed main paths. The static semaphore queues asynchronous waiters but serializes throughput; this is not evidence of thread starvation.

### Performance recommendations

Measure SQL latency and plans, implement site-scoped bounded cache behavior, reduce or eliminate the global lock, establish downstream idempotency before retries, ensure file cleanup, and load-test LT creation/printing with concurrent requests and realistic label-map sizes.

## 4. Technical Debt Register

| ID | Severity | Finding | Impact | Recommendation |
|---|---|---|---|---|
| TD-01 | Critical | Dummy login issues fixed Admin JWT; broad anonymous API surface. (S-01, S-02) | Unauthenticated callers can invoke manufacturing workflows. | Replace demo authentication and adopt deny-by-default authorization. |
| TD-02 | High | Secret-like JWT/database/HydraX values are committed in `appsettings.json`; SQL encryption is disabled and HydraX examples use HTTP. (S-03–S-05) | Credential compromise or interception can enable unauthorized access. | Rotate secrets, externalize configuration, require TLS and validate certificates. |
| TD-03 | High | Wildcard CORS and exception detail exposure. (S-06, S-07) | Cross-origin access to public operations and disclosure of internal details. | Restrict CORS; return generic errors with correlation IDs. |
| TD-04 | High | Potential unsafe HTML rendering of response data in UI. (S-08) | DOM XSS if untrusted API fields reach HTML status messages. | Use text rendering/encoding and add payload tests. |
| TD-05 | High | `4S` validation conflicts with `GetPrefix` accepted cases. (A-05) | Requests accepted by validation later throw during LT generation. | Unify accepted values and add end-to-end tests per class. |
| TD-06 | High | Running-order SQL includes a fixed order-number predicate. | Endpoint behavior is constrained to one order despite accepting machine as input. | Remove the fixed literal or make intended order criterion an explicit request parameter and test. |
| TD-07 | Medium | Quantity resolves to zero when request and Print Master quantity are unavailable. | LT can be recorded with a zero quantity when neither input resolves. | Make missing quantity an explicit validation failure or codify a business-approved fallback. |
| TD-08 | Medium | Failed Print Master batch resolution can continue with batch `"0"`; request batch is not forwarded. | Incorrect/missing batch traceability in LT records. | Fail closed for unresolved batch where required and wire a supported request-batch contract. |
| TD-09 | Medium | Process-local static caches are unbounded and not site-scoped; cache updates occur before SQL transaction commit. | Stale/cross-site values, inaccurate box state after rollback, and process memory growth. | Use site-aware cache keys, bounded expiry, commit-aware updates and database allocation safeguards. |
| TD-10 | Medium | Static semaphore serializes all LT creation within an application process. | Throughput ceiling and queueing during load. | Replace with narrowly scoped coordination or rely on atomic DB allocation. |
| TD-11 | Medium | `CreateLTController` has high dependency/action count; long orchestration methods mix workflow stages. | Change risk, test complexity and weak cohesion. | Split feature controllers and extract workflow steps with explicit contracts. |
| TD-12 | Medium | `CreatePrintLTService` uses mutable instance state for installation ID and retries side-effecting operations. | Same-scope concurrency hazards and duplicate side effects after ambiguous exceptions. | Pass state explicitly and make retries idempotent. |
| TD-13 | Medium | Only three active xUnit facts were identified; core LT creation/ID/print test files have commented-out test declarations. | Critical workflow behavior lacks active automated regression coverage. | Activate or replace tests; add integration and concurrent-operation tests. |
| TD-14 | Low | Temporary print file cleanup is not in `finally`; `GetPublic` performs synchronous file read. | Orphan temp files and avoidable synchronous request work. | Ensure cleanup in `finally`; use async read API. |
| TD-15 | Low | Duplicate SFTP registration, unused injected dependencies, commented blocks and debug log statements remain. | Confusing composition and increased maintenance burden. | Remove dead code and unused dependency registrations. |

## 5. Production Readiness Report

Scores are source-based and indicate implementation readiness visible in the solution; they do not certify deployed infrastructure.

| Category | Score / 10 | Justification |
|---|---:|---|
| Reliability | 4 | SQL transaction wrapper and selected retries exist; LT cache updates precede commit, errors are handled inconsistently, and retries may repeat external side effects. |
| Scalability | 3 | LT creation uses a static global semaphore; process-local unbounded caches are not distributed and no load-test evidence is present in active tests. |
| Security | 1 | Dummy Admin token issuance, anonymous state-changing routes, committed secrets, permissive CORS, disabled SQL encryption and exception detail exposure are confirmed in source. |
| Maintainability | 4 | Feature folders/interfaces provide structure; controller scope, embedded SQL, long workflows, unused fields and limited active tests increase change risk. |
| Observability | 3 | Serilog console/file logging and structured messages exist; no metrics/tracing/health-check registration was identified in analyzed source. |
| Monitoring | 1 | No monitoring or alerting implementation was identified in analyzed source. |
| Recoverability | 2 | SQL rollback is attempted and some workflows retry; no recovery/reconciliation workflow for SQL↔HydraX or print upload outcomes was identified in reviewed source. |

### Release-readiness priorities

1. Replace demo authentication and protect every operational endpoint.
2. Rotate/externalize committed secrets; enforce encrypted SQL and HydraX transport.
3. Restrict CORS and remove exception/SQL details from client responses.
4. Address LT class/quantity/batch correctness and fixed running-order predicate.
5. Bound/site-scope caches and verify commit behavior under failures and concurrency.
6. Add active tests for LT creation, ID formats, transaction rollback, batch behavior, print status changes and HydraX retry/idempotency.

## 6. Modernization Roadmap

### Immediate Actions (0–30 Days)

- Disable or replace `AuthController.login`; add deny-by-default authorization to the API.
- Rotate secrets stored in `appsettings.json`; move deployment values out of source.
- Require SQL Server encryption and HydraX HTTPS; validate certificates.
- Restrict CORS and return sanitized exception responses.
- Fix the `4S` validator/prefix mismatch and the hard-coded running-order predicate.
- Decide explicit handling for missing quantity and failed batch resolution.
- Add tests for the corrected LT creation transaction path and test/production ID marker behavior.

### Short-Term Improvements (1–3 Months)

- Replace UI `.html()` message insertion with safe text rendering and add DOM-XSS regression tests.
- Make all retryable state-changing operations idempotent or add reconciliation/deduplication.
- Scope and bound static caches; coordinate updates with successful transaction completion.
- Split `CreateLTController` by domain capability and remove unused/duplicate DI entries.
- Add active unit tests for LT validation, ID generation, batch, print, and logon/logoff; create database/integration tests.
- Add structured API error codes and correlation IDs.

### Medium-Term Improvements (3–6 Months)

- Extract data-access components from feature services where it improves query testability and change isolation.
- Baseline representative SQL execution plans and index strategy against deployed schemas.
- Add metrics, distributed tracing, health/readiness endpoints and alert integration.
- Run load/concurrency tests for LT generation, batch allocation and print delivery.
- Document idempotency, recovery and reconciliation across SQL, HydraX and print transfer operations.

### Long-Term Strategy (6–12 Months)

- Establish bounded contexts and project dependency rules separating API, application workflows, domain rules and infrastructure.
- Centralize identity, secrets, certificates and endpoint policies across environments.
- Formalize LT lifecycle state transitions, audit events and manufacturing traceability invariants.
- Adopt a durable coordination/outbox design if SQL and HydraX state must converge after partial failures.
- Maintain API contracts and generated clients with automated compatibility tests.

## Review Coverage and Unknown Areas

### Areas reviewed

Solution/project manifests, service startup and DI, controllers and routes, LT creation, order/machine/site validation, batch and box allocation, SQL wrapper and inserts, print workflow, HydraX client, SFTP upload, configuration, active tests, UI status rendering and security/performance-related query patterns.

### Unknown areas

| Area | Status |
|---|---|
| Repository implementation, EF Core model/configuration, migrations, hosted/background services | Not identified in analyzed source code. |
| Active integration-test fixtures or a separate integration-test project | Not identified in analyzed source code; the solution contains three active xUnit facts in `LTBoxServiceTests`. |
| Physical database indexes, constraints, table sizes and actual execution plans | Not identified in analyzed source code. |
| Production secret overlays, network restrictions, TLS termination and external gateway controls | Not identified in analyzed source code. |
| HydraX and BarTender idempotency/acknowledgement semantics | Not identified in analyzed source code. |
| Operational monitoring/alert definitions, backup/restore tests and recovery objectives | Not identified in analyzed source code. |
| Complete exploitability of UI message injection paths under deployed configuration/data | Requires a runtime security test; source shows unsafe HTML insertion paths. |

### Other security categories

In inspected SQL query paths, values are generally parameterized; dynamic sequence identifiers are formed from alphanumeric/normalized building values. No confirmed SQL injection, SSRF or unsafe polymorphic deserialization finding was established by this source review. No cookie-based authentication or anti-forgery token flow was identified; the main risk is anonymous access to state-changing endpoints rather than a separate cookie-based CSRF path.
