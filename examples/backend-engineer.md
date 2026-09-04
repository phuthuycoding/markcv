# Maya Okonkwo

**Location:** Berlin, Germany  ·  English (fluent), German (professional)

**Email:** maya.okonkwo@example.com

**Phone:** +49 30 1234567

**GitHub:** github.com/example

**LinkedIn:** linkedin.com/in/example

***

## OBJECTIVE

**Senior Backend Engineer** with 8 years building payment and ledger systems. Recent work centres on **event-driven services (Kafka, Postgres, Go)** and the operational side of running them — idempotency, reconciliation, and the on-call that follows. Looking for a role where correctness under load matters more than shipping speed.

***

## PROJECT HIGHLIGHTS

### Ledger Rewrite — Double-Entry Core

The original ledger stored balances as a mutable column, so a failed payout could leave an account short and nobody could reconstruct why. Rebuilt it as an append-only **double-entry** ledger in **Go** and **Postgres**, with every movement written as balanced entries and balances derived from them. Backfilled **14 months** of history and ran both systems side by side for **6 weeks** until they agreed to the cent. Reconciliation breaks dropped from **~30 a week to under 2**.

### Idempotent Payment Intake

Retries from client SDKs were creating duplicate charges under network partitions. Introduced idempotency keys with a **Redis**-backed claim and a **Postgres** unique constraint as the final arbiter, so a duplicate request returns the original result rather than a second charge. Handles **1.2M requests/day** with duplicate charges down to zero over the following year.

***

## WORK EXPERIENCE

### Northwind Payments

**Senior Backend Engineer** | Mar 2021 - Present

* Own the ledger and payment intake services: **Go**, **Postgres**, **Kafka**, deployed on **Kubernetes**.
* Cut p99 settlement latency from **4.2s to 700ms** by removing a synchronous fan-out and batching writes.
* Set up consumer-lag alerting and runbooks after an incident where a stalled consumer went unnoticed for **6 hours**.
* Review designs across three teams and mentor two engineers.

### Kestrel Software

**Backend Engineer** | Aug 2018 - Feb 2021

* Built REST and **gRPC** services in **Python** and **Go** for a logistics platform serving **400+ merchants**.
* Migrated a shared database into per-service schemas, allowing teams to deploy independently.
* Introduced contract tests between services, cutting integration failures caught in staging by roughly half.

### Bergman Digital

**Junior Developer** | Jul 2016 - Jul 2018

* Built internal tools in **Django** and maintained the customer-facing API.
* Took the on-call rotation and wrote the first incident postmortems the team had.

***

## SKILLS

### Backend & Data

*   **Languages:** Go, Python, SQL, some Rust.
*   **Storage:** PostgreSQL, Redis, Kafka, S3.
*   **Patterns:** Event-driven architecture, idempotency, double-entry accounting, CQRS.

### Operations

*   **Infrastructure:** Docker, Kubernetes, Terraform, GitHub Actions.
*   **Observability:** Prometheus, Grafana, structured logging, on-call and incident response.

### Testing

*   Unit, integration and contract testing; property-based tests for ledger invariants.

***

## EDUCATION

### Technical University of Munich

**BSc Computer Science** | 2013 - 2016
