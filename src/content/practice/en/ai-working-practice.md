---
title: "AI Practice: Development, Architecture and Writing"
description: "From everyday tool choices to an MQ consumer transaction fix, website iteration and founder-led writing: how I work with AI on analysis, decisions and verification."
relatedProject: laife-ai
relatedArticle: ai-spec-driven-development
readingTime: "9 min read"
tags: ["Human–AI collaboration", "Software development", "Writing"]
---

I started using Gemini in 2023 and later became a long-term annual subscriber. I have also kept Notion AI in my toolkit. In 2026, Codex and ChatGPT became part of my everyday development work; when my usual access channel is restricted, I sometimes switch to Claude Code.

These tools have accompanied different kinds of work: writing code, discussing system design, and experimenting with agents to help a founder develop a public voice and prepare scripts for spoken content.

Over time, one change has stood out. Ideas used to stall at “Do I know how to build this?” Now I find it easier to start, then discuss how something should work and how far it is worth taking.

## 1. Choosing tools through repeated use

Ongoing subscriptions let me use AI in ordinary work and observe how it handles revisions and different tasks. One impressive answer does not tell me whether a tool belongs in my workflow. I care more about whether it helps me keep moving toward a usable result.

My current choices include 6 Sol in my ChatGPT environment, 5.5 Haiku in Claude Code, and Gemini 3.1 Pro. Versions will change; what follows records my preferences and reasons for choosing them.

| Tool | Its place in my work |
| --- | --- |
| ChatGPT and Codex | My most frequently used combination for implementation, discussion and system design. GPT feels the most versatile overall in my work. |
| Claude Code | An alternative development workflow when my usual access channel is restricted. |
| Gemini | A tool I have used since 2023. For spoken scripts and similar writing, I often prefer its voice. |
| Notion AI | A long-standing part of my everyday AI toolkit alongside the development tools. |

These are preferences drawn from my tasks, rather than controlled model evaluations. “More human” writing is a subjective judgment about voice and phrasing, influenced by the source material and revision instructions too.

### One month of actual usage

The screenshot below records my September 2026 usage on one AI access platform: 45,118 requests, approximately 4.95 billion total tokens, and about US$674.23 in actual charges as reported by that platform. It captures a period in which AI was already a regular part of my daily work.

![September 2026 AI platform usage: 45,118 requests and approximately 4.95B total tokens, including about 4.27B cached tokens](/articles/ai-working-practice/monthly-usage-2026-09.png)

The total includes approximately 4.27 billion cached tokens, so it should not be read as entirely newly generated content. The charges follow this platform's billing rules. This screenshot covers only that access platform, rather than my complete usage across all AI tools.

Repeated use gives me many real tasks in which to observe these tools. The value of the work still depends on whether code passes verification, designs can be implemented, and writing is suitable for use.

## 2. GPT lets me spend more attention on architecture

Previously, I would often begin a feature by asking whether I knew the relevant technology and had enough time to implement it. Implementation cost could limit an idea before it had been explored.

With Codex and ChatGPT, starting an implementation has become easier. An unfamiliar framework, an interaction I have never built, or a change spanning several modules can be broken down and advanced incrementally.

The feeling is immediate: almost any feature seems worth attempting. At times there is even the excitement of feeling that the world is within reach.

I understand that feeling as an expansion of what I am willing to try. Once code can be produced, many decisions remain: whether business rules hold, whether responsibilities are clear, where state belongs, how failures recover, and what later changes will affect.

This gives me more room to focus on architecture and tradeoffs. Faster code generation makes it more valuable to define the problem, the constraints that must hold, and the result that is acceptable.

AI makes me more willing to try an approach. It also makes the need for continuous design judgment and acceptance review more apparent. Those responsibilities extend beyond the first prompt.

## 3. A real fix: Working with AI on MQ consumer transaction boundaries

While investigating the RegenBio reporting system, I encountered a concrete failure: report approvals advanced asynchronously through RocketMQ, but database changes did not roll back as expected when the consumer threw an exception.

The issue concerned the consumer's local database transaction, rather than RocketMQ's transactional messaging mechanism. Message retries and database rollback are separate responsibilities. An exception that triggers redelivery does not establish that previous database writes have been undone.

### Following the symptom through the call chain

I first asked AI to read the messaging template and report approval listener, then analyze possible approaches. It separated two boundaries: the producer already had a design for sending messages after transaction commit, while the consumer's shared entry point called the business consumption method directly.

Although the report listener declared `@Transactional`, its inherited entry point and internal invocation made it necessary to check whether the business logic actually passed through Spring's transaction proxy. AI proposed managing the transaction explicitly at the shared consumption entry point. It also identified separate questions around failure-state writes, retries and notifications.

The useful collaboration was turning “Why did an exception not roll back the changes?” into inspectable call paths, transaction boundaries and side effects. The presence of an annotation alone could not settle the question.

### My decision: Share the capability and limit business changes

