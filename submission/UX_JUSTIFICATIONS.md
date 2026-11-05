# UX Justifications — Campus Lost & Found

Evidence for the "before" claims comes from running the original app in headless Chrome (`screenshots/before/`). "After" claims come from the redesigned app (`screenshots/after/`, `evidence/`).

Personas: **A** lost an item and wants to find a matching report. **B** found an item and wants to report it.

## Problem 1 — Search is too literal, so a lost item's matching found report stays hidden (persona A)

**Goal:** find the found report that matches my lost item.

**What was wrong (verified):** search only matched the exact typed phrase in title, location and description. "blue water bottle" returned 0 results even though "Blue sports bottle" and "Metal water bottle" exist. "security desk" and "electronics" also returned 0 because collection point and category were not searched. "black backpack" never surfaced the real match, "Dark backpack". Nothing linked a lost report to a found one. (`before/02`, `03`)

| Option | Pros | Cons |
|---|---|---|
| A. Match any typed word, ranked | Finds more | Noisy: "black backpack" returned 5 results including a calculator and a USB drive (measured) |
| B. Match all words in any order, plus a separate "Similar reports" tier and a "possible match" compare view | Precise main results, near-misses still shown, lost↔found link made explicit | More code and UI |
| C. Leave search as is and add only a "Found" shortcut | Trivial | Does not fix the real problem |

**Chosen: B.** All-words search (any order, now also category and collection point). Colour words are excluded from similarity, because people say "black" vs "dark". Lost reports with a likely found counterpart get a "possible match" button that opens a side-by-side comparison with shared details and a next step. It is worded as a suggestion, never a confirmation.

## Problem 2 — Reporting gives vague errors and blurs "reported" with "handed in" (persona B)

**Goal:** report a found item correctly and know what to do next.

**What was wrong (verified):** an invalid title and a duplicate both gave the same message, "Please review your entries.", with no field marked and focus left on the button. (`before/06`, `07`) The form never said that posting a report does not hand the item in. After posting a found report while a "Lost" filter was active, the new card was hidden and the message was only "Your report has been posted."

| Option | Pros | Cons |
|---|---|---|
| A. Keep one banner but improve the wording | Small change | Still not tied to fields |
| B. Inline per-field errors, focus on the first problem, "view existing report" link on duplicates, status chosen as three explained cards, found-specific guidance, and a post-save message with next step | Directly fixes the failure points | Larger form rewrite |
| C. Multi-step wizard | Guided | Too heavy for five fields |

**Chosen: B.** Validation rules are unchanged (title ≥ 2 characters, required category and status, same title + location rejected). Only their presentation changed. Found reports show a warning that the form does not record a handover, and name the three collection points. After saving, filters clear and the new card is highlighted so it is visible.

## Problem 3 — The board is hard to scan, and statuses and custody are easy to misread (both personas)

**Goal:** tell at a glance what is lost, found or claimed, and where a found item really is.

**What was wrong (verified):** three side-by-side columns on a sticky-note board. Under a "Found" filter the Lost and Claimed columns showed "Nothing here yet", which reads as an empty system. The "Apply" button only printed a stale message. Status was shown only by column and a pastel icon. Several text colours failed contrast (2.28:1 to 4.06:1; see `evidence/contrast-results.txt`). The card menu didn't close on Escape or outside click. On a 390px phone the first Found card was 2480px down the page. Custody text was a faint 10px line. (`before/04`, `11b`)

| Option | Pros | Cons |
|---|---|---|
| A. Recolour and enlarge the existing columns | Low risk | Mobile length and empty columns remain |
| B. One list of cards with status pills (text and icon), status filter tabs with live counts, a custody strip per found item, "Edit" visible only on your own cards, and a "how it works" legend | Fixes scanning, mobile length, contrast, and misreading | Replaces the column layout |
| C. Tabs that hide the other statuses entirely | Simple | Hides the lost↔found context persona A needs |

**Chosen: B.** Lost, Found and Claimed each have their own colour family, icon and word, so colour is never the only signal. The custody strip shows "Received at X" only when `handoverStatus` is `received` and a collection point exists. Otherwise it shows "Not confirmed at a collection point". Claimed items without a release record say "Marked claimed by the reporter" instead of implying a handover. At 390px the first report is at 669px (was 989px) and the first Found report at 669px (was 2480px).

## One AI suggestion that was refined

**Suggestion:** make search match **any** word and rank by number of hits, so "black backpack" finds more.
**What I did:** measured it on the real records before building it. "black backpack" returned 5 results (Black backpack, Dark backpack, Scientific calculator, Calculator, USB flash drive), and "blue bottle" pulled in both earbuds reports. Most results were noise, so I rejected it as the main search.
**Refinement:** keep strict all-words search for the main list, and add a separate "Similar reports" section driven by non-colour keywords. "black backpack" now shows 1 result plus Dark backpack as similar, with no calculators. This is covered by unit tests.

Also rejected: a "Contact the finder" button. The brief says there is no ownership-claim workflow, and it would imply staff or contact handling that the data does not have.
