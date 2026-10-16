---
title: "Managing an agile engineering team: Delivery, collaboration and growth"
description: "Coordinating nine people across projects through clinic requirements analysis, LAIFE AI collaboration, performance goals, self-hosted builds and team development, including the trade-offs."
editorialScore: 7.5
readingTime: "18 min read"
tags: ["Team collaboration", "Engineering management", "Delivery practice"]
---

By September 2026, the team had nine members in addition to me: seven in engineering and two in IT. Engineering responsibilities included full-stack development, Flutter mobile development, testing, agents and operations, with a full-stack intern among the team. People brought different experience and worked on different projects.

The team progresses several products at once. Some people refine business workflows, others handle payments and authorization, build agents, or support deployment and quality. Individual tasks can move forward separately, while API dependencies, business understanding and release conditions need shared agreement.

I want to reduce dependence on a lead asking everyone for updates individually. Results, blockers and priorities need to be understood together, with room for newcomers to learn and for people to discuss individual concerns. I therefore connect requirements scoping, project alignment, internal iterations, engineering delivery, performance goals and team development through appropriate processes.

This account draws on requirements analysis, actual meetings, performance plans, team conventions and mentoring experience to explain how these arrangements work and how they change when problems appear. Review templates, agreed designs and actual delivery outcomes need to be considered separately.

## 1. Project alignment: Progress, readiness to start and readiness to release

What business colleagues need to confirm in a project meeting does not always overlap with an internal implementation disagreement. Nor should someone have to explain their feelings about an assignment in front of the entire team.

I retain several settings with relatively distinct responsibilities.

| Format | Participation and frequency | Main purpose |
| --- | --- | --- |
| Project meeting | Relevant engineers and business colleagues, weekly | Share project progress, clarify requirements and exchange business information |
| Internal iteration meeting | The internal team, weekly | Demonstrate work, expose blockers, discuss design and align next week's priorities |
| Learning session | Team members, weekly | Develop technical understanding, presentation skills and responses to questions |
| One-to-one | A member and me, fortnightly, about 30 minutes each | Understand individual ideas, difficulties and experiences at work |

These conversations have different audiences and outputs. If the same update is being read aloud several times, we need to reconsider what could be read beforehand and what actually requires discussion.

### Give each project stage a clear question

For LAIFE AI, the communication design includes three meeting types. Weekly meeting records show ongoing project progress, while requirements and release review templates define what should be confirmed at their respective stages:

| Meeting | Frequency and length | Question it must answer |
| --- | --- | --- |
| Project weekly meeting | Weekly, 45–60 minutes | Where is the project, and what are its risks and dependencies? |
| Requirements review | When a requirement is ready, 30–60 minutes | Is the requirement clear enough for the team to start? |
| Release review | Once before a release, about 30 minutes | Does this version meet the conditions for release? |

The project meeting is recorded around the phase goal, completed work, risks and blockers, requirement changes, decisions and post-meeting actions. Product, engineering, algorithm or agent and testing roles report their parts, but the purpose is not to list everything each person touched. It is to confirm whether the product is moving toward its phase goal.

The requirements review template asks “can we start?” It calls for the purpose, audience, goals and exclusions, current scope, user and exception flows, data and APIs, AI inputs and outputs, acceptance criteria, dependencies, risks and estimates. It includes space for missing information and a decision on readiness for development, allowing incomplete inputs to be addressed before another review.

The release review template asks “can we release?” It distinguishes included and deferred scope and calls for checks on frontend, backend, algorithm or AI readiness, testing, production configuration, database changes, older-version compatibility and customer notifications. Algorithm availability, output validation and critical-path regression each require separate confirmation. The template records whether release is allowed and under what conditions.

This design separates progress, inputs for starting work and evidence for releasing it. Templates provide a shared review scope; actual execution and follow-up still need to be demonstrated in specific records.

In the project's actual records, product, backend and web, mobile, algorithm and testing progress are recorded separately. Compliance, migration, model fallback, load-test results, P0/P1 defects and decisions are tracked as their own items. The value is not a longer minute; it is making each role's concerns visible and ensuring that unresolved actions receive a clear response at the next meeting.

### From business research to first-release scope: A clinic project

