---
name: ครัวคลาวด์
description: Dine-in ordering and kitchen display that reads like a Thai eatery's painted wall menu board and queue call-board.
colors:
  board: "#163c2d"
  board-raised: "#1e4a39"
  board-line: "#2f5b48"
  on-board: "#f2f5f0"
  on-board-muted: "#a8c3b4"
  board-tint: "#e2ede6"
  board-tint-hover: "#d2e4d8"
  sign: "#f7c834"
  sign-hover: "#ffd75a"
  on-sign: "#15231c"
  chili: "#b3301b"
  chili-hover: "#962713"
  chili-tint: "#fbe8e4"
  ground: "#f3f5f2"
  surface: "#ffffff"
  surface-sunk: "#eaeeea"
  line: "#d3dbd5"
  line-strong: "#8a968f"
  ink: "#15231c"
  ink-muted: "#4f5d55"
  ink-faint: "#66736b"
  st-queued: "#3d4e60"
  st-queued-tint: "#e7ecf1"
  st-preparing: "#164c8c"
  st-preparing-tint: "#e1ebf7"
  st-ready: "#145c2c"
  st-ready-solid: "#1c7438"
  st-ready-tint: "#dcf1e1"
  st-done: "#4f5d55"
  st-done-tint: "#eceeec"
  st-cancelled: "#82184f"
  st-cancelled-tint: "#f8e5ee"
  warn: "#6b4a00"
  warn-tint: "#fcefc4"
typography:
  display:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "clamp(4rem, 3rem + 5vw, 6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: '"tnum"'
  numeral-kds:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: '"tnum"'
  numeral-md:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: '"tnum"'
  numeral-sm:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: '"tnum"'
  headline:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.3rem + 1.2vw, 2.125rem)"
    fontWeight: 700
    lineHeight: 1.3
  ticket-table:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
  title-sm:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  price:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    fontFeature: '"tnum"'
  button:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  label:
    fontFamily: "Anuphan Variable, Anuphan, IBM Plex Sans Thai Looped, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
  kitchen-line:
    fontFamily: "IBM Plex Sans Thai Looped, Anuphan Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "IBM Plex Sans Thai Looped, Anuphan Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "IBM Plex Sans Thai Looped, Anuphan Variable, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "IBM Plex Sans Thai Looped, Anuphan Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "10px"
  lg: "10px"
  full: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.board-raised}"
  button-lg:
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunk}"
  button-tint:
    backgroundColor: "{colors.board-tint}"
    textColor: "{colors.board}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-tint-hover:
    backgroundColor: "{colors.board-tint-hover}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.chili}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.chili-hover}"
  button-danger-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.chili}"
    rounded: "{rounded.md}"
    height: "44px"
  button-danger-quiet-hover:
    backgroundColor: "{colors.chili-tint}"
  button-board:
    backgroundColor: "{colors.board-raised}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-board-hover:
    backgroundColor: "{colors.board-line}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  category-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  category-tab-active:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
  board-tab:
    backgroundColor: "transparent"
    textColor: "{colors.on-board-muted}"
    rounded: "{rounded.sm}"
    height: "44px"
  board-tab-selected:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.on-sign}"
  nav-link:
    textColor: "{colors.on-board-muted}"
    padding: "0 12px"
    height: "48px"
  nav-link-active:
    textColor: "{colors.on-board}"
  badge-queued:
    backgroundColor: "{colors.st-queued-tint}"
    textColor: "{colors.st-queued}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px 4px 8px"
  badge-preparing:
    backgroundColor: "{colors.st-preparing-tint}"
    textColor: "{colors.st-preparing}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px 4px 8px"
  badge-ready:
    backgroundColor: "{colors.st-ready-solid}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px 4px 8px"
  badge-completed:
    backgroundColor: "{colors.st-done-tint}"
    textColor: "{colors.st-done}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px 4px 8px"
  badge-cancelled:
    backgroundColor: "{colors.st-cancelled-tint}"
    textColor: "{colors.st-cancelled}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px 4px 8px"
  plate-sm:
    backgroundColor: "{colors.board}"
    textColor: "{colors.sign}"
    typography: "{typography.numeral-sm}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    width: "52px"
    height: "52px"
  plate-md:
    backgroundColor: "{colors.board}"
    textColor: "{colors.sign}"
    typography: "{typography.numeral-md}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    width: "64px"
    height: "56px"
  plate-kds:
    backgroundColor: "{colors.board}"
    textColor: "{colors.sign}"
    typography: "{typography.numeral-kds}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    width: "84px"
    height: "76px"
  plate-lg:
    backgroundColor: "{colors.board}"
    textColor: "{colors.sign}"
    typography: "{typography.display}"
    rounded: "{rounded.md}"
    padding: "16px 24px 24px"
    width: "160px"
  plate-on-board:
    backgroundColor: "{colors.board-raised}"
    textColor: "{colors.sign}"
  menu-section-sign:
    backgroundColor: "{colors.board}"
    textColor: "{colors.sign}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  dish-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "16px"
  ticket:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  ticket-pending:
    backgroundColor: "{colors.board-raised}"
    textColor: "{colors.on-board}"
  ticket-age:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  ticket-age-warn:
    backgroundColor: "{colors.warn-tint}"
    textColor: "{colors.warn}"
  ticket-age-late:
    backgroundColor: "{colors.chili}"
    textColor: "{colors.surface}"
  ticket-note:
    backgroundColor: "{colors.warn-tint}"
    textColor: "{colors.warn}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  cart-bar:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    padding: "12px 16px"
  cart-bar-button:
    backgroundColor: "{colors.board-raised}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.md}"
    height: "52px"
  cart-bar-cta:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.on-sign}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  stepper:
    backgroundColor: "{colors.board-tint}"
    textColor: "{colors.board}"
    rounded: "{rounded.md}"
    height: "44px"
  switch-off:
    backgroundColor: "{colors.line-strong}"
    rounded: "{rounded.full}"
    width: "44px"
    height: "26px"
  switch-on:
    backgroundColor: "{colors.st-ready-solid}"
  route-dot-done:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.full}"
    size: "32px"
  route-dot-current:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.board}"
  route-dot-upcoming:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-faint}"
  alert-error:
    backgroundColor: "{colors.chili-tint}"
    textColor: "{colors.chili-hover}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  alert-warn:
    backgroundColor: "{colors.warn-tint}"
    textColor: "{colors.warn}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
    width: "440px"
  brand-mark:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.board}"
    rounded: "{rounded.sm}"
    size: "32px"
