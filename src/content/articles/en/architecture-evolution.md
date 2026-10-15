---
title: "RateHub: Consolidating a distributed market-data platform into a single real-time service"
description: How duplicated upstream connections and frequent database access led to a shorter real-time path and a more manageable architecture.
editorialScore: 8.0
readingTime: "10 min read"
tags: [Architecture, Real-time market data, Engineering trade-offs]
---

## Overview

RateHub is a shared market-data service connecting to providers including Twelvedata, Finnhub, Binance and Whitezzzs. It supplies business systems with live prices and candlesticks across multiple time intervals.

The project went through two distinct architectures. The first separated Connect and Share into distributed services, using MongoDB as the shared source of truth. The second consolidated them into a single real-time service built on JDK 21, Netty, in-memory state and MySQL.

This was a reassessment of data lifetimes, the real-time path and the actual business scale, rather than a retreat from an advanced architecture to a simple one.

## 1. Context and constraints

The subsidiary was established in June 2023. When I joined in August, engineering was organized by project, with almost every project maintaining a separate codebase. Market-data integrations were copied along with it, and each system connected to providers such as Twelvedata and Finnhub independently.

Three constraints shaped the problem:

1. **Upstream connection costs.** Twelvedata and Finnhub limited WebSocket connections per API key, typically to one to three. Repeated integrations drove key costs close to USD 2,000 per month.
2. **Freshness.** The latest price is frequently changing, short-lived state. Consumers care mainly about the current value and delivery latency, rather than persisting every update.
3. **Queryable history.** Candlesticks need historical queries, gap filling and interval-based retrieval, requiring a stable persistence model.

RateHub's purpose was therefore to consolidate connections, live state and historical candlestick storage into shared infrastructure, instead of building another trading application.

## 2. Version one: separating Connect and Share

### 2.1 Components and responsibilities

The initial stack was JDK 17, Spring Boot, MyBatis Plus, MongoDB, Kafka, XXL-Job, Redis, Redisson and Vue 3.

| Component | Responsibility | Deployment |
| --- | --- | --- |
| Connect | WebSocket clients receive upstream prices and write them to MongoDB | Clustered |
| Share | WebSocket server distributes prices; HTTP endpoints provide candlestick queries | Clustered |
| XXL-Job | Schedules minute, hour, day, week, month and year candlestick tasks | Scheduled jobs |
| Redis / Redisson | Coordination, distributed locks and short-lived shared state | Shared infrastructure |

The principal data path was:

```text
Upstream WebSocket
        ↓
Connect cluster
        ↓ every price update
MongoDB: shared source of truth
        ├── Share reads latest prices → downstream WebSocket
        └── Candlestick aggregation → HTTP queries / gap filling
```

Live prices were keyed by pairs such as `WIF-USDC`. Candlesticks were aggregated by minute, hour, day, week, month and year, using time as the unique dimension and recording open, high, low and close.

### 2.2 What the design solved

The reasoning was coherent:

- Connect and Share could scale independently.
- Shared MongoDB state avoided differences caused by relying solely on local memory.
- Redisson locks coordinated candlestick jobs to prevent duplicate cluster execution.
- Upstream connections, downstream distribution and historical queries had clear responsibilities.

The issue was that the data path did not distinguish live state from historical facts.

### 2.3 Kafka's supporting role

Kafka asynchronously carried messages outside the core real-time path. Its uses were distributed across services, but it was not a broadcast bus for every price update.

WebSocket monitoring was a typical use. Connection services published connection status, disconnections and monitoring events. The management service consumed them, wrote to MongoDB and pushed updates to administration clients:

```text
Connection service → Kafka → Management consumer
                                ├── MongoDB
                                └── Administration WebSocket
```

This decoupled connection and management services. A temporary management outage did not require upstream ingestion to stop or synchronously wait for administration processing.

Connection modules also retained Kafka consumer configurations for events, monitoring state and some asynchronous tasks. Quotes still followed this path:

```text
Upstream WebSocket → Connection service → MongoDB
    → Management polling → Downstream WebSocket
```

Kafka handled monitoring and service notifications alongside that path; MongoDB remained the shared source for real-time prices.

## 3. Production problems: persistence and blocking calls in critical paths

### 3.1 Read and write amplification

Prices update continuously, frequently and in small increments. Every upstream update was written to MongoDB and then read by Share before distribution:

```text
One upstream change
  → One database write
  → One or more database reads
  → Pushes to one or more downstream connections
```

The database became part of the real-time critical path. Even instruments without active subscribers could still generate I/O through polling, aggregation and task scans. As connections and instrument counts grew, storage carried more work than its essential responsibility required.

The crucial observation was that **the latest price is recoverable runtime state, not a business fact that must be stored update by update.** Reconnecting to the source can rebuild that state.

### 3.2 Blocking HTTP calls amplified resource contention

Candlestick queries and gap filling required many concurrent HTTP requests. When upstream responses slowed, platform threads in the traditional threading model remained blocked. Requests accumulated, increasing contention between connection pools, thread pools and task queues:

```text
Upstream latency rises → HTTP calls occupy platform threads
  → Thread-pool queues grow → Tasks take longer
  → Connections and queued work accumulate → Overall responses slow
```

