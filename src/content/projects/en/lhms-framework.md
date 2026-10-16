---
name: LHMS Framework · Shared business platform
title: "LHMS Framework: Reusing business administration across new products"
description: Consolidates repeated administration work into a shared platform for members, operations and orders while preserving each product's business differences.
category: Enterprise services
order: 3
tags: [Member management, Operations, Funds & orders, Customer service]
audience: Trading and operations teams, developers of new products
flow: [Members & agents, Content & notifications, Funds & orders, Support & operations]
relatedArticles: [microservice-authorization, architecture-evolution]
---

Every new product needs an administration system: someone must manage members, review funding requests, publish content and handle customer questions. These requirements recur across projects and consume an increasing share of delivery effort.

I built LHMS Framework to consolidate those common needs into a shared business platform, accompanied by the LHMS Admin console. It was subsequently reused in OTC, BT CEX, Simple, SDH and other projects as an inherited foundation for business administration.

## Different products, repeated administration

Projects were developed and deployed independently. Each product needed its own business identity, yet member maintenance, publishing and access management followed largely similar logic.

Building them separately meant repeating development and integration, then maintaining fixes in each project. I wanted to preserve solutions to common problems so new deliveries could focus more on their core business.

## The key judgment: how much to standardize

The platform needed a controlled scope. Putting every product rule into it would entangle independent projects; offering only login and permissions would do too little to reduce repeated business development.

I used reusable administrative workflows as the boundary. Member and agent relationships, content operations, funding requests and support tickets went into the shared platform. Trading categories, order rules and product-specific workflows remained extensions in individual projects.

Different trading products, for example, need order queries and deposit/withdrawal handling, but generate and settle orders differently. They share management entry points and foundational capabilities while retaining room to change specific business logic. Projects can still deploy and iterate independently.

## Reuse across trading products while preserving their rules

The trading projects supported by this platform primarily used centralized operator administration of accounts, orders, funding requests and business configuration. Their similarity makes a combined account of shared capabilities and product extensions useful: it shows how one foundation serves different products.

Recurring member features included invitations, relationship graphs, multiple languages, notifications, help centers and agreements. Operational requirements also included market opening and closing settings, VIP entitlements and customer support. Products could select and extend these capabilities rather than rebuild an entire console.

Trading categories remained business extensions. Contracts, for example, required configurable leverage, minimum purchase quantities, lot sizes and limit-order support; spot and stock products had their own instruments and order rules. Limit checks, position-risk calculations and liquidation belonged to those trading workflows. Business systems received market updates, checked order or account conditions, updated business state and notified users. RateHub supplied market-data ingestion and distribution; the respective projects remained responsible for order decisions and processing.

Funds management covered multiple wallets, transfers between wallets in the same currency, multi-channel deposits and withdrawals, review records and referral commissions. Staff needed to identify the member, wallet, currency, amount, channel and processing status. Third-party funding integrations and internal approvals had separate responsibilities. This describes business coverage: each project still needed its own transfer, settlement and failure-recovery rules. Management screens alone do not guarantee funds consistency.

These capabilities span the shared platform and derived projects. Not every project enabled every module, and backend order processing should not be equated with order-book matching or execution of an on-chain protocol.

## From an open-source foundation to a reusable business platform

LHMS Framework builds on ruoyi-vue-pro with JDK 17 and Spring Boot 3.x. Business modules and shared capabilities were organized around members, operations, funds, orders and support, providing reusable administration for subsequent products.

The adaptation required understanding dependencies between existing capabilities. Login identity supports not only API authorization but also operation logs and automatic creator/updater fields. Changing authentication therefore requires reconnecting those dependencies so actions remain attributable to specific staff.

I preserved and integrated a consistent login context, permission checks and audit-field population while extending the business features. New modules can reuse identity and operation recording, giving member maintenance and funding reviews consistent access boundaries and traceability without reimplementing that logic in each project.

## Available capabilities

Projects select and extend the following capabilities according to their scope:

| Area | Features and use cases |
| --- | --- |
| Members and agents | Member profiles, account status, invitation relationships and agent hierarchies for maintaining customers and ownership. |
| Content and notifications | Announcements, news, banners, advertisements and multilingual content; email templates, SMS and sending records. |
| Wallets and funds | Multiple wallets, same-currency wallet transfers, multi-channel deposit/withdrawal applications and third-party funding channels; fund records, approvals and project-specific referral commission settings. |
| Market data and trading | Trading instruments, quotes and candlesticks; spot and contract order management for project-specific extension. |
| Customer service | Feedback, instant messaging, canned replies, ticket intake and closure for consultations and follow-up. |
| Operations configuration and data | Product-specific market hours and VIP entitlements; traffic trends, member and fund statistics, detailed queries and business exports. |
| Administration and access | Staff, roles, menus, actions and data scope; operation logs and files for separation of duties and traceability. |

## From feature delivery to everyday operations

Delivery also covered the business console. LHMS Admin extended an existing open-source administration framework so operators, reviewers and support staff could use the capabilities directly.

For a funding request, a reviewer opens a pending record, inspects the member, amount, channel and status, then approves or rejects it. The record remains searchable. Content staff maintain announcements and banners, while support staff accept, process and close tickets. Role permissions and operation records provide boundaries and traceability for these everyday tasks.

The result covers both customer-facing features and administration, giving business teams the interfaces needed to operate the product.

## Outcome

LHMS Framework and LHMS Admin became a reusable platform and console deployed in multiple derived projects. New projects inherit member, operations, order and support capabilities, then add their own workflows.

This approach preserves product independence while retaining the maintenance cost of synchronizing shared fixes across projects. The concrete problem it solved was allowing capabilities already delivered once to serve the next product.