AI initially proposed a broader revision, including extracting an approval business service, clarifying failure semantics and changing notification timing. I chose to establish whether we could first add a consumer transaction contract in core and let Report adopt it, without taking on the full refactor.

Transaction execution is infrastructure that multiple consumers can reuse. Placing it at the common entry point would reduce individual listeners' implicit dependence on annotations and proxy invocation, while keeping the business scope of this fix manageable.

The implementation added an opt-in transaction switch to the shared listener and wrapped business consumption in `TransactionTemplate`. Existing nontransactional behavior remained the default; listeners needing a local transaction enabled it explicitly. Exceptions continued to propagate to RocketMQ for retry handling. Explicitly requesting a transaction without a transaction manager caused an immediate error, rather than silently running without one.

Report adopted this capability while retaining its approval business structure. The immediate goal was precise: give local database rollback on consumption failure a shared, testable execution boundary.

### From one fix to checking similar consumers

After the first change, I asked AI to inspect other listeners and identify which also needed transactions. The review covered consumers in authorization, framework, infrastructure, reporting and other modules.

We did not enable transactions everywhere. Consumers writing local database state adopted the shared capability. Pure cache and configuration refreshes did not require database transactions. Email, SMS and file uploads would not become reversible merely by enabling a local transaction.

The execution records in the conversation reported passing component tests for commit, rollback on exception and immediate failure when a required transaction manager was absent. They also recorded compilation checks for Report and several other adjusted business modules.

![MQ consumer transaction collaboration excerpt: agreement on minimal changes, introducing TransactionTemplate at the shared entry point, and recorded component tests and Report compilation results; original conversation in Chinese](/articles/ai-working-practice/mq-transaction-collaboration.webp)

### Keeping conclusions within the evidence

These records support the component transaction tests and business module compilation checks. Verifying the business outcome still requires exercising the actual workflow and checking database state after consumer exceptions, message redelivery and notification behavior.

A local transaction does not automatically handle duplicate consumption, exhausted retries, external side effects or the failure window between a database commit and message publication. Whether approval failure state should be rolled back or retained, and when notifications should be sent, still depends on business semantics.

AI helped read code across modules, develop candidate approaches and execute changes. I continued to decide the repair target, ownership of shared capabilities, change scope and acceptance boundaries. This is the kind of AI engineering collaboration I want to demonstrate, beyond how much code a tool can generate in one pass.

## 4. This website is an ongoing collaboration too

This personal website is a concrete example. Its articles, case studies, profile, internationalization and dark mode took shape through repeated discussion and revision.

Many requests began as a direction: a quieter Japanese editorial feel, case studies centered on business, or clearer recommendations and return actions at the end of an article.

The details had to be resolved in the actual pages: what appears first, where whitespace helps, which separators add nothing, and whether related buttons really align.

The article ending illustrates the process. We first established a side-by-side layout for related work and further reading, then made them matching banners. Later revisions moved the category labels inside, reduced title sizes, added single-line truncation, and corrected the alignment of the share and return buttons.

A side-by-side layout resolves structure. Hierarchy, text density and the relationship between actions still need to be judged in the rendered page. AI can help change the code; I still need to explain what fails and check whether the next result resolves it.

This has made collaboration more concrete for me: after setting a direction, I need to observe the result and turn dissatisfaction into actionable requests.

## 5. For spoken scripts, I tend to prefer Gemini

Beyond development, I have experimented with agents to help a founder build a public presence. Preparing spoken scripts is one part of that work.

The writing needs to sound natural when a real person says it. Clear ideas, speakable sentences, a voice that suits the speaker, and a pace the audience can follow all affect whether a script is usable.

For these tasks, Gemini's phrasing often feels more human and less recognizably AI-generated to me. I usually prefer it as a starting point for further editing.

Smooth prose alone does not make a script ready. The founder still needs to agree with its judgments; claims need supporting material; and speculation must not become fact. Personal experiences, company achievements and numbers cannot be invented simply to complete a story.

This helps explain why I keep several tools. Development and spoken content have different acceptance criteria. I choose a workflow for the task instead of expecting one model to use the same voice everywhere.

## 6. The AI capability I want to demonstrate

Through continued use, I have come to value three abilities: making a vague idea clear, helping tools advance within existing constraints, and judging whether the result meets the requirement.

In development, that judgment concerns business boundaries, architecture and verification. In writing, it concerns audience, facts and expression. Models can contribute to many steps; someone still has to decide which outputs are suitable to keep.

Using AI in personal work and building an AI product for ongoing operation also involve different demands. The [LAIFE AI case study](/en/projects/laife-ai/) explains how health records, an AI assistant and service operations connect. [Software Engineering in the AI Era: Specifications, Constraints and Verification](/en/articles/ai-spec-driven-development/) examines how to check AI-generated implementations.

I want to keep trying new tools. AI has made it easier to take an idea far enough that it can be seen and discussed. The next responsibility is to refine it into something people can use.
