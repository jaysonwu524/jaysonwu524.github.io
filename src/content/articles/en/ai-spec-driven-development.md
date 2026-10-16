---
title: "Software Engineering in the AI Era: Specifications, Constraints and Verification"
description: "Following a Snake game's pause feature through requirements, design and acceptance, with examples of flawed AI implementations and why specifications need user validation."
editorialScore: 7.4
readingTime: "8 min read"
tags: [AI engineering, Spec-driven development, Software engineering]
---

Ask AI to build Snake and a working page can arrive quickly. Adding a score, acceleration and a pause button may seem straightforward too.

But does the game actually pause when the button appears? If rendering stops while movement and collisions continue, the player may have lost by the time they resume. If every resume creates another timer, repeated use can make the snake move faster.

A visible feature and a system that meets its requirements are separated by a set of behavioral agreements. AI accelerates implementation, including details nobody has yet confirmed.

My focus is how to make those agreements recoverable and checkable. A Snake example can connect requirements, design and verification.

## 1. Keeping agreements outside the chat history

Conversation supports exploration. Questions and prototypes help clarify uncertain requirements, while a local wording change can be handled directly.

When a feature evolves, chat alone becomes a fragile record. Early rules become buried, later requests do not identify agreements that still apply, and the tool may inspect only part of the code. Context compression, retrieval omissions and contradictory requests can all cause drift.

Important agreements need to remain discoverable: the problem being addressed, behaviors to preserve, exclusions and completion criteria. Reading them before work and checking them against current code helps restore context across sessions and iterations.

This is a starting point for spec-driven development: maintaining requirements, design and acceptance evidence alongside implementation.

## 2. Giving “add pause” a behavioral meaning

“Support pausing” leaves several decisions open. Which state stops changing? Can players change direction? Does resuming catch up on elapsed time? What does pause do after the game ends?

EARS, the Easy Approach to Requirements Syntax, organizes natural-language requirements around events, states and conditions. It helps make triggers and responses explicit. Whether the resulting requirement suits its users needs a separate judgment.

For a single-player version, we can establish these agreements:

- **P1:** When a running game receives a pause action, it shall enter the paused state. The snake position, food and score shall remain unchanged while paused.
- **P2:** While paused, direction inputs shall be ignored. A resume action shall continue the current game without counting paused time toward subsequent movement.
- **P3:** Before the game starts or after it ends, a pause action shall leave the game state unchanged.

These statements provide a basis for evaluating implementation. P1 concerns the game state itself. P2 defines input and time behavior, preventing the display from stopping only to catch up several moves on resume.

Clear wording also makes tradeoffs easier to discuss. Does ignoring direction input fit player expectations? Should movement happen immediately on resume or after a full interval? Here we choose a full interval and make resumption the new timing baseline. The decision needs to be agreed before implementation.

Behavioral requirements, implementation constraints and scope boundaries also serve distinct purposes. Suppose this is an existing game: preserving the board while paused is required behavior; keeping the current framework and adding no runtime dependencies are constraints for this change; accounts, leaderboards and multiplayer are outside its scope. Stating these boundaries helps prevent AI from refactoring the whole project or adding unrelated capabilities while completing one feature.

## 3. From behavioral agreements to implementation constraints

Once behavior is agreed, design explains how it will hold.

For pause, we can separate game state from rendering, advance the game through one update loop, stop state advancement while paused and reset the timing baseline on resume. One module owns loop creation and disposal to prevent duplicate loops.

The user requirement now maps to explicit implementation boundaries. Framework and timing API choices can be made within them.

If documents organize the work, each can answer a distinct question:

| Document | What it records for pause |
| --- | --- |
| `requirements.md` | P1–P3 and the full-interval wait after resume |
| `design.md` | State transitions, one update loop, input handling and timing baseline |
| `tasks.md` | Implement transitions and input restrictions, handle resume timing and verify the behavior |

A task need not cover the whole game. “Implement pause and resume, and verify that no duplicate loops appear” is a reviewable change.

If implementation reveals an infeasible design, explain the conflict and consequences before revising the approach or requirement. Record actual differences when the work finishes. Tools such as cc-sdd can help organize this process; people still need to confirm that agreements and implementation stay aligned.

## 4. Tests need to expose errors

Pause can be verified at several levels.

Check transitions first: running can become paused, paused can resume, and idle or ended games remain unchanged. Then use a controlled clock to verify input and timing behavior.

