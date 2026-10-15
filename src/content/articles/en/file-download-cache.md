---
title: "Concurrency in file download caching: From duplicate fetches to safe eviction"
description: Short-lived object-storage caches, same-key request coalescing, ETag validation and the lifetime of files still being read after invalidation.
editorialScore: 7.8
readingTime: "8 min read"
tags: [Architecture, Concurrency, Cache design]
---

Once a download service connects to object storage such as OSS or S3, the same file may be requested repeatedly within a short period, yet downloaded upstream again for every request.

To reduce repeated fetches, I introduced a local file cache. Contents lived on disk; JVM memory held file references and cache metadata. Later requests could reuse completed downloads.

The difficult questions go beyond cleanup frequency. Who downloads when several requests miss together? How do we detect upstream updates? What happens to a request already reading a file when the cache is cleared?

This article separates the approaches already adopted, their limitations and mechanisms still needed.

## 1. Decide which requests need the backend

Different access scenarios used different delivery methods:

| Scenario | Approach | Constraints |
| --- | --- | --- |
| Image preview | Backend streaming | Bounded buffers, client disconnections and upstream timeouts |
| PDF preview | Authorization followed by a presigned URL for direct object-storage access | Expiry, permission scope and preview response headers |
| File download | HTTP Range support | Range validation, resumability and consistent file versions across requests |

A presigned URL is a temporary credential usable until expiry. It can normally be reused and is not inherently single-use. The backend must still authorize access before issuing it.

Streaming, Range and local caching solve different problems. Streaming bounds memory use; Range selects byte intervals; caching reduces upstream fetches. They can be combined.

A proxy also need not load the whole file into memory or finish writing it to disk before responding: it can forward data as it reads. In this cache-fill workflow, however, concurrent waiters reuse the local file only after the download completes.

## 2. One request downloads each file

If several requests independently fetch a missing file, upstream bandwidth and local disk I/O are duplicated.

The adopted approach lets the first request download while the others wait and reuse the result. This is same-key request coalescing, often called singleflight.

```text
Several requests for one file
    → First request downloads
    → Others wait
    → All reuse the completed local file
```

Coordination should be per file key rather than a global lock. Different files can download independently; requests for the same file share one result. Include version information in the key when versions must be distinguished.

The successful path is only part of the design. Reliable operation also requires:

- Delivering failures to waiters instead of leaving them blocked indefinitely.
- Bounded waiting; one client's cancellation should not casually cancel a download shared by others.
- Releasing loading state after either success or failure.
- Limiting total upstream concurrency when many different files miss together, protecting connections, bandwidth and disks.

These are requirements to verify, not guarantees established merely by adding a lock.

An incomplete file must not be published as a complete cache entry. A future improvement is to download to a temporary file, then publish the entry when complete. Atomic rename requires checking the relevant filesystem guarantees.

## 3. Scheduled cleanup versus LRU and LFU

The implementation used scheduled cleanup for short bursts of repeated access, favoring a simple implementation and manageable maintenance.

Request coalescing and eviction are independent concerns. One decides who downloads; the other decides what remains cached. LRU or LFU can coexist with one downloader per key.

It therefore does not follow that LRU/LFU lock contention must be excessive or that scheduled cleanup must be faster. Costs depend on implementation, access frequency and concurrency, and need measurement.

Scheduled cleanup is a straightforward way to reclaim expired files, but new files may still fill the disk between runs.

Future work should combine time and capacity constraints: expiry, total cache limits, single-file limits and free-disk thresholds. When capacity is low, new fills can be rejected or existing entries evicted under explicit rules.

Whether LRU or LFU is worthwhile depends on file-size distribution, popularity and observed hit rates.

## 4. Detecting updates with ETag

A completed local download is not valid forever. An upstream object can be overwritten, leaving the cache serving stale contents.

ETag checks were introduced to detect changes. An ETag is a server-provided validator, not universally a file MD5. S3 multipart uploads and some encryption configurations are examples where it does not equal the complete file's MD5.

Choosing the validator does not decide when to validate.

Checking upstream on every hit still incurs a network round trip and storage request charges. Periodic validation permits stale data within the interval. The interval should reflect update frequency and tolerated staleness.

An object may also change between validation and download. Fetching an ETag and then making an unconditional GET does not guarantee the same version. Conditional requests or version IDs can bind downloaded contents to recorded metadata.

Local replacement must account for readers too. Overwriting the same path can affect ongoing reads. A stronger future approach is to write a new version separately, switch the reference after completion and retire the old version for later reclamation.

## 5. Invalidation does not make immediate deletion safe

The key race is between cache cleanup and file reading.

References were managed with `CopyOnWriteArrayList`. Iterators can read a snapshot, but that snapshot contains only `File` references. A Java `File` primarily represents a path; it does not guarantee the underlying physical file will continue to exist.

A request may obtain a `File`, then a cleanup thread clears the collection and deletes the disk file. The reference survives, but the path may no longer be openable.

Even when the file is already open, behavior after deletion depends on operating-system and filesystem semantics. One platform's behavior is not a portable guarantee.

A thread-safe collection protects collection access, not file lifetime.

The adopted approach separates logical removal from physical deletion. Files leave the active collection first, move to a separate pending-deletion collection and are physically removed after a delay.

```text
Active cache → Remove entry → Pending deletion
    → Wait → Delete physical file
```

New requests no longer obtain the old file through the active cache, while requests already holding it have a grace period to finish.

A fixed delay only reduces the probability of a race. Slow clients, large files or stalled networks may exceed the grace period, and retired files continue consuming disk space.

## 6. Toward safe reclamation

Stronger safety requires deleting when nobody uses a file, rather than when a timer expires. This is a future improvement, not a property of the existing delayed-deletion mechanism.

A cache entry could hold a usage count or read lease. Requests acquire usage before reading and release it afterward. Cleanup first retires the entry to reject new readers, then waits for existing readers to leave before deletion.

```text
Available: new readers may acquire usage
    → Retired: no new readers; wait for existing ones
    → No readers: physical deletion
```

Acquisition and retirement must share synchronization. Otherwise a new reader can arrive just after cleanup observes a zero count.

Usage must cover the whole read, from preparing to open the file through closing its stream, not just retrieving the reference. Success, exceptions, timeouts and client disconnections must all release it.

Failed deletion should retain a reclamation record for retry. If a maximum retirement time is introduced to bound disk usage, its consequences must be explicit: forcibly deleting while readers remain cannot also guarantee that every reader finishes safely.

## 7. Measure whether the cache pays for itself

Caching saves some upstream fetches but adds disk consumption, waiting and reclamation logic. Its value requires evidence.

Useful future measurements include:

- Hit rate and upstream request counts.
- Active and retired file sizes and free disk space.
- Fetch latency, failures, timeouts and coalesced-request wait times.
- Cleanup duration, failed deletions and longest reclamation delay.

Verification should cover concurrent misses for one key, failed downloads, updates interleaved with reads, cleanup racing file opening and usage release after disconnection.

Without load tests or production metrics, neither an eviction algorithm's superiority nor a cache's performance benefit should be assumed.

The core is an explicit lifecycle for downloading, reading and reclaiming. Filling a cache, identifying current readers and deciding when disk space is safe to reclaim are separate decisions that each need reliable coordination.