Requirements analysis for the LaTipSoh clinic management system offers a concrete example. The business involves reception, appointments, consultations, test reports, intervention plans, product packages and referral attribution. Starting directly from every role's feature requests could easily turn the first release into a combination of clinical operations, CRM, commerce and channel settlement systems.

I began with several requirements discussions, the clinic's reception SOP and proposed business flows, then listed unresolved questions for confirmation. As discussions progressed, I recorded decisions, open questions and their implications for prototypes, permissions, data and scheduling.

#### Establish business boundaries before expanding features

The agreed first release focused on a customer-facing WeChat mini program and an internal administration interface. A separate partner portal, automated RFM segmentation, automated follow-up, loyalty points, AI-assisted clinical record entry and automatic report parsing were deferred, retaining room for extension where needed.

Channel settlement illustrates the trade-off. The business needed customer sources, partner attribution, payment status and redemption status. That did not require automatic commission distribution, withdrawals and fund splitting in the same release. The system would first record the basis for settlement and provide commission reference data, with final settlement remaining in the offline finance process. This addressed current needs while clarifying responsibility for handling funds.

Report handling also changed. Early discussions included manually entering individual test indicators; later agreement prioritized uploaded report files, status and metadata. Indicator details, OCR/AI parsing and human review would be future extensions. This affected staff work, interface design and implementation scope, so related agreements needed to change together.

#### Translate role requests into specific rules

A role list identifies participants. Implementation also depends on what each person may see or change, and what evidence an action must leave. I organized these questions into menu structures, a role-permission matrix and a functional requirements list, defining boundaries through data scope and permitted operations.

For example, marketing and sales could create appointments and access their own leads and attributed customers, without access to unrelated clinic operations or financial data. Appointment adjustments by health consultants required reception or administrator review. A customer's original attribution must survive changes to the person receiving them on site. These rules affect API authorization, field updates and audit records.

Scheduling and clinical records have their own constraints: appointments use published availability, with no automatic assignment in the current phase; archived schedules cannot be changed, while amendments to signed and published clinical records require version history and operation records. These states and conditions make the business rules behind a prototype explicit.

#### Turn requirements decisions into inputs for design and scheduling

Shared capabilities also needed consideration. Accounts, basic user profiles, file storage, messaging and electronic signatures would reuse existing services where appropriate, with business-data access boundaries defined. Server, mini-program certification and domain costs entered the discussion. Project priority also affected allocation: problems in a higher-priority project would require coordination of the current schedule.

The analysis produced menu structures, a permission matrix, functional lists and prototype confirmation records, providing inputs for subsequent table structures, state machines, APIs and development scheduling. This experience shows how successive discussions formed actionable agreements. Development, testing and trial operation still need to establish whether the resulting system meets users' needs.

### A backend and algorithm issue: Messages migrated, but AI did not use them

During a historical-data migration test, the new version's AI answer failed to use information the user had already provided in an older conversation. The issue was brought into the project meeting for joint investigation by backend and algorithm colleagues.

The investigation recorded a missing migration flag that identified data for subsequent knowledge use. Migrating message content and making that information available to the algorithm required separate verification. Checking that records existed could not establish whether a user's follow-up question would receive the correct answer.

The meeting record left two follow-ups: fix the omitted flag for the production migration, and confirm with the algorithm team whether restoring that flag would be sufficient for normal use. One addressed migration logic; the other checked the contract and conditions for consuming the data, so that neither side could simply assume its part was complete.

This illustrates the coordination I want project meetings to support: break an issue spanning roles into questions that can be verified, and identify which side needs to respond. The record at that point established the cause and planned further verification; it did not document final acceptance.

## 2. Internal iterations: From working software to next week's priorities

Half an hour before the meeting, people fill in their completed work and next week's Top 3 tasks. The resulting shared record supports the discussion and remains available afterward, reducing the need to write another report with the same information.

The internal agenda follows working demos, a board review, a short retrospective and next week's plan. The intention is to see the result before discussing task status and subsequent arrangements.

### Demos expose differences in understanding early

A demo must use screen sharing to show completed, runnable code or a product, with questions and feedback during the session.

Whether a feature meets expectations often becomes clear only by walking through its workflow. A page opening does not establish that a user can complete their task. A successful API response does not establish that failure states, access boundaries and subsequent actions make sense.