The issue was neither an inherent inability of MongoDB to handle market data nor the mere use of synchronous HTTP. The live-data access pattern and candlestick concurrency model did not fit the available resources. One made storage a bottleneck; the other exhausted application thread resources.

## 4. Version two: one real-time service

The second stack used JDK 21, Spring Boot, MyBatis Plus, Netty, MySQL, Redis, Kafka and Vue 3. Connect and Share became one independently deployable application. Kafka supported asynchronous scheduling and burst absorption outside the live quote path.

### 4.1 Organizing data by lifetime

| Data | Lifetime | Storage | Reason |
| --- | --- | --- | --- |
| Latest prices | Short-lived, recoverable upstream | JVM memory | Avoid persistence and reads in the real-time path |
| Historical candlesticks | Long-lived, queried retrospectively | MySQL | Interval aggregation, gap filling and stable queries |
| Coordination state | Short-lived, shared across instances | Redis | Locks, coordination and necessary shared state |

The new path became:

```text
Upstream WebSocket → Unified connection layer
    ├── Latest prices in JVM memory → Subscription routing → Netty push
    └── Interval aggregation → Batch writes to MySQL history
```

### 4.2 Implementation decisions

- **Unified connections.** Connection management, reconnection and subscriptions were no longer duplicated for each business project.
- **Latest prices in memory.** Live reads and writes bypassed the database, avoiding persistence and query amplification.
- **Batch candlestick persistence.** Aggregated intervals were written to MySQL separately from live distribution.
- **Netty for long-lived connections.** Its event-driven model suited many connections and asynchronous pushes.
- **Subscriptions grouped by pair.** Multiple clients shared an upstream subscription and one in-memory state for an instrument.
- **Kafka for asynchronous jobs.** Consumers performed candlestick queries, caching, validation and result delivery, isolating slow HTTP from WebSocket event processing.
- **Virtual threads for blocking calls.** JDK 21 virtual threads reduced platform-thread occupancy while Kafka consumers waited on HTTP I/O.

Virtual threads do not make slow APIs faster. Upstream calls still require timeouts, rate limits, circuit breakers, retry backoff and connection-pool isolation. The improvement concerns thread utilization, not upstream service quality.

### 4.3 Kafka: scheduling and queue management

Kafka orchestrated tasks and absorbed bursts. Quotes still followed “upstream WebSocket → JVM memory → Netty push.” Queuing was reserved for work that could block, wait or require controlled concurrency.

There were three main uses:

1. **WebSocket candlestick requests.** Requests went to `socket-candlestick-topic`. Consumers queried upstream APIs, cached and checked continuity, then delivered results. Slow responses were waited on by consumers rather than Netty event-processing threads.
2. **Periodic candlestick jobs.** Minute candlesticks, mini charts and price-change tasks were published by `@Scheduled` and consumed by `@KafkaListener`. Redis locks prevented duplicate execution; virtual threads queried multiple instruments concurrently; results went to Redis and subscribed clients.
3. **Queue capacity management.** A periodic task checked designated topics and triggered management actions above a threshold. For safely repeatable candlestick queries, a topic could be cleared or recreated and clients could request again. This was a capacity-protection measure, not a replacement for consumer limits, timeouts and retry policies.

Kafka thus isolated waiting and bursty candlestick work from long-lived connection handling without becoming part of quote delivery.

## 5. Why consolidate instead of splitting further?

Consolidation put closely ordered work into the same deployment unit while preserving modules:

```text
Receive price → Update memory → Match subscriptions → Push downstream
```

At that stage:

- State updates and distribution interacted frequently.
- Live state could be rebuilt upstream without sharing a complete history across nodes.
- Capacity had not demonstrated a need to scale every component separately.
- Fewer network hops and shared-storage operations reduced complexity more directly than further service separation.

Internal boundaries remained around connections, price state, subscription routing, aggregation and history, preserving a future migration path.

## 6. Lessons and conditions for future separation

The evolution can be summarized as:

```text
Distributed components → Database in the live path
  → Distinguish short-lived state from history
  → Consolidate the real-time path → Preserve internal boundaries
```

Version one emphasized scalability and consistent shared state. Version two emphasized low latency, low I/O and manageable complexity. Their suitability depended on business scale, data lifetimes and availability targets.

Both used Kafka, but in different positions:

| Version | Main Kafka role |
| --- | --- |
| First | WebSocket monitoring events and asynchronous state notifications between services |
| Second | Candlestick requests, scheduled gap filling and related jobs |

The shorter quote path came from replacing shared MongoDB state with JVM memory and triggering pushes from upstream callbacks, rather than replacing Kafka with another queue.

Further separation would need evidence of one or more constraints:

- A clear limit in single-instance connections or JVM memory.
- Downstream throughput requiring independent scaling.
- A need to isolate upstream connection management from business releases.
- Availability targets requiring redundant live state across nodes.
- Monitoring showing that separation would reduce overall complexity.

Architecture is a set of hypotheses tested as constraints change. Each split or consolidation should identify the bottleneck it resolves and explain why the added complexity is worthwhile now.
