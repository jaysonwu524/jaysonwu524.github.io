---
title: "Resource authorization in microservices: Gateways, centralized decisions and local enforcement"
description: "Using report access and approval to explain responsibilities across gateways, policy services and business services, including identity propagation, revocation and policy synchronization."
editorialScore: 7.6
readingTime: "9 min read"
tags: [Architecture, Access control, Engineering trade-offs]
---

In a reporting system requiring tenant isolation, a valid access token and a report-reading scope do not give a user unrestricted access to another organization's reports.

If the user substitutes another tenant's report ID, a gateway checking only the token and scope may still let the request through. Access to a particular report also depends on its tenant, the user's relationship to it and the operation being attempted.

An authorization design must therefore establish who manages rules, who makes decisions, who enforces them and how current their underlying data is.

Consider a multi-tenant reporting system. Gateway checks, centralized decisions and local enforcement can work together.

## 1. Separate token validation, decisions and enforcement

Authentication establishes the caller's identity. Token validation establishes whether the credential is trustworthy. An authorization decision determines whether the caller may operate on a resource. Enforcement actually prevents access without permission.

For JWT access tokens, a resource server must validate signatures, issuer, audience and time constraints according to its configuration. Decoding a token and reading a user ID is insufficient. Opaque tokens typically require introspection or a server-side state lookup to establish validity.

A valid JWT does not establish that the account remains active, permissions have not been revoked or every report is accessible. Roles and scopes represent authorization information at issuance. Whether current state must be queried depends on the revocation window the business permits.

Spring Authorization Server supplies OAuth authorization-server and OpenID Connect capabilities, including authorization flows and token issuance. Its role differs from a resource server's; it is not automatically a permission service called for every business request.

For reports, distinguish basic eligibility to enter the reporting service from permission to read a specific report or approve its current workflow step.

## 2. Gateways: reject early without guessing business permissions

Gateways suit common, inexpensive entry checks: validate tokens, require basic scopes or roles for routes and apply allowlists, denylists, rate limits and account-status checks where needed. Invalid requests can be rejected before entering internal services.

A gateway can require `report:read` for a read request. Report tenancy, ownership and approval status, however, usually belong to the reporting service. Repeated cross-service lookups to decide resource permissions add business coupling and remote-call costs to the gateway.

Gateway scaling increases gateway capacity. If the bottleneck is a shared permission database or policy service, more gateway instances may amplify downstream pressure. Determine whether the constraint comes from token processing, remote queries or the permission model before treating scaling as the answer.

Identity propagation needs equal care. Services cannot simply trust client-supplied `X-User-Id` or `X-Tenant-Id` headers. If a gateway forwards identity, it must remove or replace external fields with those names, and services must verify the identity information's origin and integrity, for example through an authenticated internal channel or a signed assertion.

Services can also revalidate access tokens intended for them. Either approach needs an explicit trusted entry path: an internal-network address alone does not establish identity. RPC calls, internal APIs and job entry points bypassing the gateway need identity and permission controls appropriate to their callers.

## 3. Central decisions: shared rules with remote dependencies

Where services share roles, organizational relationships or attribute rules, an independent policy service or engine can make decisions. Callers provide a subject, resource, action and relevant context, receive allow or deny, then enforce the result.

For example, the reporting service can ask whether user A may approve report R in tenant T. Tenant, report state and approval relationships must come from trusted identity context or authoritative business data, rather than unverified request attributes.

Central decisions support shared models, reusable rules and central auditing. They do not automatically make data current: approval relationships cached in the policy service still need updates and invalidation. Moving business data into that service adds synchronization work.

Remote decisions also introduce latency and outage dependencies. Protected operations should default to denial without a valid authorization result. If cached decisions may be reused, define eligible actions, validity periods and revocation windows in advance. A timeout must not silently become permission to proceed.

A cache key cannot consist only of a user ID. A report decision must distinguish at least subject, tenant, resource and action. Dependencies on approval state or policy version must also be represented in cache design or invalidation conditions. Permission to read does not imply permission to approve, and a decision for one report cannot be reused for another.

Central policy management does not require a remote decision on every request. Versioned policies can be distributed to services and evaluated with local business data. The choice depends on rule complexity, data ownership and consistency requirements.