The demo gives internal brainstorming a shared object. Testing can raise questions about user journeys; other engineers can point out cross-module effects; I can address design deviations and explain trade-offs. A concrete result makes it easier to develop a shared understanding of the feature.

I want alignment on business goals, constraints and acceptance criteria. Implementation can still be debated, and there needs to be room to disagree.

### Review the board quickly and discuss complex issues separately

After demos, we review task status, focusing on blockers and the support or resources needed.

When an issue involves only two or three people, we avoid investigating implementation details in the full-team meeting. First establish the blockage, its impact and who needs to participate, then continue separately. The team retains visibility into dependencies without everyone sitting through unrelated details.

Board status also needs to correspond to delivery. If “in development,” “awaiting testing” and “done” mean different things to different people, moving cards frequently will not make project progress clear. Runnable demos and testing feedback provide more concrete evidence for those states.

### Keep retrospectives and planning short

We use KISS: Keep, Improve, Start and Stop, to discuss practices worth retaining, improving, introducing or ending.

I care about whether the discussion leads to an adjustment we can try. When a dependency was not exposed in time, was the problem task decomposition or a missing participant? Repeating “communicate better” every week offers little practical help.

We then confirm the next iteration's goals and each person's Top 3 tasks. These express priorities while leaving room for people to decompose their own work. The onboarding guide describes assigning work at a broader level and letting developers break it down: goals should be clear, with judgment left in execution.

Top 3 is not a complete account of workload. Testing, operations and IT support can be interrupted by incidents and requests for assistance, and those contributions need to remain visible. If priorities change, previous commitments need to be revisited. Adding work should not silently leave every old commitment unchanged.

### Record delivery outcomes without concealing risk

Our record groups the week's results by product and next week's Top 3 tasks by person. The first helps explain what changed in a product; the second makes responsibility for the next steps visible.

I want the writing to resemble release notes: identify the module, capability and result. “The order module handles payment callbacks and state transitions” gives colleagues a clearer update than “researched the payment API.”

Some work is exploratory. An outcome-oriented update should not turn a proposal still under investigation into a delivered feature. Exploration can report what was ruled out, what was verified and what remains uncertain.

Minor defects and routine usability adjustments can be grouped to keep the meeting readable. Problems affecting data correctness, security, stability or a release plan need separate attention. Summarizing should make information easier to understand while keeping risks visible.

## 3. Engineering delivery: Self-hosted builds and artifact management

Merged code changes need to become artifacts that can be used for subsequent deployment. We host source control, continuous integration and artifact management internally so that everyday development follows a shared automated path.

After development, code is pushed to our self-hosted GitLab. AI code review runs automatically during the branch merge process. Once the merge completes, our self-hosted TeamCity runs the build pipeline and pushes the resulting artifacts to our self-hosted Nexus repository.

```text
Complete development → Push to GitLab → AI review during the merge process
                     → Complete merge → TeamCity build → Nexus artifact repository
```

Internal hosting also covers Docker images, npm packages, Maven dependencies and artifacts, frontend Dist build output, and OSS object storage. These use the appropriate repositories or storage services: Nexus manages artifacts, while OSS provides object storage. “Self-hosted” here means within the company's infrastructure, rather than only on developers' personal computers.

This gives source code, builds and artifacts a defined connection, reducing reliance on manual packaging and file transfers between team members. A newcomer's first merge request also follows the same path, helping them understand how a change becomes a build artifact.

AI review provides an additional check. It can flag issues for investigation, while developers remain responsible for business rules, access boundaries and the impact of changes. A successful build does not replace testing or release review. The toolchain executes repetitive steps; the relevant review stages still determine readiness for delivery.

## 4. Performance goals: Recognize delivery, quality and collaboration

Weekly meetings and boards help the team decide what to do next. Quarterly goals need to explain which projects receive limited capacity, what results deserve recognition and what responsibility each role carries.

In the performance plan, I break department project goals down to individuals using focus areas, weights, key results and priorities. Weights express the share of an evaluation; priorities guide resource conflicts. Payment or reliability work may require little routine effort but demand immediate attention when something goes wrong.

### Define contributions by role and recognize reusable engineering work