---

# Design System: ครัวคลาวด์

Source of truth: every token above is a custom property on `:root` in `src/index.css` (`--board`, `--fs-lg`, `--r-md`, `--space-4`, ...). Fonts are self-hosted in `src/main.jsx`; queue/status logic lives in `src/constants.js`. Use the custom properties in new CSS; never re-type a hex.

## Overview

**Creative North Star: "The Wall Menu Board"**

ครัวคลาวด์ looks like the painted menu board and queue call-board on the wall of a Thai eatery, carried onto the diner's phone and the kitchen tablet. The shell is deep board green; the numbers that matter (queue numbers, totals, counts) are sign yellow painted on that green; the places where people read and choose are plain white sheets on a cool off-white ground. It is a tool for ordering and for cooking, so density is moderate to high and everything reads at a glance: dish rows instead of photo cards, tickets instead of dashboards.

The kitchen is the same board turned all the way up. The whole page goes green, orders are white tickets pinned to it, and queue numbers sit on 76px plates that read from two metres away. Colour carries meaning sparingly: green and yellow are the brand and the "you are here" marks, chili red means stop (sold out, cancel, late), and status colours always travel with an icon and a Thai label.

Confirmed rejections from the approved direction: the orange photo-card delivery-app clone, the dark neon "cloud" dashboard, cream or warm-paper grounds, gradients, and emoji icons.

**Key Characteristics:**
- Board green shell and sign-yellow numerals; white working surfaces on a cool off-white ground.
- One signature: the call-board plate (ป้ายเรียกคิว). Every queue number sits on it.
- Flat and hairlined; a shadow appears only on a layer that floats over the page.
- Small sign-like corners: 6px for small signs, 10px for controls and containers.
- Two Thai faces: Anuphan for voice and numbers, IBM Plex Sans Thai Looped for reading.
- Thai-first copy, 44px touch targets, WCAG AA contrast on every text pairing.

## Colors

A two-colour signage palette (board green, sign yellow) over cool neutrals, with one alarm colour and a muted, icon-paired status set.