## 4. Local enforcement: authorize resources and operations

The reporting service is closest to tenancy, ownership and workflow state. After basic gateway checks, it should still establish whether this user may read this report.

This method-security illustration uses `#p0` for the first method argument:

```java
@PreAuthorize("@reportPermission.canRead(authentication, #p0)")
public ReportDetail getReportDetail(Long reportId) {
    return reportService.getDetail(reportId);
}
```

The substance lies in `canRead`. It must obtain user and tenant from trusted identity context, consult authoritative report relationships and apply the read rule. The annotation supplies none of those business semantics automatically.

Spring Security also requires method security to be enabled and calls to pass through the relevant proxy. In the default proxy-based mode, self-invocation can bypass interception. Unprotected methods do not become secure merely because annotations exist elsewhere. Check all reachable entry points rather than relying on one controller aspect.

Queries must enforce the permitted data scope too. A report list cannot fetch everything and rely on the frontend to hide unauthorized items. Queries, pagination counts and exports need appropriate tenant and data-access conditions.

Writes such as approval also face changes between checking and execution. A user may be an approver when checked, while the report reaches its next step before submission. If workflow state and approval eligibility live in the same business database, validation and updates need a shared atomic boundary, for example through checks under appropriate locks or atomic updates conditioned on the relevant state and versions. Merely opening a transaction does not remove the race. Dependencies across services require an explicit coordination boundary. A pre-authorization annotation alone cannot guarantee that conditions still hold at execution.

Local enforcement distributes authorization work with business requests; actual load balance still follows traffic. Services must also share rule definitions and cover their own access paths.

## 5. Revocation: define the window before choosing synchronization

“Permissions take effect immediately” needs a precise meaning. Must requests starting after revocation is confirmed be denied, or must operations already underway stop too? Report previews, exports and approval submissions may require different answers.

If ordinary reads permit a defined short window, bounded caching and event-driven invalidation may suffice. If sensitive operations must not use old permissions on requests starting after confirmed revocation, the decision path must read sufficiently current authorization state or use version checks and synchronous acknowledgments that meet that requirement. Deny execution when freshness cannot be established. A shorter TTL or a cache-refresh notification alone cannot guarantee this behavior.

Synchronization must account for instances being offline, missing notifications or receiving updates out of order. Monotonically increasing policy versions can prevent older updates from overwriting newer ones. Fetch current versions at startup or reconnection, and use periodic reconciliation to detect missed updates.

A version number reveals differences; it does not make all nodes switch simultaneously. Coordinated activation requires acknowledgments from relevant instances or restricting unsynchronized instances from handling affected requests. If temporary inconsistency is acceptable, define its maximum window and monitor instance version lag.

## 6. Combine responsibilities rather than choosing one pattern

The three approaches address different responsibilities:

| Approach | Main responsibility | Useful for | Cost to address |
| --- | --- | --- | --- |
| Gateway checks | Token and basic route checks | Early rejection and common entry rules | Limited business context; remote lookups can slow entry |
| Central decisions | Shared rules across services | Common models and policies | Network dependency, central capacity, data freshness and decision caching |
| Local enforcement | Resource and action checks using business data | Tenant isolation, ownership and workflow permissions | Coverage, policy synchronization and coordination with execution |

The example reporting system can combine them:

```text
Request
  → Gateway: validate token and report read / approval scopes
  → Reporting service: verify identity context, tenant, resource and action
      ├─ Local business data + synchronized policies
      └─ Central policy service when necessary
  → Read or submit after valid authorization; record relevant audit information
```

First establish permission granularity, revocation windows and failure behavior. Then compare latency, throughput, availability and maintenance costs. In production, observe authorization latency, remote-decision timeouts, cache hits and policy version lag. A high cache hit rate can also accompany permissions that remain stale; interpret it alongside consistency measures.

Keep entry checks general, resource permissions close to the business and shared policies centrally maintainable. Rule management, decision computation and enforcement can be placed separately, but their identity, data and failure boundaries must remain explicit.

## References

- [Spring Security: JWT resource servers](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [Spring Security: method security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [Spring Security: authorization server](https://docs.spring.io/spring-security/reference/servlet/oauth2/authorization-server/index.html)
- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