Development goals cover features, APIs, data structures and integration, alongside release quality and maintenance. Testing goals emphasize critical paths, exception scenarios, acceptance records and defect reviews. Operations and IT focus more on releases, rollback, monitoring, permissions, assets and service support. People share a delivery goal, with evaluation evidence corresponding to their responsibilities.

The plan also makes room for work that supports future delivery. Onboarding goals include understanding business flows, documenting APIs and data structures, self-testing and review. Mentoring goals include decomposing intern assignments, reviewing code and recording important issues. Helping others finish work and reducing maintenance costs deserve recognition too.

I want these expectations to connect to inspectable evidence: demos and acceptance for usable features, exception scenarios and issue records for integration, and assignments and code feedback for mentoring. Document counts can set a minimum expectation; whether those documents help the team still requires judgment.

### Account for external dependencies and requirement changes

Some results depend on business colleagues, hardware or other teams and are not fully within an individual's control. The plan therefore allows scope adjustments after requirement changes and alternative acceptance when hardware integration is blocked: under agreed conditions, validating the flow in a mock environment can count as completing that assignment.

Mock validation has limits. Real-device compatibility and failure behavior still require later integration testing. Evaluation should distinguish completed individual responsibilities, unavailable external conditions and remaining work, so that waiting on a dependency is not automatically treated as a failure to deliver.

### Refine measurement definitions and incentives

The current plan includes delivery rates, response rates, defect severity and coverage. A percentage is only a starting point. We still need consistent definitions of the denominator, scope version, observation period and person confirming the result. Weights and rating levels also need checking before final agreement.

Zero incidents and zero financial loss express quality expectations. Individual evaluation also needs attribution, proactive discovery, timely reporting and the handling process, so people are willing to surface risks early. Early delivery likewise needs to be considered alongside quality and reasonable estimates, avoiding incentives to earn a higher rating through conservative estimates.

The plan still needs adjustment through execution feedback. A goal sheet describes the work I want to encourage. Whether evaluation is fair and supports collaboration depends on actual discussions, evidence and member feedback.

## 5. Team development: Onboarding, learning and individual conversations

### Make collaboration accessible through an onboarding guide

New colleagues would struggle to absorb all of this through conversation alone. Our onboarding guide therefore covers the business and architecture landscape, tools, technology choices, commit conventions, branching, iteration meetings and learning sessions.

It sets concrete first-week milestones: establish accounts and the local environment, learn the engineering conventions, then run a project locally, pick up a first feature or defect task and complete a standard merge request.

The goal is to follow the team's actual delivery path early. Where the code lives, where issues are recorded, how to propose a change, and how a merge reaches an environment matter more than memorizing a tool list.

Engineering conventions are part of that experience. Conventional Commits and merge requests connecting development and production branches through CI/CD provide common expectations between individual implementation and team delivery.

For newcomers and interns, the guide emphasizes adapting to engineering conventions, learning and code quality, using short-term milestones to support integration. Business responsibilities matter, and support and expectations should match a person's stage of development.

### Technical sharing requires explanation and questions

Theory and practice rarely remain perfectly synchronized. Busy delivery periods can teach someone to implement a feature without leaving time to understand the underlying mechanism. A newcomer may know classroom concepts but struggle to connect them with actual code.

I therefore introduced weekly sessions focused on understanding computer systems and explaining technical ideas. Initially, the advanced system architect examination syllabus provided a sequence, organized into chapters, sessions and lessons covering computer organization, operating systems, networking, databases, requirements engineering and software processes.

In August 2026, I revised the requirements to allow more flexible technical topics. Frameworks, middleware, AI, testing, DevOps, security and emerging technology are welcome, provided the subject is specific. Connections to real projects and previously covered foundations are encouraged.

“Databases” is too broad; “Tracing latency across a request's full path” offers a clearer question and scope. Sessions have also covered model evolution and Harness Engineering, keeping systematic learning connected to current work.

#### Prepare before presenting

The current schedule asks the speaker to submit a first slide draft by Wednesday evening, receive review and revise on Thursday, then use an hour on Friday morning: roughly 40 minutes of explanation and 20 minutes of questions.

Slides should be around eight pages, using diagrams, flows, cases or the speaker's own interpretation instead of large blocks of text. Each attendee prepares at least one question, so listening also involves thinking.

