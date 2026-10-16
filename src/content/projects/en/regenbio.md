---
name: RegenBio Cloud · Health business platform
title: "RegenBio Cloud: From test report delivery to health service management"
description: Starting with AgeSeer reports, connects samples, laboratory data, report approval and delivery, then extends into appointments, consultations and service plans.
category: Health testing
order: 2
tags: [Sample management, Report delivery, Workflow approval, Health services]
audience: Laboratory and reporting teams, partner organizations and test customers
flow: [Sample reception, Laboratory materials, Report generation, Approval & delivery, Health services]
relatedArticles: [microservice-authorization]
---

Delivering a test report involves sample reception, experiments, data preparation, report production and review by multiple people. As report versions and customer groups grow, teams need to know where each sample stands, whether its materials are complete, who is handling it and when the report can be delivered.

RegenBio Cloud organizes this workflow into a health business platform connecting internal operations with customer services. Its backend provides business workflows; RegenBio Web supplies administration, unified login and customer mini-programs for AgeSeer reports, LaTipSoh health services and related scenarios.

## From separate tools to an integrated business system

The original reporting workflow used Feishu multidimensional tables, approvals and HTML-to-PDF tools. Increasing PDF customization and expanding operations gradually exceeded their capabilities in access control, report management and system integration.

I began with report generation and approval, taking responsibility for system architecture and engineering. The core problem was to connect separate steps: establish ownership of samples and materials, make laboratory progress traceable, associate reports with review records and give staff and customers appropriate entry points.

The system also needed room for future integration with laboratory management systems and mobile applications.

## Connecting report delivery around the sample

Samples form the main thread of the reporting business. Staff can create or bulk-import samples, register and receive them by scanning codes, maintain laboratory progress and storage locations, and attach experimental and analytical materials. Reports retain that association when generated.

Staff can trace materials, reports and processing status from a sample. Dedicated actions support rebuilding libraries, adding materials and regenerating reports.

For report production, the system receives upstream analytical results and generates PDFs from the appropriate templates, supporting different AgeSeer report types and customized editions. Algorithm output is connected to the report presentation. Staff can preview reports, inspect source data and, when needed, edit the data and regenerate them.

Report production uses components that render separately and can be combined into customized PDFs. New report editions can reuse existing capabilities while adapting the content and layout that change.

Early execution records cover two generation paths, both measured from retrieving bioinformatics data to producing the PDF:

| Generation path | Recorded result |
| --- | --- |
| Script-based batch generation | Approximately 30 seconds for 10 reports |
| Cloud generation | Approximately 30 seconds for one report |

These observations apply to the report versions and execution paths at that time. Without a common environment, concurrency figures or repeated samples, they are not a direct performance comparison. They also exclude subsequent human review and sending. They demonstrate an operational generation process whose execution time could be recorded.

## Separate management of generation, approval and sending

A generated report must still be approved before delivery. Generation progress, approval workflows and sending status are managed separately so each role can identify the work awaiting attention.

Reviewers use pending, completed, copied and initiated workflow lists. Details show source data, report attachments and an approval timeline. Supported actions include approval, rejection, transfer, adding reviewers, withdrawal and voiding, accommodating staffing changes and additional review.

Delivery preserves sending records, failure reasons and timestamps, including elapsed-time queries from sample reception to sending. Teams can distinguish a report still generating from one awaiting approval or one that failed to send, and follow up at the correct stage.

## Delivery tradeoff: controlling consistency costs early

The system already had several services when traffic was still modest. After evaluating Seata, I initially chose exception records with manual recovery, shared databases for some services, and dynamic data sources to concentrate related operations. This kept early implementation and operational costs manageable.

Those choices also had limits: sharing a database does not share a transaction across services, and routing between data sources does not provide atomic commits across databases. Files written to object storage do not roll back with a database transaction either. The decision therefore retained the cost of investigating and recovering partial failures.

For the reporting business, the important questions are when generation, approval and sending are each complete, and where work resumes after failure. Further development should first define report versions, retries and compensation, then decide whether distributed coordination is required. Clear interfaces leave room for LIMS and mobile integration; consistency guarantees still need verification against specific failures.

## Available capabilities

| Business stage | Capabilities |
| --- | --- |
| Sample reception and tracking | Individual entry, Excel imports, code-based registration and reception, laboratory progress, library rebuilds and sample exports. |
| Sample storage and materials | Freezers, racks, boxes and well positions; sample attachments, dry-lab data and analytical materials linked to samples. |
| Report production | Multiple templates, analysis-data parsing, PDF generation and preview, source-data inspection, regeneration after edits and failed-generation retries. |
| Report approval | Workflow and node configuration, pending tasks and copies; approval, rejection, transfer, additional reviewers, withdrawal, voiding and timelines. |
| Report delivery | Sending to partner organizations, delivery records and failure reasons; generation, approval and delivery timing. |
| Customer self-service | Personal and sampling information, return-shipping details, agreement signing, test progress, previous reports and indicators through a mini-program. |
| Health service management | LaTipSoh questionnaires, testing plans, service agreements, report uploads and interpretation bookings, expert consultations, intervention plans, orders and payments. |
| Organization and access | Tenants, departments, people, roles and resource permissions; unified login and shared files, email and SMS. |

## Extending from reports to health services

Report workflows answer how test results reach a customer. Health services continue with appointments, plan confirmation and follow-up.

LaTipSoh organizes these into a service workflow: staff maintain testing plans and agreements, upload reports, arrange interpretations and expert consultations, and record intervention plans and subsequent services. Customers use a mini-program to answer questionnaires, sign agreements, book appointments and view service progress and orders.

The two businesses share accounts, permissions, files and notifications while retaining their own approval and service-management rules. Administration and customer interfaces serve different roles, keeping internal staff operations out of the customer experience.

The platform is also expanding toward clinic operations, with appointment, scheduling, testing and medical-record modules already present. That part remains under development.

## Product outcomes

The following AgeSeer customer screens show the service entry for an unauthenticated user, the report overview with history, and the product launch experience. Together they represent the path from entering the service to reviewing results and returning for continued use.

<div class="project-gallery">
	<figure>
		<img src="/projects/regenbio/profile.webp" alt="AgeSeer customer center with sign-in entry, testing services and account settings" loading="lazy" width="1245" height="2592" />
		<figcaption>Customer center and testing entry</figcaption>
	</figure>
	<figure>
		<img src="/projects/regenbio/report.webp" alt="AgeSeer report page with organ-system overview and report history" loading="lazy" width="415" height="864" />
		<figcaption>Report overview and history</figcaption>
	</figure>
	<figure>
		<img src="/projects/regenbio/launch.webp" alt="AgeSeer launch screen with brand identity and biological-age testing positioning" loading="lazy" width="1245" height="2592" />
		<figcaption>Launch and brand experience</figcaption>
	</figure>
</div>

## Delivery

The project delivered backend services, administration portals and customer applications. Sample reception, experimental materials, report production, review and sending became a traceable, actionable workflow, with room to extend into health consultations and service management.

Its value lies in putting collaboration among several roles into the system. Staff have clear workspaces, managers can track progress, and customers can access their reports and service records. Report customization, workflow changes and new services now have a foundation for further development.