For example, fix the movement interval at 200ms, disable acceleration and choose a board position without an impending collision. Advance the clock by 10 seconds while paused: the snake position, food and score should remain unchanged. Enter a turn that would be legal during normal play; the direction should still be unchanged on resume. After resumption, advancing 199ms should produce no movement; another 1ms should move the snake one cell.

After repeated pause/resume actions, also check movement counts over the same simulated duration and look for extra active timers or update loops. Asserting that each callback moves one cell is insufficient: duplicate loops can each satisfy that condition.

Finally, operate the real buttons and keyboard in a browser and compare displayed state with behavior. Load and background throttling affect browser scheduling, so controlled-clock checks and real interaction checks serve different purposes.

A particularly misleading approach is to let AI write an implementation and derive tests directly from it. Both can share the same mistake.

Suppose acceleration is specified separately: start at a 200ms movement interval, subtract 20ms for every 5 points and stop at 80ms. These numbers are illustrative.

Points here mean the cumulative score, with acceleration applied only upon reaching each full 5-point threshold. Suppose implementation accidentally accelerates every 4 points:

| Score | Interval required by the specification | Incorrect implementation |
| --- | --- | --- |
| 4 | 200ms | 180ms |
| 5 | 180ms | 180ms |
| 8 | 180ms | 160ms |
| 10 | 160ms | 160ms |

Tests checking only 5 and 10 points still pass. Cases before and between thresholds expose the mistake. If tests take the incorrect implementation's output as their expectation, even those cases become ineffective.

The minimum interval needs its own checks: 100ms at 25 points, 80ms at 30 and still 80ms at 35. Tests limited to ordinary flows can miss behavior near thresholds and beyond upper or lower bounds.

Acceptance expectations should therefore be derived independently from requirements. When reviewing tests, I care about their ability to distinguish correct and incorrect behavior, beyond the lines they cover. AI can still help generate tests; their expected results need an independent basis and review.

## 5. A clear specification can still build the wrong product

Specifications help expose errors, but AI can also implement a clear, mistaken requirement efficiently.

Return to P2. If players expect to prepare a direction while paused, ignoring their input may feel wrong. Implementation can match the specification and pass every test while prototype feedback still calls for a rule change.

Two judgments are involved: whether implementation meets the agreement, and whether the agreement solves the user's problem. Tests help establish the first. Business review, user feedback and actual use inform the second.

My preference is to confirm decisions affecting experience and system boundaries before refining implementation. Mark disputed behavior as unresolved and test it with a small prototype, instead of allowing AI to expand an assumption into an apparently complete specification.

## 6. Changed requirements may require a design review

If Snake becomes a multiplayer game with a shared world, pause becomes a coordination rule.

Does everyone else continue when one player pauses? Does the paused player's body remain a collision object? Does disconnecting count as pausing? These questions affect fairness, server state and recovery. P1–P3 no longer cover the problem.

In this design exercise, behavior needs to be agreed again before deciding who determines critical state and how inputs and results reach participants. With an authoritative server, key actions such as pause also require server-side rule decisions, with clients displaying the resulting state consistently.

WebSocket, networking frameworks and serialization choices can then be compared against message frequency, room size, latency requirements and load tests. Changed specifications can invalidate an old design, so architecture decisions also need revision.

## 7. Controlling the maintenance cost

Specifications and code evolve together, adding maintenance work. If documents describe old behavior while code follows new rules, the next AI change can widen the gap.

Reviews of behavior changes should include requirements and tests. Mark unconfirmed assumptions and stop treating abandoned decisions as current instructions. Before a task starts, compare the relevant specification with the code.

A completion record can map back to P1–P3 and identify the tests actually run, their results, browser interactions checked and anything still unverified. Checked task boxes cannot replace this evidence. When acceptance fails, first determine whether implementation departed from the agreement or the agreement itself needs revision. Do not simply change expectations to match current code output.

Scale the process to risk. A wording change usually needs a task description and page check. Authorization, payments, data migration and cross-service work warrant clearer behavioral constraints and failure handling. Documentation should reduce misunderstanding without becoming a hurdle for every small edit.

AI reduces the cost of turning ideas into code, including ideas based on unconfirmed assumptions. Specifications, implementation and verification need evidence that can be checked against each other. People who understand the business, code and runtime still need to judge whether delivery solves the problem and whether that evidence is trustworthy.

## References

- [EARS: requirements syntax and patterns](https://alistairmavin.com/ears/)
- [cc-sdd: spec-driven development workflows](https://github.com/gotalab/cc-sdd)