Preparation and review can expose an oversized topic, gaps between concepts or a case that does not support the claim. The live session can then pursue questions grounded in specific material.

#### AI can assist, but the speaker must understand

AI assistance is allowed. The speaker remains responsible for understanding the material. I expect members to place a technical idea within the wider software system, explain the problem it solves and where it does or does not fit, then connect it to project use and common failures.

“Able to handle ten minutes of questions” expresses the intended depth of understanding. Questions should not turn into an examination designed to embarrass the presenter. Their purpose is to uncover what remains unclear and help everyone think further.

AI makes information retrieval and code generation easier. Judgment about system behavior, business context and design quality still develops through experience. I want a regular place for that development.

### One-to-ones create room for individual perspectives

Team meetings reveal tasks and results, but not necessarily how each person feels. I also meet members individually every two weeks, for about 30 minutes each, to understand their thoughts about work.

I see this time as suitable for discussing difficulties, experiences with responsibilities, directions someone would like to explore, and support they need. Members should have room to shape what gets discussed.

Repeating a progress inspection would provide little information beyond the team meeting. A lead also needs to be willing to hear disagreement and carry matters requiring follow-up into actual work arrangements.

## 6. Mentor high-school students through manageable engineering steps

Alongside the professional engineering team, I mentor high-school students on “Anti-Entropy Engine,” a health-themed game project. With little experience in coding or collaborative development, they need guidance that begins with product flows they can understand and gradually connects those flows to implementation.

The project has moved from discussing game ideas toward an MVP, leaving a marketplace, social features and complex AI functionality for later consideration. I guide the students through user flows and interactive prototypes, then help them translate users, characters, tasks and rewards into an initial data design. Reviews ask concrete questions: how is a reward claimed and used, when is progress saved, and where does the user return after leaving a screen? These questions connect interface design with business rules.

When a student preferred building first and refining afterward, I also needed to explain how much upfront design is useful. They do not need every detail settled, but they do need draft flows, objects and fields sufficient to divide the work. Designs can evolve during implementation; an initial agreement helps everyone understand their responsibilities and which changes require coordination.

For AI-assisted development, I assign small exercises in expressing requirements, generating a result, running it and giving feedback. Students explain which prompts they used, where the result differed from their expectations and how they revised it. Next steps include draft data tables and GitLab collaboration exercises, gradually connecting tool use with actual software development.

This also requires me to adjust my teaching. Too many architecture and engineering concepts at once can exceed a beginner's current understanding. When the students' proposed architecture became too complex, I took responsibility for preparing an MVP architecture baseline and explaining it through their immediate tasks. Students still need parts they can complete, explain and revise themselves, so that the project does not remain dependent on me supplying every answer.

At the time of these records, the project was still revising its prototype and preparing for development. Next steps were draft data designs and collaboration exercises, followed by verification through working features.

## 7. Keep reviewing the costs and effects

Project meetings, internal reviews, learning sessions and one-to-ones together take substantial time. Each format having a reasonable purpose does not prove that the combined schedule is effective.

I need to watch for repetition between meetings, specific feedback from demos, changes arising from retrospectives, connections between learning and real problems, and enough uninterrupted working time. Full-team technical discussions also deserve scrutiny when only a few people benefit.

As the team grows, one-to-ones occupy more scheduled time and need to be assessed for whether they surface problems and support people. Self-hosted infrastructure reduces manual work but adds responsibility for availability, access control, upgrades, backups and capacity. Those costs also belong in the assessment.

Requirements confirmation and performance evaluation have costs too. Requirements need enough clarity to support development while remaining open to revision through feedback. Metrics should support discussions of contributions without making data collection and interpretation a new burden. When scope, dependencies or priorities change, plans and evaluation criteria need to change with them.

These records explain how the team works and follows up on specific problems. They do not quantify changes in delivery time, defects or individual capabilities. Those judgments require actual delivery evidence, problem resolution and feedback from members. For the student project, working features, collaboration and the students' own explanations will also help establish what they have learned.

I want to retain practices that make results, blockers, priorities and individual perspectives visible. When an arrangement consumes time repeatedly without supporting work, it should itself be something the retrospective can improve or stop.
