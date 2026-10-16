---
title: "RateHub: Consolidating a distributed market-data platform into a single real-time service"
description: "How a shared market-data service removed database polling from quote delivery and clarified the boundaries of in-memory state, candlestick queries and asynchronous tasks."
editorialScore: 8.0
readingTime: "12 min read"
tags: [Architecture, Real-time market data, Engineering trade-offs]
---

The subsidiary was established in June 2023. When I joined in August, projects copied existing repositories, maintained separate deployments and independently connected to market-data providers.

Some Twelvedata and Finnhub plans purchased at the time limited each API key to one to three WebSocket connections. Before the business reached scale, duplicated integrations already cost close to USD 2,000 per month. Those limits describe the plans and integration model then, rather than every product those providers offer.

RateHub became a shared service connecting to Twelvedata, Finnhub, Binance, XChange, SSI, Whitezzzs and other market-data sources. It managed ETFs, indices, stocks, foreign exchange, spot instruments and derivatives, supplying quotes, order books and candlesticks across intervals.

Its first architecture separated ingestion and distribution with MongoDB as shared state. The second consolidated the core process, kept latest prices in JVM memory and triggered distribution from upstream messages. The essential change concerned how live data moved.

### Shared connections also need reusable data interfaces

Sharing upstream connections solved only part of the duplication. Downstream projects also needed consistent interfaces for subscribing to quotes, displaying price changes and querying candlesticks across intervals. Otherwise each business project would still adapt provider response formats independently.

| Capability | Downstream output |
| --- | --- |
| Real-time subscriptions | Quotes and daily price changes pushed to multiple projects over WebSocket |
| Latest candlestick updates | Ongoing updates to the current minute's candlestick for chart refreshes |
| Historical candlestick queries | A unified query interface and response format for minute, day, week, month and other intervals |
| Source adaptation | Centralized source integration and data handling to reduce repeated adaptation in business projects |

Consistent interfaces require defined semantics as well as field names. Instrument codes, price units, timestamps and interval boundaries may differ between sources. The current minute's candle continues changing, so each update is not a new closed candle. These differences need explicit agreements between ingestion and downstream consumers.

Market data also feeds trading workflows. Downstream systems can check limit orders and calculate position risk after an update, then decide on processing under their own rules. RateHub supplies the data; order state, account calculations and settlement remain business responsibilities. Tolerance acceptable for displaying a latest snapshot is not automatically sufficient for financial settlement. Trading decisions also need explicit source, freshness and abnormal-price handling rules in the business system.

## 1. Version one: connecting ingestion and distribution through a database

The first version used JDK 17, Spring Boot, MongoDB, Redis, Kafka and XXL-Job, among other components.

| Role | Responsibility | Scaling consideration |
| --- | --- | --- |
| Connect / ingestion | Connect upstream and update quotes in MongoDB | Upstream connections and subscriptions |
| Share / distribution | Manage authorization and subscriptions, query prices and push over WebSocket | Downstream connections and delivery load |
| Tasks | Schedule candlestick work with Redis / Redisson coordination | Avoid concurrent duplicate work |

MongoDB shared state across services, allowing distribution instances to read ingestion output without accessing another instance's memory.

```text
Upstream WebSocket → Ingestion → Latest quotes in MongoDB
                                           ↓ Polling
                                    Distribution → Downstream WebSocket
```

Latest quotes overwrote instrument records to bound record counts. Bounded records did not bound I/O: updates still required database work, and queries and distribution continued.

Keys also need a scope. The same pair may exist on different platforms or product types. Candlestick identity needs source, instrument, interval and start time. Pair text or a timestamp alone cannot distinguish these in a shared namespace.

Kafka mainly carried monitoring events and service notifications. Ingestion published WebSocket connection status; the management service consumed it, stored it in MongoDB and notified administration clients. Kafka was not a mandatory broadcast bus for every quote and did not replace the database in live distribution.

A shared database reduced coordination among separate instance-local copies. It did not guarantee every reader saw the same value simultaneously: read timing, deployment settings and update order still mattered.

## 2. Two pressure paths: quote I/O and candlestick waits

The first pressure came from frequent quote writes and reads. Ingestion continuously updated records, while distribution polled by client subscription. Multiple clients could cause repeated reads of the same quote.

```text
Quote update → Database write
                 → One or more subscription queries
                 → Push to multiple connections
```

Read load depended on both market activity and client count. Polling and task scans could generate I/O even without changing prices. High I/O under low business load needs diagnosis through queries, scans and task frequency; it is not proof of an inherent MongoDB limitation.

The second pressure came from candlestick queries and gap filling. Slow upstream HTTP calls occupied platform threads. Continuing arrivals accumulated in connection pools, thread pools and queues, eventually affecting other requests.

These required separate changes: reduce database work for latest prices, and control candlestick waiting and concurrency. More service instances could simply direct more work at the same database or provider.

This service supplied latest snapshots and periodic updates rather than replaying every quote. Its latest state could therefore be rebuilt upstream. Tick replay, auditing or exact reconstruction would require a different retention design.

## 3. Version two: one process for the real-time path

JDK 21, Spring Boot, Netty, MySQL, Redis and Kafka supported one independently deployable application containing connections, price state, subscriptions and distribution. Databases and messaging remained external infrastructure.

Upstream callbacks triggered distribution directly and maintained latest snapshots in memory. New subscribers could read an existing snapshot. The logical path became:

