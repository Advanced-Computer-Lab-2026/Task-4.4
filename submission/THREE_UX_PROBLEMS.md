# The Three Original UX Problems (TA demonstration guide)

These are usability problems in the original design, not code bugs. Bugs found while testing are listed separately in `TESTING_REPORT.md`.

To reset before a demo, click **Reset demo data**, then **Yes, reset**.

---

## Problem 1 — Finding a match for a lost item is unreliable

**User goal:** I lost something and want to find the found report that matches it.

**What was wrong:** search only matched the exact typed phrase in title, location and description. It did not search category or collection point. Nothing linked a lost report to a found one.
- "blue water bottle" returned 0 results, although "Blue sports bottle" and "Metal water bottle" exist.
- "security desk" and "electronics" returned 0.
- "black backpack" never surfaced the real match, "Dark backpack".
(Proof: `evidence/before-observations.txt`, `screenshots/before/02` and `03`.)

**Why it was confusing:** a student who words the item differently from the finder gets "nothing" and concludes it hasn't been found. The user does the matching in their head across three columns.

**What I changed:**
- Search now matches all words in any order, and also covers category and collection point.
- A "Similar reports" section shows near-misses when a multi-word search finds fewer exact results. Colour words are ignored because people say "black" and "dark" for the same bag.
- Lost reports with a likely found counterpart show a "possible match" button and a banner. It opens a side-by-side comparison with shared details and a next step. The text says it is a suggestion, not confirmation.

**Alternatives considered:**

| Option | Verdict |
|---|---|
| Match any word, ranked | Rejected. Measured: "black backpack" returned 5 results including a calculator and a USB drive. |
| Strict all-words search only | Fixes word order but still hides "Dark backpack". |
| **All-words search + similar tier + compare view (chosen)** | Precise main list, near-misses visible, lost↔found link explicit. |

**TA demo:**
1. Type `blue water bottle`. Two results appear (the original gave none).
2. Type `black backpack`. One result, plus "Dark backpack" under "Similar reports".
3. Clear the search. Click **Compare** in the blue banner at the top. Show the side-by-side view, the shared words and the "Next step".
4. Click **Compare** on "Wireless earbuds". Show that the next step says not to go to a desk, because that found item is not confirmed anywhere.

---

## Problem 2 — Reporting an item gives vague feedback and hides what happens next

**User goal:** I found (or lost) an item and want to report it correctly, and know what to do afterwards.

**What was wrong:**
- Every failure showed the same message, "Please review your entries.". An invalid title and a duplicate looked identical, no field was marked, and focus stayed on the button. (`before/06`, `07`)
- The form never said that posting a found report does not hand the item in.
- Posting a report while a filter was active could hide the new card, with only "Your report has been posted." shown. (`before/08`)

**Why it was confusing:** the finder can't tell which field to fix, may think posting the report is the same as handing the item in, and may think the post failed because they can't see it.

**What I changed:**
- Each problem shows next to its field with a clear message. Focus moves to the first problem.
- Duplicate errors include a "View the existing report" link.
- Status is chosen from three explained cards ("I lost this item", "I found this item", "It has been claimed"). Labels adapt, for example "Where did you find it?".
- Found reports show a warning: posting is not a handover, take it to one of the named collection points.
- After saving, filters clear, the new card is highlighted ("Just saved"), and a message gives the next step. New found reports show "Not confirmed at a collection point".
- Validation rules are unchanged: title of at least 2 characters, category and status required, same title and location rejected.

**Alternatives considered:**

| Option | Verdict |
|---|---|
| Improve the single banner wording | Still not tied to fields. |
| Multi-step wizard | Too heavy for five fields. |
| **Inline field errors + guidance + visible confirmation (chosen)** | Fixes each failure point. |

**TA demo:**
1. Click **Report a found item**. Point out the amber "not the same as handing the item in" warning.
2. Click **Post found report** with nothing filled in. Three specific errors appear and focus goes to the first.
3. Enter title `a`, pick a category, submit. Only the title error shows.
4. Choose "I lost this item", enter `Black backpack`, category Accessories, location `Library - second floor`. Submit. The duplicate error appears, with the link.
5. Use a valid title instead and post. Show the highlighted card, the "Next step" message and "Not confirmed at a collection point".

---

## Problem 3 — The board is hard to scan, and custody can be misread

**User goal:** see at a glance what is lost, found or claimed, and whether a found item is really at a collection point.

**What was wrong:**
- Three side-by-side columns on a sticky-note board. Under a "Found" filter, the Lost and Claimed columns said "Nothing here yet", which looks like an empty system. (`before/04`)
- Status showed only by column position and a pastel icon.
- Text such as category labels, descriptions and locations failed contrast (2.28:1 to 4.06:1; `evidence/contrast-results.txt`).
- Custody was a faint 10px line, so "reported" and "received" looked alike.
- On a 390px phone, the first Found card was 2480px down. (`before/11b`)
- The "Apply" button only printed a stale message. Edit rights were hidden in a "···" menu that didn't close on Escape or outside click.

**Why it was confusing:** the user must scan three columns, read tiny low-contrast text, and guess whether an item is in staff hands.

**What I changed:**
- One list of cards, newest first. Each card has a coloured Lost, Found or Claimed pill with an icon and a word, so colour is never the only signal.
- Status tabs with live counts replace the dropdown and the Apply button, and the heading says what is shown (for example "6 found reports").
- A custody strip on found and claimed items. It says "Received at X" only when the data has `received` plus a collection point. Otherwise: "Not confirmed at a collection point". A "How a found item gets back to its owner" panel explains the three stages.
- "Your report" tag and a visible **Edit** button on your own cards only. Other cards say "Reported by another student".
- Text meets 4.5:1 contrast, at least 13px, controls at least 40px high. Mobile is a single column, and the first Found card is at 669px.

**Alternatives considered:**

| Option | Verdict |
|---|---|
| Recolour and enlarge the existing columns | Mobile length and empty columns remain. |
| Tabs that hide other statuses | Hides lost↔found context. |
| **One card list + status pills + tabs + custody strip (chosen)** | Fixes scanning, contrast, mobile length and custody clarity together. |

**TA demo:**
1. On the main board, point out the red Lost, green Found and purple Claimed pills.
2. Click the **Found** tab. Only found reports show, with a count, and no "Nothing here yet" columns.
3. Point at "Received at Campus Security Desk" (Dark backpack) beside "Not confirmed at a collection point" (USB flash drive). Explain that the app only says an item is at a desk when the data confirms it.
4. Tick **Your reports only**. Show Edit buttons on your three reports only.
5. Resize the browser to phone width (or use the device toolbar) to show the single-column layout.

---

## The AI suggestion that was refined

**Suggested:** make search match any word and rank by number of hits, so "black backpack" finds more.

**Problem:** I tested it on the real records before building it. "black backpack" returned 5 results: Black backpack, Dark backpack, Scientific calculator, Calculator and USB flash drive. "blue bottle" also pulled in both earbuds reports. Most results were noise, so a student would have to read past unrelated items.

**What I did:** rejected any-word matching as the main search. I kept strict all-words matching for the main list and added a separate "Similar reports" section based on non-colour keywords. "black backpack" now gives 1 result and one similar report (Dark backpack), with no calculators. This is covered by unit tests.

**Why it is better:** the main list stays trustworthy, and the near-miss is still found. It was decided from measured results rather than assumed.

Also rejected: a "Contact the finder" button. The project has no ownership-claim workflow, and the button would imply contact handling the data doesn't support.
