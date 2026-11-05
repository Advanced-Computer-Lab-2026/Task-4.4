# UI/UX Rescue Challenge — submission notes

Files changed: `src/App.jsx`, `src/styles.css`. Screenshots: `docs/screenshots/` (`before-*` / `after-*`).

## Scenario goals
1. A student who lost an item wants to find a matching found notice.
2. A student who found an item wants to report it and know what happens next.
3. Existing behaviour (create, edit own reports only, duplicate title + location rule, lost/found/claimed, localStorage, reset) stays intact.

## Problem 1 — Search misses obvious matches and gives no feedback
- **Observed:** searching `blue earbuds` returns 0 notices, although "Earbuds in blue case" and "Wireless earbuds … blue case" exist. Search matched the whole query as one exact phrase. The "Apply" button did nothing except print a count, since filtering was already live. A zero-result search showed three "Nothing here yet" columns. Header shortcuts ("Missing items") set a filter with no visible indicator.
- **Why it hurts:** the loser's main goal is finding a match; word order must not matter. A dead button and silent empty states make users doubt whether search works.
- **Fix:** every typed word must appear (any order, case/space-insensitive); "Apply" removed; "Showing N of M reports" live status; removable filter chips; "Clear filters"; a single empty state with Clear and Post-a-report actions; "Noticeboard" resets filters.

## Problem 2 — Form validation hides the real reason
- **Observed:** `validate()` produced specific messages ("An item with the same title has already been reported at this location.") but `submit()` discarded them and always showed "Please review your entries." with no field marked.
- **Why it hurts:** users cannot tell which field is wrong or why, especially for the duplicate rule, which is not obvious.
- **Fix:** all errors computed at once, shown inline under the field, invalid fields highlighted and `aria-invalid`/`aria-describedby` set, focus moved to the first invalid field, error clears when the field is edited. Rules themselves unchanged.

## Problem 3 — Handover process is unclear for finders and owners
- **Observed:** the form never says where a found item should go; found cards said only "Reported found - not confirmed at a collection point", with no next step. Editing was hidden behind a `···` menu, which for other students' cards held only a non-action ("Reported by another student"). Card text was 9–10 px at low contrast.
- **Why it hurts:** the scenario depends on collection points and ownership verification; finders do not know what to do, and owners cannot tell which notices are safe to travel for.
- **Fix:** Status-dependent guidance in the form (found: three collection points, notice stays "not confirmed" until staff confirm receipt, no personal details; lost: check Found first; claimed: use once collected). Found cards: received → "Staff verify ownership before the item is released"; unconfirmed → "Staff may not be holding it yet. Check with a collection point before making a trip." Items are never shown as confirmed unless they already were. Own reports get a visible "Your report" tag and "Edit report" button (still only own reports); card text raised to 11–12.5 px with darker colours; visible keyboard focus.

## Layout change — separate sections
Lost, Found and Claimed are now three stacked full-width sections, each with its own heading, count and card grid (previously three narrow side-by-side columns). A "Jump to" row (Lost (6) / Found (6) / Claimed (1)) scrolls to each section. Section headings are `h3` and card titles `h4`.

## Problem 4 — Unsaved form input is lost without warning
- **Observed:** "Go back", the breadcrumb, header links and "+ Post a report" all discarded a half-filled form silently.
- **Fix:** if the form differs from how it was opened, a "Discard your unsaved changes?" prompt appears (Keep editing / Discard changes) and receives focus. An untouched form still leaves freely.

## Problem 5 — Posted or edited report can be hidden or hard to find
- **Observed:** after posting, an active filter could hide the new report (it looked like the post failed), and with stacked sections the new card can be far down the page.
- **Fix:** saving clears filters, scrolls to the card and highlights it for 4 seconds.

## Smaller fixes
- "Reset demo data" now asks for confirmation (it silently wiped the user's reports).
- Category/status options capitalised consistently in filters and form (values unchanged).
- Required `*` no longer wraps onto its own line.

## AI design suggestion refined / rejected
- **Suggested:** rank partial matches (any word, scored) and add a "Possible matches" action on the user's own lost report.
- **Rejected:** with the seed data, "black backpack" would also surface black calculators, USB drive and notebook (shared word "black"); that adds noise and implies the system verified a match, which conflicts with the rule that ownership is verified by staff. Refined to all-words matching plus a clear empty state. Limitation kept: "black backpack" does not find "Dark backpack" (different wording).
- **Also rejected:** a "Claim this item" button on found cards — out of scope (README: no ownership-claim workflow).

## Tests run (Playwright against the dev server, 77 checks, all passing)
Section order/stacking/counts, jump links, unsaved-changes prompt (all entry points), highlight and filter clearing, 390 px layout. Search multi-word / case / zero results / clear / chips; status filter; header shortcuts; 3 own cards with Edit; handover notes for received, unconfirmed, collected; empty submit (3 errors, focus, aria); 1-char title; duplicate (case/whitespace-insensitive, clears on edit, edit collision blocked, edit of own report not a false duplicate); found/lost guidance; create → Found column + localStorage + persistence after reload; reset cancel/confirm; no console errors; `npm run build` succeeds; no horizontal scroll at 390 px.