```text
Upstream WebSocket → In-process market-data handling
                       ├─ Update latest snapshot
                       └─ Route subscriptions → Downstream WebSocket
```

Neither branch needed a MongoDB write followed by distribution polling. Removing database mediation and network round trips reduced work in the hot path; latency and throughput gains still require comparable measurements.

Latest quotes were keyed by platform and instrument. Multiple sources offer choices, but identically named assets, quote units and contracts may differ. Integration alone does not provide automatic failover. Switching needs mappings, priorities, freshness rules and downstream notification semantics.

Redis periodically stored quote and order-book snapshots for restart recovery. A snapshot shortens the empty period; it does not prove freshness or recover every missed update. Freshness-sensitive uses should consider source and local receipt timestamps, treating data as ready only after suitable upstream synchronization.

MySQL held durable business data such as instruments and authorizations. Candlestick queries used upstream APIs and Redis interval caches; that path did not depend on a complete local history archived in MySQL.

### Netty changes the connection model, not a fixed capacity guarantee

Netty provided event-driven long-lived connections and asynchronous distribution. Tomcat capacity also depends on protocol implementation, configuration, operating-system limits and application behavior; there is no single universal WebSocket ceiling explaining the choice.

Netty event loops must still avoid slow HTTP, blocking locks and heavy computation. Slow clients can accumulate outbound data. Capacity work needs to cover connection counts, pending bytes, event-loop latency and client consumption rates.

Where consumers need only latest quotes, coalescing unsent snapshots may be appropriate. Order-book deltas can depend on sequence and ordering; dropping them under the same rule may require fetching a full snapshot again.

## 4. Candlesticks: queues, caches and virtual threads solve different problems

WebSocket candlestick requests went to `socket-candlestick-topic`. Consumers queried upstream APIs, processed caches, removed duplicates, checked data and delivered results. Scheduled candlestick, mini-chart and price-change tasks also published messages for asynchronous processing.

Kafka moved slow work away from WebSocket handling and absorbed short bursts. It did not increase provider quotas. Sustained arrivals beyond consumption capacity merely moved waiting into a queue. Producer send behavior also needs inspection: using Kafka alone does not prove an event loop never blocks.

Periodic tasks used virtual threads to query multiple instruments, reducing platform-thread occupancy for I/O that can unmount. JDK 21 still has pinning scenarios, including `synchronized` regions; not every blocking operation frees its carrier. Virtual threads add neither bandwidth, connection capacity nor upstream quota. Bound in-flight calls, set timeouts and control retry backoff.

Candlestick processing reused cached intervals, fetched missing ranges and checked timestamps and continuity. Correctness still requires explicit rules:

- Cache keys must distinguish source, instrument and interval, while unfinished candles must remain refreshable.
- Market closures and trading sessions prevent treating every calendar gap as missing data.
- Calendar weeks, months and years need timezone and boundary definitions rather than universal fixed millisecond lengths.
- Open/close adjustments need business semantics. Real gaps between candles must not be overwritten merely to make charts continuous.

These determine whether cached data can answer a query, and why live snapshots and historical candles need distinct lifecycles.

## 5. Queue management: intended protection versus actual guarantees

A periodic task attempted to delete the candlestick topic above a size threshold. On inspection, however, it combined partition replica and in-sync-replica counts rather than measuring messages or consumer lag. It did not establish reliable backlog protection.

Backlog assessment needs partition end offsets compared with committed offsets for the relevant consumer group, plus the age of the oldest waiting work. If consumers commit early and finish work asynchronously, in-process outstanding tasks need separate measurement.

Deleting a topic loses pending requests and disrupts its producers and consumers. Even retryable queries need clients to learn that a request did not complete. Topic deletion should not serve as routine burst control.

More controlled improvements include expiring stale tasks, bounding admission and consumer concurrency, coalescing duplicate queries and defining retries and failure responses. WebSocket tasks also need request correlation and valid connection routing: completion after disconnect does not establish delivery.

## 6. Benefits and new boundaries

| Concern | First version | Second version |
| --- | --- | --- |
| Latest quotes | MongoDB writes and polling | JVM state and callback-driven distribution |
| Slow tasks | Synchronous waits competing for threads | Kafka queuing; virtual threads for periodic jobs |
| Restart state | Read shared storage | Restore Redis snapshots, then synchronize upstream |
| Main cost | Real-time database I/O and service coordination | Process-wide failures, recovery and capacity control |

One process reduced cross-instance state coordination while giving a process failure a shared impact on ingestion and distribution. Redis snapshots do not replicate WebSocket connections or make two instances share subscriptions and send state. Multiple active instances still need upstream allocation, subscription ownership, state synchronization and reconnection recovery.

Future separation should be informed by quote freshness, delivery latency, event-loop latency, outbound backlog, memory, upstream errors and recovery time. Availability targets can require redundancy and failure isolation before capacity runs out.

Consolidation first removed unnecessary shared-storage polling from RateHub's live path. Its next evolution must answer which component needs independent scaling, which state needs redundancy and how long recovery may take. Architecture earns its value through verifiable answers to those constraints.

## References

- [Oracle: JDK 21 virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [Apache Kafka: design and consumer positions](https://kafka.apache.org/41/design/design/)
- [Netty: user guide](https://netty.io/wiki/user-guide-for-4.x.html)
