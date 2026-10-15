---
title: "Consistency in report generation and approval: Narrow transaction boundaries before adding distributed coordination"
description: A review of shared databases, dynamic data sources and recovery logs, and their limits when controlling consistency costs early in a product's life.
editorialScore: 6.8
readingTime: "8 min read"
tags: [Architecture, Transaction consistency, Engineering trade-offs]
---

In 2024, the company's PDF customization needs and business scope expanded, bringing stricter requirements for user-data security and approval workflows.

The existing workflow combined Feishu multidimensional tables, approvals and HTML-to-PDF tools. As the business developed, its access control, report management and integration capabilities became insufficient. I took responsibility for the architecture of a new report generation and approval system.

It needed to support current reports and leave room for future LIMS and mobile integration. Beyond functionality, we had to ask early: how much implementation and operational cost should consistency require when one operation spans several services?

## 1. Service boundaries are not transaction boundaries

The design separated authorization, foundation, framework, gateway, storage and reporting into six service categories, communicating through Apache Dubbo RPC.

In hindsight, these categories mix business and technical responsibilities. Deploying a gateway or framework separately does not establish a DDD bounded context, and DDD itself does not require microservices.

Future LIMS and mobile integration calls for clear interfaces and evolving business boundaries, but not necessarily a separate process for every module from day one. That remains a decision worth revisiting.

Nor does every cross-service call need a distributed transaction. Querying several services or sending a deferrable notification differs from requiring writes across services to succeed or fail together.

The real issue is an operation that changes data owned by multiple services while business rules require the changes to stay consistent.

For example, report status updates, file generation and notifications may belong to one workflow. Whether they must complete together is a business rule. This example illustrates different requirements; it does not assert that those steps were all in one transaction in the implementation.

A notification may be retried. Whether approval can advance before the report exists needs a more explicit rule. Belonging to one workflow is not sufficient reason to put everything in a strongly consistent transaction.

## 2. Understand what Seata solves before adopting it

Seata was an important reference during research. Its AT, TCC, Saga and XA modes differ in business integration, database support and consistency semantics.

In AT mode, participating services modify business data and record undo logs within a local transaction, then commit it. The coordinator organizes global commit or rollback. During rollback, participants use undo logs to reverse previously committed changes.

Context propagation, branch registration and global locks also matter. This cannot be reduced to “the caller throws and asks the provider to roll back,” nor should its isolation be assumed identical to a single-database local transaction.

Although the application already used microservices, early usage was modest. A coordinator would add not only deployment resources but configuration, monitoring, recovery and compatibility work.

We therefore did not introduce Seata immediately. That choice should rest on consistency requirements and operational capacity, rather than a vendor's reputation or treating one deployment's memory consumption as a fixed product requirement.

Without a coordinator, consistency issues still exist. We must specify which operations have local guarantees, which failures permit compensation and which have no cross-resource atomicity guarantee.

## 3. Three approaches used at the time

The implementation used failure records, a shared database and dynamic data sources. Each reduced a different cost; they are not three equivalent distributed transaction solutions.

### Failure records for manual recovery

For operations judged tolerant of temporary inconsistency and repairable afterward, logs retained execution results and errors for manual handling.

This suits infrequent, reconcilable and recoverable work, but logging alone does not guarantee consistency. A non-core feature can still cause damage when it fails.

Reliable manual recovery also needs failure discovery, business-object correlation, identification of completed steps and protection from duplicate compensation. These require separate verification. An error log does not establish a complete recovery process.

### A shared database to reduce cross-database access

Authorization and framework services used one database, reducing cross-database access and data-source maintenance.

Sharing a database does not share a transaction. Services with separate connections and local commits can still finish differently. A normal Dubbo call does not automatically propagate the caller's database transaction.

For writes to complete together under a local transaction, they must belong to the same transaction boundary—for example, execution by one service with the same transaction manager and resource.

A shared database reduces some complexity but may increase data coupling. Ownership and access boundaries remain necessary for independent evolution.

### Dynamic data sources to centralize execution

Baomidou Dynamic Datasource allowed one service to route operations to multiple databases for core business flows.

It reduced some service calls, but routing is separate from coordination. One process accessing several databases does not make their commits atomic.

Even a combination of local transactions across connections needs its commit and failure semantics examined. Sequential commits can leave one database committed when another fails. Catching an exception cannot undo all already committed changes.

Dynamic routing is an execution-placement tool, not a direct replacement for distributed transactions. Cross-database core writes still need a partial-commit recovery plan or suitable coordination.

## 4. Express consistency as business rules first

The useful lesson is to ask which states must never occur before choosing transaction mechanisms.

| Requirement | Approach to consider first | Boundary to verify |
| --- | --- | --- |
| A group of writes must succeed or fail together | One local transaction; distributed coordination if consolidation is impossible | Actual resource participation and rollback behavior |
| Temporary inconsistency is allowed, but work must eventually finish | Durable pending state, retries and compensation | No lost work; safe repeated execution |
| Infrequent failures may be repaired manually | Error records, reconciliation and manual compensation | Discoverable failures, ownership and explicit procedures |

This is an evaluation framework, not a claim that every mechanism was fully implemented then.

Reports also involve non-database resources such as object storage. Rolling back a database does not automatically delete generated files. Even Seata AT should not be assumed to roll back ordinary object-storage calls.

A workflow coordinating records and file generation can model pending, successful and failed states, retrying or compensating failed steps. Message-driven processing must also address reliable handoff between database commits and sending messages, potentially with a transactional outbox.

These are directions requiring business-specific validation. A middleware name cannot replace failure analysis.

## 5. Leaving room for evolution is not ready-made integration

Nacos was selected for registration and configuration, with Seata retained as a future option. Nacos alone does not make a system ready for Seata.

Integration still requires transaction-boundary analysis, data-source proxies, context propagation and verification of SQL support, conflicts and rollback. Non-database resources require separate handling.

More valuable preparation is explicit business state and failure semantics: retryable steps, idempotent actions, compensation states and ownership of detection and recovery.

When cross-service atomicity becomes a clear requirement, or manual recovery becomes too frequent, costly or risky, evaluating Seata, TCC or Saga has a concrete basis.

## 6. Architectural trade-offs must include failure paths

Li Zhihui's book on large-scale website architecture emphasizes that architecture evolves with business scale. Early consistency design likewise need not introduce every component for hypothetical growth, but must state what the present design guarantees.

This project's value was controlling complexity under contemporary usage and resource constraints. Its limitation was that shared databases and dynamic routing reduced implementation costs without automatically supplying cross-service or cross-database atomicity.

Validation must deliberately test RPC timeouts after remote commits, failures partway through sequential commits, successful file generation followed by failed state updates and side effects from repeated retries.

Start with required business states, narrow transaction boundaries, then address remaining cross-resource work through verifiable compensation or coordination. Avoid both premature infrastructure and treating unverified consistency as an established capability.
