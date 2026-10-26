# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customers (ลูกค้า)** at a quick-service, McDonald's-style shop. They open the site on their own phone, browse the menu, order, wait for their queue number to be called, and collect the food at the counter.
- **Kitchen staff (ครัว)** working from a laptop or tablet placed in the kitchen, read at 1–2 m with messy hands. They take orders in queue order, start cooking, mark food ready, and mark it picked up.
- **Shop admin (จัดการเมนู)**, usually on the same laptop/tablet: maintains menu items, prices, photos, and toggles items sold out during service.

## Product Purpose

ครัวคลาวด์ is a serverless food-ordering system (university cloud project on AWS: API Gateway → Lambda → DynamoDB, SQS kitchen queue, SNS ready notification, S3 menu images, Amplify hosting). Success: a customer can order in under a minute without staff help, always knows where the order is, and the kitchen never loses or mis-sequences an order.

## Operating Context

- Counter pickup (confirmed by the team, replaces an earlier dine-in assumption): there are no table numbers. When the kitchen marks an order READY, the customer is alerted and collects it at the counter by queue number and name.
- Order lifecycle: PENDING (sent, waiting for the SQS consumer) → QUEUED (gets a daily queue number) → PREPARING → READY → COMPLETED (picked up). CANCELLED is allowed only from PENDING/QUEUED.
- Customer pages poll every 4 s; READY triggers an on-screen popup, a chime, and an optional browser notification.
- Kitchen screen polls, chimes on new QUEUED orders, sorts oldest first.
- Without `VITE_API_URL` the app runs on a localStorage mock backend (demo mode) that mirrors the Lambda rules.

## Capabilities and Constraints

- React 19 + Vite SPA, HashRouter (`/#/kitchen`) so deep links work on static hosting. Hosted on AWS Amplify (monorepo `appRoot: frontend`).
- API contract lives in `../docs/API.md`; the UI must not change request/response shapes without updating it.
- Thai-first UI copy; prices in baht; queue numbers are Arabic digits.
- No user accounts: "my orders" is per-browser (localStorage).

## Brand Commitments

- Name: **ครัวคลาวด์** (confirmed by the team; replaces the earlier "ครัวจิ๋ว").
- No logo or brand assets exist yet.

## Evidence on Hand

- Seed menu in `src/api/mock.js` (7 Thai dishes, no photos). Real dish photos do not exist yet; do not invent claims, reviews, or prices beyond the seed data.

## Product Principles

1. The customer should never wonder what to do next or where the order is.
2. The kitchen screen is read at a distance: queue number, items, and waiting time first; everything else second.
3. Never rely on colour alone for order status.
4. Demo mode must look like the real product, with only a quiet indicator that it is a demo.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast ≥ 4.5:1, touch targets ≥ 44 px on phones, visible keyboard focus on laptops, respects `prefers-reduced-motion`.
