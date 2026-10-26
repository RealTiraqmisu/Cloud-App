---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/pages/MenuPage.jsx","src/pages/KitchenPage.jsx","src/pages/OrderTrackingPage.jsx","src/pages/MyOrdersPage.jsx","src/pages/AdminPage.jsx"]
---

## Scope

Whole customer + staff app (menu/cart, order tracking, my orders, kitchen board, admin menu). Mode: Operate.

## Direction contract

THESIS: ครัวคลาวด์ reads like a Thai eatery's painted wall menu board and queue call-board, carried onto the phone and the kitchen tablet. It refuses the orange photo-card delivery-app clone and the dark neon "cloud" dashboard.

OWN-WORLD: Deep board green shell (header band, kitchen board ground) with sign-yellow numerals and primary actions; white working surfaces on a cool off-white ground (never cream); chili red only for sold-out and cancel; status colours slate / blue / leaf green / plum, always with icon + Thai label. Anuphan (bold, loopless) for headings, prices and numbers; IBM Plex Sans Thai Looped for body. Small sign-like corners (6–10px), hairline borders instead of soft shadows, no gradients, no emoji icons.

STORY: The diner scans the board, adds dishes, enters a table number, orders, then watches a mini call-board show their queue number and a four-stop route until staff serve the table. The kitchen reads big yellow numbers on green from two metres away.

FIRST VIEWPORT: Menu on a phone: green header band (name, demo tag), sticky category tabs, dense dish rows (thumb left, name, one-line note, price in board numerals, add button right), sticky bottom green cart bar with item count, yellow total and "ดูตะกร้า". Desktop: dish grid plus a sticky cart panel on the right.

FORM: Hand-painted shop signage / wall menu board, candidate 3 of 7, seed key 8cdb6a64 (degraded roll, no challengers). Signature move: the call-board plate (ป้ายเรียกคิว), queue numbers always set as yellow numerals on a green plate, shared by tracker, my orders, kitchen tickets and the ready popup.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

Keep API shapes (docs/API.md) except the new optional `tableNumber` on create-order. HashRouter routes unchanged. Thai copy, dine-in wording (staff serve to the table).
