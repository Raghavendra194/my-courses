This application belongs to a manufacturing and label tracking system (CLPS).

Pay special attention to:

- LT (Label Tracking) generation lifecycle
- Batch management lifecycle
- Print Master retrieval
- Order validation workflow
- Machine validation workflow
- Site resolution workflow
- Label printing workflow
- Database transaction boundaries
- Concurrency control mechanisms
- Manufacturing traceability requirements

Produce a dedicated section called:

"LT Creation End-to-End Workflow Analysis"

Show exactly how CreateLTController → CreateLTService → CreateLTContextBuilder → CreateLTInternalService executes, including validations, database updates, transaction flow, and error handling.


Act as a Principal Software Architect, Enterprise Architect, Solution Architect, Security Architect, Technical Lead, and Technical Writer.

Analyze the entire repository and generate comprehensive enterprise-grade technical documentation.

Repository Analysis Requirements

1. Scan the complete solution:
   - Solution (.sln)
   - All .csproj files
   - Controllers
   - Services
   - Interfaces
   - Repositories
   - Models
   - DTOs
   - Validators
   - Middleware
   - Background Services
   - Database Access Layer
   - Entity Framework Models
   - Migrations
   - SQL Scripts
   - Configuration Files
   - appsettings.json
   - Program.cs
   - Startup.cs
   - Docker Files
   - Kubernetes Files
   - YAML Pipelines
   - Unit Tests
   - Integration Tests

2. Build a complete architectural understanding of:
   - Business functionality
   - Application architecture
   - Data architecture
   - Integration architecture
   - Security architecture
   - Deployment architecture

3. Do NOT make assumptions.
   Every statement must be based on source code evidence.

4. For every finding provide:
   - File name
   - Class name
   - Method name (if applicable)
   - Evidence from source code

5. Clearly identify:
   - Confirmed findings
   - Unknowns
   - Assumptions avoided

Generate the following documentation.

====================================================================
SECTION 1 - EXECUTIVE SUMMARY
====================================================================

Provide:

- Application purpose
- Business objectives
- Target users
- Business capabilities
- Key workflows
- High-level architecture summary

====================================================================
SECTION 2 - SYSTEM OVERVIEW
====================================================================

Document:

- Functional overview
- Major modules
- User interactions
- Data lifecycle
- Non-functional requirements discovered

====================================================================
SECTION 3 - HIGH LEVEL DESIGN
====================================================================

Identify architecture style:

- Monolithic
- Layered
- N-Tier
- Clean Architecture
- Hexagonal
- Microservices
- Event Driven
- CQRS

Explain why.

Generate Mermaid diagrams:

- Context Diagram
- System Architecture Diagram
- Component Diagram

====================================================================
SECTION 4 - SOLUTION STRUCTURE
====================================================================

For every project:

- Project name
- Project type
- Responsibility
- Dependencies

For every major folder:

- Purpose
- Key classes

Create folder hierarchy documentation.

====================================================================
SECTION 5 - TECHNOLOGY STACK
====================================================================

Identify:

- .NET version
- ASP.NET Core version
- C# version
- ORM
- Database
- Logging frameworks
- Caching technologies
- Authentication frameworks
- API frameworks

Create a complete NuGet package inventory.

====================================================================
SECTION 6 - LOW LEVEL DESIGN
====================================================================

For each component:

- Responsibility
- Interfaces
- Implementations
- Dependencies
- Public methods
- Data flow

Generate dependency diagrams.

====================================================================
SECTION 7 - DATABASE DESIGN
====================================================================

Analyze:

- Entities
- DbContexts
- Migrations
- Tables
- Stored Procedures
- Views

Document:

- Primary Keys
- Foreign Keys
- Constraints
- Indexes

Generate Mermaid ER Diagram.

====================================================================
SECTION 8 - API DOCUMENTATION
====================================================================

For every endpoint provide:

- Route
- HTTP Verb
- Controller
- Service called
- Request Model
- Response Model
- Validation
- Authentication
- Authorization
- Error Handling

Generate API reference tables.

====================================================================
SECTION 9 - BUSINESS LOGIC ANALYSIS
====================================================================

Identify:

- Business rules
- Validation rules
- Decision points
- Workflow logic
- Manufacturing logic
- Processing rules

Provide code references.

====================================================================
SECTION 10 - SECURITY REVIEW
====================================================================

Analyze:

- Authentication
- Authorization
- JWT usage
- Azure AD
- Identity
- Secrets management
- Encryption
- Data protection

Identify vulnerabilities:

- SQL Injection
- XSS
- CSRF
- Broken Authentication
- Sensitive Data Exposure
- Privilege Escalation

Rate severity:

- Critical
- High
- Medium
- Low

Provide remediation recommendations.

====================================================================
SECTION 11 - INTEGRATION ANALYSIS
====================================================================

Document:

- External APIs
- Databases
- Message Queues
- File Processing
- Third-Party Systems

For each integration:

- Purpose
- Protocol
- Authentication
- Failure handling

====================================================================
SECTION 12 - LOGGING AND ERROR HANDLING
====================================================================

Analyze:

- Logging framework
- Log levels
- Error handling
- Global exception middleware
- Retry mechanisms
- Resilience patterns

====================================================================
SECTION 13 - SEQUENCE DIAGRAMS
====================================================================

Generate Mermaid sequence diagrams for:

1. User authentication flow
2. Main business transaction flow
3. Database transaction flow
4. External API interaction flow

====================================================================
SECTION 14 - DATA FLOW DIAGRAMS
====================================================================

Generate Mermaid diagrams for:

- Request flow
- Processing flow
- Response flow

====================================================================
SECTION 15 - DEPLOYMENT ARCHITECTURE
====================================================================

Analyze:

- Hosting model
- IIS
- Docker
- Kubernetes
- Azure
- AWS

Generate deployment diagram.

Document:

- Development
- Test
- UAT
- Production

====================================================================
SECTION 16 - PERFORMANCE ANALYSIS
====================================================================

Identify:

- Hot paths
- Database bottlenecks
- Memory concerns
- N+1 query risks
- Lock contention
- Concurrency issues
- Caching opportunities

Provide optimization recommendations.

====================================================================
SECTION 17 - TECHNICAL DEBT ASSESSMENT
====================================================================

Identify:

- Code smells
- High complexity methods
- Tight coupling
- Duplication
- SOLID violations
- Maintainability risks

Create a Technical Debt Register.

====================================================================
SECTION 18 - PRODUCTION READINESS REVIEW
====================================================================

Assess:

- Reliability
- Scalability
- Security
- Maintainability
- Observability
- Monitoring
- Alerting
- Disaster Recovery

Assign scores out of 10.

====================================================================
SECTION 19 - RECOMMENDATIONS
====================================================================

Provide:

Immediate Actions (0-30 days)

Short-Term Improvements (1-3 months)

Medium-Term Improvements (3-6 months)

Long-Term Modernization Roadmap

====================================================================
OUTPUT FORMAT
====================================================================

Generate the final document as:

1. Executive Summary
2. High Level Design (HLD)
3. Low Level Design (LLD)
4. Database Design
5. API Specification
6. Security Review
7. Integration Analysis
8. Deployment Guide
9. Technical Debt Assessment
10. Production Readiness Assessment
11. Recommendations

Use:
- Professional architecture terminology
- Markdown
- Mermaid diagrams
- Tables
- Source code references
- Risk ratings
- Evidence-based conclusions