### Primary
- **Board Green** (#163c2d): the app bar, the kitchen page ground, primary buttons, call-board plates, menu section signs, the active category tab, the done route stops, links, focus rings, `accent-color` and `theme-color`. White on it is 12.2:1.
- **Raised Board** (#1e4a39): one step up from the board. Hover on primary buttons, the phone cart bar button, the kitchen segmented tabs track, pending kitchen tickets, kitchen tool buttons, nav count chips, and plates that sit on the board ground.
- **Board Seam** (#2f5b48): hairlines drawn on the board: the 1px inset edge on every plate, the staff nav divider, kitchen column-head underline, kitchen tool button borders and hover.
- **Chalk White** (#f2f5f0): text and icons on board green (11.1:1).
- **Faded Chalk** (#a8c3b4): secondary text on the board (inactive nav links, kitchen meta lines, plate labels, the demo tag). 6.5:1 on board, 5.3:1 on raised board.
- **Board Wash** (#e2ede6) and **Board Wash Pressed** (#d2e4d8): light green fills for the quantity stepper, the "เพิ่ม" add button, dish thumbnail placeholders, and the input focus ring.

### Secondary
- **Sign Yellow** (#f7c834): the painted numerals and the "you are here" mark. Plate numerals, the active nav underline, the selected kitchen tab, the current route stop, the active category count, the cart bar total and its "ดูตะกร้า" button, the brand mark, text selection, and focus rings inside `.on-board`. 7.7:1 on board green.
- **Lit Sign Yellow** (#ffd75a): hover state for the sign-filled button variant (`.btn-sign`).
- **Sign Ink** (#15231c): text on a sign-yellow fill (10.3:1).

### Tertiary
- **Chili Red** (#b3301b): the stop colour. Sold-out labels ("หมดแล้ว"), destructive buttons, quiet cancel links, and late kitchen timers. **Chili Pressed** (#962713) is its hover and the text colour of error alerts; **Chili Wash** (#fbe8e4) fills error alerts and quiet-danger hover.

### Status (always icon + Thai label)
| Status | Thai label | Icon (Lucide) | Badge |
|---|---|---|---|
| PENDING | กำลังส่งเข้าคิว | Send | Slate (#3d4e60) on Slate Wash (#e7ecf1), shared with QUEUED |
| QUEUED | รอคิว | Clock | Slate on Slate Wash |
| PREPARING | กำลังทำ | Flame | Order Blue (#164c8c) on Blue Wash (#e1ebf7) |
| READY | พร้อมเสิร์ฟ | Check | White on solid Leaf Green (#1c7438), the only solid badge |
| COMPLETED | เสิร์ฟแล้ว | CheckCheck | Spent Grey (#4f5d55) on Grey Wash (#eceeec) |
| CANCELLED | ยกเลิกแล้ว | Ban | Plum (#82184f) on Plum Wash (#f8e5ee) |

**Deep Leaf** (#145c2c) on **Leaf Wash** (#dcf1e1) is the "served" banner on the tracking page; Plum on Plum Wash is the cancelled banner. **Warning Amber** (#6b4a00) on **Amber Wash** (#fcefc4) marks warn-level kitchen timers, the diner's note on a ticket, and connection warnings. All status pairs measure 5.8:1 to 8.0:1.

### Neutral
- **Cool Ground** (#f3f5f2): page background on customer and admin pages. Cool grey-green, never cream.
- **Sheet White** (#ffffff): working surfaces (dish sheet, cart panel, panels, tickets, dialogs, inputs), and the text colour on chili and leaf-green fills.
- **Sunk Counter** (#eaeeea): hover for secondary and quiet buttons, the neutral kitchen timer, skeleton loaders.
- **Hairline** (#d3dbd5): every divider and container border on light surfaces, the bottom-sheet grab handle, the unfinished route connector.
- **Strong Hairline** (#8a968f): borders of interactive controls (buttons, inputs, category tabs; 3.1:1 against white), the switch track when off, empty-state icons.
- **Board Ink** (#15231c): body text, a green-black (14.9:1 on ground).
- **Muted Ink** (#4f5d55): secondary text (6.3:1 on ground).
- **Faint Ink** (#66736b): placeholders, upcoming route numerals, chevrons. 4.5:1 on ground, 5.0:1 on white; do not go lighter.

### Named Rules
**The Board-and-Sign Rule.** Sign yellow lives on board green, or as a fill carrying Sign Ink. Yellow text on white or on the ground measures 1.4–1.6:1 and is never used.

**The Chili-Means-Stop Rule.** Chili red is reserved for sold out, cancel/destructive actions, errors, and late kitchen tickets. It is never decoration and never a brand accent.

**The Never-Colour-Alone Rule.** Every status colour travels with its Lucide icon and its Thai label (`StatusBadge`, kitchen timers, banners). A colour swatch on its own is not a status.

## Typography

**Display Font:** Anuphan (self-hosted variable, `@fontsource-variable/anuphan`, with IBM Plex Sans Thai Looped and system-ui fallback)
**Body Font:** IBM Plex Sans Thai Looped (self-hosted `@fontsource`, Thai + Latin subsets at 400/500/600, with Anuphan and system-ui fallback)

**Character:** Anuphan is a bold, loopless Thai sans that reads like sign-writing; it carries headings, buttons, labels, prices, and every numeral. Plex Thai Looped is a calm looped face for reading: dish notes, hints, receipts, and the kitchen's item lines.

### Hierarchy
- **Display** (Anuphan 700, clamp(4rem, 3rem + 5vw, 6rem), line-height 1, -0.02em, tabular): the queue number on the large plate (tracking hero, ready popup). Nothing else uses this size.
- **Plate numerals** (Anuphan 700, line-height 1, tabular): 3rem on kitchen tickets, 2rem in my-orders rows, 1.5rem for small plates and kitchen column counts.
- **Headline** (Anuphan 700, clamp(1.625rem, 1.3rem + 1.2vw, 2.125rem), 1.3): one `h1` per page ("เมนูวันนี้", "หน้าจอครัว", tracking headline). `text-wrap: balance`.
- **Ticket table** (Anuphan 700, 1.75rem, 1.2): "โต๊ะ 12" on kitchen tickets, the second thing a cook reads after the number.
- **Title** (Anuphan 700, 1.375rem, 1.3): `h2` such as dialog titles and kitchen column heads.
- **Title small** (Anuphan 600, 1.125rem, 1.35): `h3` and dish names; also cart and empty-state titles.
- **Price** (Anuphan 700, 1.125rem, tabular, Board Green): dish prices, formatted `฿60` via `formatPrice`.
- **Button** (Anuphan 600, 1rem, 1.2); large buttons step up to 1.125rem.
- **Label** (Anuphan 600, 0.875rem, 1.3): status badges, field labels (at 0.9375rem), nav counts, table-head cells.
- **Kitchen line** (Plex Thai Looped 400, 1.25rem, 1.45): ordered items on tickets, quantities prefixed in Anuphan 700 ("2×").
- **Body** (Plex Thai Looped 400, 1rem, 1.65): default text, root line-height.
- **Body small** (Plex Thai Looped 400, 0.9375rem, 1.55): dish descriptions, alerts, tracking meta.
- **Caption** (Plex Thai Looped 400, 0.875rem, 1.5): hints, meta lines, footers. This is the floor.

### Named Rules
**The Two-Voice Rule.** Anuphan speaks (headings, buttons, labels, numbers); Plex Thai Looped reads (sentences). Weight 700 belongs to Anuphan only; Plex is loaded at 400/500/600 and must not be set bold.

**The Tabular Numeral Rule.** Every number that changes (queue numbers, prices, totals, counts, quantities, times, minutes) is set in Anuphan with `tabular-nums`. Use the `.num` utility for numbers inside body text.

**The 14px Floor Rule.** No Thai text below 0.875rem (14px). Thai tone marks and vowels stack; smaller sizes break legibility.

## Layout

A single centred container (max 1240px, 16px side gutter, 24px top and 48px bottom page padding) with narrow 760px pages for lists (my orders, not found). The spacing rhythm is a 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48. Touch targets are 44px minimum everywhere (`--tap`), 52px for large buttons and the phone cart bar.

- **Menu:** a sticky category tab bar (top 0, on the ground with a bottom hairline; the last tab peeks to show it scrolls), then category sections. Each section is a sign heading over one white sheet of dish rows separated by 1px hairlines, never a grid of floating cards. Dish rows without a photo put name, note, and price on the left and the add button or stepper on the right; with a photo an 88px square thumbnail leads.
- **Cart:** a sticky 360px panel to the right of the dish list on wide screens; on phones and tablets a fixed green cart bar at the bottom opens a bottom sheet (max height min(88dvh, 760px)).
- **Tracking:** a main panel (plate, status, headline, four-stop route) plus a 340px receipt panel.
- **Kitchen:** green page, three columns (คิวใหม่ / กำลังทำ / รอเสิร์ฟ), oldest first; on narrow screens one column with segmented tabs.
- **Admin:** one white list that becomes a six-column table on wide screens.

Density target for the phone menu: at least four dish rows visible above the cart bar at 390px wide. The shipped build shows about 3.6; this is an open item from the finish review.

### Breakpoints
| Width | What changes |
|---|---|
| ≤480px | My-orders rows: the status badge drops under the items, the chevron hides. |
| 600px | Tracking hero: plate beside the text from 600px up; below, the large plate becomes a full-width horizontal strip (label left, number right). Dialogs centre from 600px up; below they anchor to the bottom. |
| 720px | Dish list goes to two columns; a single-dish section keeps half width (`is-single`). |
| 840px | App bar becomes one row with nav on the right and 64px nav links. Below 840px, customer pages hide the nav and show a compact "ออเดอร์" shortcut with a sign-yellow count. Admin list becomes a table. |
| 900px | Tracking goes two-column; kitchen shows three columns and hides the segmented tabs. |
| 1024px | Menu gets the sticky cart panel; below 1024px it uses the cart bar and bottom sheet. |
| 1024–1179px | Dish list returns to one column beside the cart panel. |
| 1180px | Dish list is two columns again. |
| 900–1199px | Kitchen ticket header stacks the timer under the table number; from 1200px it sits on the right. |

Layering order: sticky category bar 5, cart bar 30, sheet scrim 39, bottom sheet 40, dialogs 60. Safe-area insets are respected on the app bar, cart bar, bottom sheet, and dialogs; `scroll-padding-bottom: 96px` keeps focused fields clear of the cart bar.

## Elevation & Depth

Flat by default. Surfaces separate by tone (board green against white, white against the cool ground) and by 1px hairlines. Shadows exist only for layers that float above the page, plus a few functional insets.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 8px 24px -6px rgb(21 35 28 / 22%), 0 2px 6px rgb(21 35 28 / 10%)`, `--shadow-float`): the phone bottom sheet and dialogs.
- **Cart bar lift** (`box-shadow: 0 -4px 16px rgb(21 35 28 / 18%)`): the fixed bottom cart bar, casting upward.
- **Plate edge** (`box-shadow: inset 0 0 0 1px var(--board-line)`): the painted edge on every call-board plate.
- **Dish divider** (`box-shadow: 0 0 0 1px var(--line)`): each dish row's outline, which fills the 1px grid gap to draw the sheet's dividers.
- **Input focus ring** (`box-shadow: 0 0 0 3px var(--board-tint-hover)`): with a Board Green border.
- **Shortcut active mark** (`box-shadow: inset 0 -3px 0 var(--sign)`): the active "ออเดอร์" shortcut on phones.
- **Switch thumb** (`box-shadow: 0 1px 2px rgb(0 0 0 / 25%)`).
- **Scrims:** Board Ink at 45% behind the bottom sheet, 55% behind dialogs.

### Named Rules
**The Hairline Rule.** Cards, panels, tickets, and dish sheets are flat at rest with a 1px hairline (or a tone change on the board). A shadow means "this layer floats over the page"; nothing else earns one.

## Shapes

Small, sign-like corners and straight edges. Corners are 6px (`--r-sm`) for small signs: category tabs, status badges, nav count chips, the brand mark, the demo tag, kitchen timers, ticket notes, the menu section sign, the cart bar CTA, the kitchen segmented tabs. Corners are 10px (`--r-md`, `--r-lg`, currently the same value) for controls and containers: buttons, inputs, the stepper, plates, panels, dish sheets, tickets, dialogs, alerts, thumbnails. The bottom sheet rounds only its top corners. Circles are used only where the object is round in life: route stop dots (32px) and the switch thumb; the switch track is a full pill.

Borders are 1px; 2px for the route connector, the route dots, and the kitchen column underline; 3px for the active nav underline (rounded top). Dish thumbnails are square with `object-fit: cover` (88px menu, 64px/56px admin, 104px image picker); without a photo the square fills with Board Wash and a 32px Lucide category icon in Board Green. The favicon is the same mark: a board-green rounded square holding a sign-yellow square with a board-green bowl.

## Components

### Buttons
Painted, solid, and direct. All share `.btn`: 44px minimum height, 0 16px padding, 10px corners, Anuphan 600 at 1rem, 1px border, 160ms colour transitions on `--ease-out`. Disabled is 55% opacity with `not-allowed`.
- **Primary** (`.btn-primary`): Board Green with Chalk White text; hover Raised Board. The one action per area: "ยืนยันการสั่ง · ฿155", kitchen "เริ่มทำ" / "อาหารพร้อม" / "เสิร์ฟแล้ว", "รับทราบ".
- **Sign** (`.btn-sign`): Sign Yellow with Sign Ink; hover Lit Sign Yellow. Defined for actions sitting on the board but not used by any screen yet; the cart bar's "ดูตะกร้า" chip carries the same fill.
- **Secondary** (`.btn`): white with a Strong Hairline border; hover Sunk Counter. The safe choice in dialogs ("ไม่ยกเลิก").
- **Tint** (`.btn-tint`): Board Wash with Board Green text; the menu's "+ เพิ่ม" and the tracking page's "แจ้งเตือนเมื่ออาหารพร้อม".
- **Quiet** (`.btn-quiet`): transparent, Muted Ink; hover Sunk Counter. Icon-only close buttons use `.btn-icon` (44×44).
- **Danger** (`.btn-danger`): Chili with white; confirmation of a cancel only. **Quiet danger** (`.btn-danger-quiet`): Chili text, Chili Wash hover; the first-step "ยกเลิกออเดอร์" link.
- **Board** (`.btn-board`): Raised Board with a Board Seam border on the kitchen page; `aria-pressed="true"` turns the border Sign Yellow (sound toggle).
- **Large** (`.btn-lg`): 52px, 1.125rem. Kitchen ticket actions and the order submit are large and full width (`.btn-block`).
- **Focus:** a 2px Board Green outline at 2px offset; inside `.on-board` regions the outline is Sign Yellow.

### Chips
- **Category tabs:** white, 1px Strong Hairline, 6px corners, 44px tall, Anuphan 500 with a muted tabular count. Hover turns the border Board Green. Selected (`aria-pressed="true"`) fills Board Green with Chalk White text and a Sign Yellow count.
- **Status badges** (`StatusBadge`): 6px corners, 4px 10px 4px 8px padding, Anuphan 600 at 0.875rem, a 15px Lucide icon (stroke 2.25) before the Thai label. Colours per the status table in Colors.
- **Kitchen segmented tabs** (below 900px): a Raised Board track with 4px padding; tabs are 44px, Faded Chalk text; the selected tab fills Sign Yellow with Sign Ink. Each shows a tabular count.

### Cards / Containers
- **Panel:** white, 1px Hairline, 10px corners, 24px padding. Tracking main and receipt.
- **Dish sheet:** one white list with a 1px Hairline border and 10px corners; rows are divided by 1px hairlines, 16px padding (12px block padding without a thumbnail). Sold-out rows grey the thumbnail (grayscale, 55% opacity), mute name and price, and replace the add button with a Chili "หมดแล้ว" label with a Ban icon.
- **Order list / admin list:** the same white hairlined sheet with rows divided by hairlines; order rows hover to Cool Ground.
- **Shadow strategy:** none at rest (see Elevation & Depth).

### Inputs / Fields
- **Style:** white, 1px Strong Hairline, 10px corners, 44px minimum height, 10px 12px padding, body text at 1rem. Placeholders in Faint Ink ("เช่น 5", "เช่น ไม่เผ็ด ไม่ใส่ผักชี"). Textareas resize vertically from 72px.
- **Hover:** border goes Muted Ink. **Focus:** border Board Green plus a 3px Board Wash Pressed ring, no outline.
- **Labels:** Anuphan 600 at 0.9375rem above the field; optional fields show "ไม่บังคับ" right-aligned in Muted Ink 400. Hints are 0.875rem Muted Ink below. Table number and name share a row (7.5rem / 1fr).
- **Errors:** an alert block above the submit button (Chili Wash, Chili Pressed text, CircleAlert icon); warnings in Amber Wash.
- **Switch** (`role="switch"`): 44×26 track, Strong Hairline when off, Leaf Green when on, white 20px thumb sliding 18px over 200ms. Used for availability in admin.
- **Quantity stepper:** a Board Wash pill-less group (10px corners) with 44px minus/plus buttons and a tabular Anuphan 700 count. At quantity 1 the minus becomes a Trash icon labelled "เอาออกจากตะกร้า".

### Navigation
- **App bar:** Board Green band, 1240px inner container. Brand: a 32px Sign Yellow brand mark (6px corners) holding a Board Green CookingPot icon, then "ครัวคลาวด์" in Anuphan 700 at 1.375rem. In demo mode a quiet "โหมดทดลอง" tag follows: 1px Faded Chalk outline, Faded Chalk text, 6px corners, with a tooltip explaining it.
- **Links:** Faded Chalk, Anuphan 500, an 18px Lucide icon before the label, 48px tall (64px from 840px). Hover Chalk White. Active: Chalk White 600 with a 3px Sign Yellow bar along the bottom (rounded top, inset 12px from each side). A Raised Board count chip shows the number of my orders.
- **Staff links** ("ครัว", "จัดการเมนู") appear only on staff routes, after a 1px Board Seam divider. Customer pages expose them only in the footer ("สำหรับพนักงาน:").
- **Phone (below 840px):** customer pages hide the link row and show one "ออเดอร์" shortcut (Raised Board, 10px corners, Sign Yellow count; active state gets a 3px Sign Yellow inset underline). Staff pages keep a horizontally scrolling link row.

### Call-Board Plate (signature)
The ป้ายเรียกคิว: a Board Green plate with a 1px Board Seam inset edge, 10px corners, and the queue number in Sign Yellow Anuphan 700, tabular, line-height 1. Render it only through `QueuePlate` (`src/components/QueuePlate.jsx`).
- **sm** (52×52 minimum, 1.5rem): kitchen column counts. On the green kitchen page, plates that sit directly on the board use Raised Board so they still read as plates.
- **md** (64 wide × 56, 2rem): my-orders rows.
- **kds** (84 wide × 76, 3rem): kitchen tickets, spanning the two header lines.
- **lg** (160px minimum width, 16px 24px 24px padding): a Faded Chalk label ("คิวของคุณ", or "คิว" in the ready popup) above the display numeral. Under 600px in the tracking hero it stretches to a horizontal strip.
- **Empty:** before a number is assigned the plate shows "–" in Faded Chalk, with an accessible label "ยังไม่ได้เลขคิว".
- **Motion:** in the ready popup the plate scales in from 0.85 over 700ms (`plate-call`).
- **Sibling sign:** menu section headings are painted the same way: Board Green, Sign Yellow text, 6px corners, 4px 12px padding, 1.125rem Anuphan 700. They are the heading itself, not a label above one.

### Kitchen Ticket
A white slip pinned to the green board (10px corners, 16px padding, 12px internal gap). Header: kds plate, then the table ("โต๊ะ 12", or "ไม่ระบุโต๊ะ") over "name · สั่ง 19:51", then the waiting timer. Items follow under a hairline in the kitchen line style; the diner's note sits in an Amber Wash box with a MessageSquareText icon. Actions: one large full-width primary button per state (QUEUED → "เริ่มทำ" with Flame, PREPARING → "อาหารพร้อม" with BellRing, READY → "เสิร์ฟแล้ว" with Check). Cancel is only offered on QUEUED: a quiet-danger "ยกเลิกออเดอร์" expands inline to "ไม่ยกเลิก" + a Chili "ยืนยันยกเลิกคิว N" that expires after 5 seconds. PENDING tickets are Raised Board with Chalk White text, no timer, and a spinning LoaderCircle "กำลังรับเข้าคิว…".

**Waiting timer and ageing thresholds** (`src/constants.js`, refreshed every 30 s):
| Ticket | Clock starts | Normal | Warn | Late |
|---|---|---|---|---|
| QUEUED / PREPARING | when ordered | under 10 min | 10 min and over | 15 min and over |
| READY | when marked ready | under 3 min | 3 min and over | 5 min and over |

- **Normal:** Sunk Counter fill, Board Ink, Clock icon, "7 นาที".
- **Warn:** Amber Wash fill, Warning Amber text with a 1px outline in the same colour, Hourglass icon.
- **Late:** Chili fill, white text, TriangleAlert icon, plus visually hidden "เกินเวลา".
- READY timers read "พร้อมมา 4 นาที". All timers are Anuphan 700, tabular, 6px 10px padding, 6px corners.

### Cart Bar and Bottom Sheet (below 1024px)
A fixed Board Green bar at the bottom (12px 16px padding plus safe area, upward lift shadow). Inside, one 52px Raised Board button: a ShoppingBag icon, "3 รายการ" over the total in Sign Yellow tabular Anuphan 700, and a Sign Yellow "ดูตะกร้า" chip (40px, 6px corners) with a ChevronUp. It opens the cart as a bottom sheet: white, top corners 10px, Float shadow, a 40×4 Hairline grab handle, sliding up over 320ms on `--ease-out` behind a 45% scrim. From 1024px the same cart is a sticky white panel with no close button.

### Order Route (tracking)
A four-stop vertical route (`ROUTE_STOPS`: เข้าคิวแล้ว → กำลังทำ → พร้อมเสิร์ฟ → เสิร์ฟแล้ว), max 560px wide. Dots are 32px circles with a 2px border: done stops fill Board Green with a white check, the current stop fills Sign Yellow with a Board Green border and number and pops in (scale 0.6 to 1 over 600ms), upcoming stops are white with a Strong Hairline border and a Faint Ink number. The 2px connector is Hairline, turning Board Green once passed. Each stop has a Thai sub-line and a tabular time on the right.

### Dialogs
White, 10px corners, 24px padding, Float shadow, 440px wide (560px for the admin editor), sliding up 12px and fading in over 260ms. The safe choice is focused first and on the left; Escape and backdrop click cancel. Actions are right-aligned and wrap in reverse on narrow screens. The ready popup is centred: a 28px BellRing icon, "อาหารพร้อมแล้ว", the large plate labelled "คิว", "พนักงานกำลังนำอาหารไปเสิร์ฟที่โต๊ะ N", and a full-width large "รับทราบ".

### Feedback
- **Alerts:** 10px corners, 12px 16px padding, 0.9375rem text, an 18px icon. Error: Chili Wash with Chili Pressed text. Warning: Amber Wash with Warning Amber text.
- **Empty states:** centred, 48px block padding, a Strong Hairline Lucide icon, an Anuphan 1.125rem title in Board Ink, Muted Ink body, and the next step as a primary button (plus a secondary one where there are two ways out).
- **Skeletons:** Sunk Counter blocks with 10px corners pulsing between 100% and 45% opacity over 1.2 s.

### Motion
One easing curve, `--ease-out` (cubic-bezier(0.16, 1, 0.3, 1)). Colour and border changes 160ms; switch 200ms; scrim fade 240ms; dialog entry 260ms; bottom sheet 320ms; route stop arrival 600ms; plate call 700ms; spinners 900ms linear. Under `prefers-reduced-motion: reduce` every animation and transition collapses to 1ms.

### Icons
Lucide (`lucide-react`) only, drawn strokes at default stroke 2 (2.25 for status badges and the brand mark), 14–22px in the UI and 28–32px in popups and placeholders, always `aria-hidden` next to a visible or `aria-label` text. The "×" in quantities and "–" on an empty plate are typography, not icons.

## Do's and Don'ts

### Do:
- **Do** render every queue number through `QueuePlate`: Sign Yellow (#f7c834) Anuphan numerals on a Board Green (#163c2d) plate with the 1px Board Seam inset edge.
- **Do** pair every status colour with its Lucide icon and Thai label exactly as in the status table (`StatusBadge`, `STATUS_LABEL`).
- **Do** use the custom properties from `src/index.css` (`var(--board)`, `var(--r-md)`, `var(--space-4)`) in new CSS instead of literal values.
- **Do** set prices, counts, quantities, times, and queue numbers in Anuphan with `tabular-nums` (`.num`).
- **Do** keep every touch target at least 44px (`--tap`) and kitchen ticket actions at 52px, full width.
- **Do** separate content with 1px Hairline (#d3dbd5) borders and tone changes; reserve `--shadow-float` for the bottom sheet and dialogs.
- **Do** mark "you are here" with Sign Yellow on the board: the active nav underline, the selected kitchen tab, the current route stop, the active category count.
- **Do** keep the kitchen ageing thresholds in `src/constants.js` (10/15 min cooking, 3/5 min ready) and express each level with fill, icon, and text together.
- **Do** keep demo mode visually identical to production apart from the quiet "โหมดทดลอง" tag.
- **Do** keep Thai copy in dine-in wording: staff bring food to the table ("พนักงานกำลังนำไปที่โต๊ะ").

### Don't:
- **Don't** put Sign Yellow text on white or on the Cool Ground (1.4–1.6:1); yellow appears only on board green or as a fill under Sign Ink.
- **Don't** use Chili Red for anything except sold out, cancel/destructive actions, errors, and late timers.
- **Don't** show a status by colour alone, or invent a new status colour outside the slate / blue / leaf / grey / plum set.
- **Don't** use a cream or warm-paper ground; the ground is Cool Ground (#f3f5f2).
- **Don't** add gradients, glows, or soft drop shadows to cards, panels, tickets, or dish rows.
- **Don't** build the menu as orange-accented photo cards, or turn the kitchen into a dark neon dashboard.
- **Don't** round rectangles beyond 10px; circles are only for route dots and the switch.
- **Don't** introduce a third typeface, a system display face, or bold (700) Plex Thai Looped.
- **Don't** set Thai text below 0.875rem (14px).
- **Don't** use emoji or Unicode symbols as icons; use Lucide.
- **Don't** add kicker or eyebrow labels above headings; in this world the heading is itself the sign.
