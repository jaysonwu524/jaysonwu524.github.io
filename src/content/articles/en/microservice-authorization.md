---
title: "Resource authorization in microservices: Gateways, centralized decisions and local enforcement"
description: The trade-offs between permission granularity, performance, availability and consistent policies across gateway checks, centralized decisions and service-local authorization.
editorialScore: 7.0
readingTime: "8 min read"
tags: [Architecture, Access control, Engineering trade-offs]
---

Choosing an authorization design involves more than deciding where its code should live. Permission granularity, concurrency, consistency, availability and operational complexity all matter.

First, distinguish four concepts:

- **Authentication:** establishing who the caller is.
- **Token validation:** checking an access token's signature, issuer, audience and expiry.
- **Authorization decisions:** deciding whether the caller may perform an operation.
- **Enforcement:** applying that decision to an endpoint, resource or data.

Spring Authorization Server is an OAuth 2.0 and OpenID Connect authorization-server implementation built on Spring Security. It handles authorization flows and issuance of access and refresh tokens, and can integrate with user authentication. It is not the same as a resource-authorization service.

Three common patterns can be discussed along two dimensions: where decisions are made and where checks are enforced. They can be combined and are not mutually exclusive.

## 1. Gateway checks

Gateway authorization works well when permission rules are relatively simple. A gateway commonly:

1. Validates access tokens; for JWTs, checks signature, issuer, audience and expiry.
2. Checks revocation or account status where the business requires it.
3. Applies basic access rules based on route, role or scope.
4. Applies entry policies such as allowlists, denylists and rate limits.

For systems requiring little beyond a valid token and an accessible route, this can handle most checks. Business services may reuse validated identity if access is restricted to a trusted gateway and its identity information can be verified. Other entry points still need independent identity and permission checks.

Benefits include early rejection, less authorization code in services, centralized entry rules and less invalid traffic in the internal network.

With finer-grained permissions, the gateway may need users, roles, organizations, resources and data-access rules. Looking up a database or central policy service on every request can make authorization a bottleneck.

Gateway clustering and load balancing address node CPU, connection and throughput limits, but do not automatically fix policy-query bottlenecks. Deployment may also need:

- Policy caching and local token validation.
- Batched queries and preloaded permission data.
- Authorization timeouts and failure policies.
- High availability for central permission services.

Gateway checks therefore do not require every permission decision to happen there. Complex data access generally needs further checks inside business services.

## 2. Centralized authorization decisions

An independent permission service or policy engine can manage policies and make decisions. Gateways or services submit a subject, resource, action and context, receive allow/deny and enforce it.

```text
Client → Gateway or business service → Permission service / policy engine
    → Allow or deny → Caller enforces the result
```

This centralizes policy maintenance, enables consistent RBAC/ABAC models and avoids editing every business service for each policy change.

It also introduces dependencies:

- A network round trip may be added to each check.
- A policy-service outage can affect many requests.
- The central service can become a throughput bottleneck.
- Decision caching brings invalidation and consistency concerns.

Caching, timeouts, circuit breakers and availability need explicit design. Protected operations should default to denial when no valid decision is available. If cached decisions are permitted, define eligible actions, validity periods and the revocation window.

For changes requiring immediate effect, simply shortening a cache TTL is insufficient. Synchronous decisions or guaranteed timely invalidation are needed. Ordinary permissions tolerating delayed effect can use longer local caching.

Centralized management does not require remote execution on every request. Policies can be managed centrally, distributed to gateways or services and evaluated locally, with remote calls reserved for complex cases. Management stays centralized while much decision execution moves closer to the caller.

## 3. Local checks and distributed policy synchronization

When permissions reach business operations, resources or individual rows, a gateway alone is usually insufficient. Services can enforce checks at controller, service or method-security boundaries.

```java
@PreAuthorize("@permission.canAccess(authentication, #orderId)")
public OrderDetail getOrderDetail(Long orderId) {
    return orderService.getDetail(orderId);
}
```

Requests still pass through the gateway, but the target service uses local business data to decide access.

Advantages include proximity to the relevant data, suitability for ownership and action-level checks, distribution of authorization work with business traffic and a gateway focused on routing and basic entry controls.

Costs include:

- Invalid requests entering the network if basic entry checks are absent.
- Authorization integration in each service.
- Potential differences in policy interpretation.
- More complex model upgrades and policy distribution.
- The need to prevent access paths bypassing controller checks.

Local authorization should follow several principles:

- Default deny and grant explicitly.
- Cover every entry path, not only a particular controller aspect.
- Authenticate service-to-service callers and authorize their actions.
- Do not trust client parameters alone when deciding access.
- Give caches expiry and invalidation mechanisms.
- Synchronize policy changes to every instance in time.

Policies may live in a database or configuration service, with publish/subscribe notifications refreshing local caches. “Central policy storage with distributed cache synchronization” describes this more precisely than forcing it into a blackboard-architecture label.

## 4. Comparing the patterns

| Pattern | Decision or enforcement location | Benefit | Main cost |
| --- | --- | --- | --- |
| Gateway checks | Gateway | Early rejection, central entry rules, fewer service changes | Concentrated load; limited business context |
| Central decisions | Policy service decides; caller enforces | Shared models and complex policies | Network dependency and central bottlenecks |
| Service-local authorization | Business service | Near business data; fine-grained rules | Consistent policies and complete coverage |

Real systems often combine them:

```text
Client → Gateway: token and route checks
    → Business service: resource, data and action permissions
        ├── Local policies and business data
        └── Central policy service when necessary
    → Execute only when allowed
```

A gateway can reject invalid tokens or missing scopes; the service then checks access to a particular order, account or organization's data.

## 5. Quality attributes to balance

Authorization affects at least these qualities:

1. **Latency:** additional remote checks.
2. **Throughput:** work concentrated in gateways or policy services versus distributed across business services.
3. **Availability:** safe behavior during policy-service failure.
4. **Consistency:** time for changes to take effect everywhere.
5. **Security:** gateway bypass, forged identities and stale permissions.
6. **Extensibility:** finer roles, resources and data permissions.
7. **Operations:** policy releases, cache invalidation and diagnosis.
8. **Traffic and cost:** invalid internal requests and authorization overhead.

Finer granularity does not automatically mean all checks belong in services, and higher concurrency does not automatically mean everything belongs in a gateway.

A practical combination uses inexpensive common checks at the gateway, business-data-dependent checks inside services, centrally managed policies, local caching and event synchronization. Invalidation and revocation follow the actual consistency requirements.

The important questions are how fine permissions must be, what throughput and availability are required, and how much delay permission changes may tolerate. Those constraints determine where to decide, where to enforce and which complexity is justified.
