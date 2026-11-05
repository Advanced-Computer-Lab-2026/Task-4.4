# UI/UX Rescue Challenge: Submission

Scenario: someone lost an item and wants to find a matching notice, and another student needs to report a found item.

**Modified React files:** `code/App.jsx`, `code/styles.css` (the same files as `src/App.jsx` and `src/styles.css`).

## Screenshots

| Issue | Before | After |
|---|---|---|
| 1. Vague form error | `screenshots/before-1-error.png` | `screenshots/after-1-error.png` |
| 2. Useless Apply button | `screenshots/before-2-filters-apply.png` | `screenshots/after-2-filters.png` |
| 3. Found items not visually distinct | `screenshots/before-3-found-card.png` | `screenshots/after-3-found-column.png` |
| Main action (post a report) | n/a | `screenshots/after-4-success.png` |

## Three justifications

**1. Vague form error ("Please review your entries.")**
- **User goal:** Publish a report, for example of a found item, and fix it quickly if it is rejected.
- **Problem:** `validate()` already knew the exact reason (title too short, duplicate title at the same location, or missing category). The submit handler threw it away and always showed one generic sentence. The user had to guess which of five fields was wrong.
- **Fix:**
  - The error now shows the actual reason under a "Couldn't publish yet." heading.
  - The offending field or fields get a red border and `aria-invalid`.
  - The error clears as soon as the user edits a field.
- **Validation:** The rules in `validate()` are unchanged.

**2. "Apply" button that does nothing**
- **User goal:** Narrow the board to find a matching notice for a lost item.
- **Problem:** Results already update live as you type or change a filter. **Apply** only showed a banner. This suggested the user had to press it, and that nothing had happened until they did. The user couldn't tell whether the filters were active.
- **Fix:**
  - Removed **Apply**.
  - Added a live "Showing 3 of 13 reports" count (`aria-live`) and a "results update as you type" hint.
  - Renamed **Clear** to **Clear filters**. It is disabled when no filter is active.

**3. Found items look the same as lost ones, and handover state is hard to read**
- **User goal:** A person who lost something scans the FOUND column to see what might be theirs and where to collect it.
- **Problem:**
  - Found cards were the same yellow as lost cards, so they didn't match the green FOUND column icon.
  - "Received at…" versus "not confirmed" was 10px grey text.
- **Fix:**
  - Card colour now follows status: Lost is yellow, Found is green, Claimed is blue.
  - Handover state is a badge. Green means "Received at <collection point>". Amber means "Reported found - not confirmed at a collection point". Blue means "Collected by owner".
  - Body text size was raised from 10px to 12px.
- **Wording:** Unconfirmed items still never claim that staff hold them.

## Testing (run in Chrome against the dev server)

| Check | Result |
|---|---|
| Main action: post a found "Grey umbrella" at "Main gate" | "Your report has been posted." and the card is added |
| Failure: duplicate title and location | "An item with the same title has already been reported at this location." |
| Failure: title "A" | "Title must be at least 2 characters." |
| Failure: no category | "Choose a category." |
| Category filter "accessories" | "Showing 3 of 13 reports" |
| Edit menu on own report | Shows "Edit your report" |
| `vite build` | Succeeds |

## AI design suggestion I rejected

When I asked the AI how to fix Problem 3, it suggested adding a collection-point dropdown to the "Report an item" form. The finder would pick a point, and the card would then say "Received at <point>" in green.

I rejected it. The README says a reported item is not automatically confirmed as held by staff, and the existing data separates `reported` from `received` for that reason. A form field chosen by the finder would let anyone mark an item "Received" without staff having seen it. That would give a searcher false confidence and send them to a desk that doesn't have the item.

I kept the `reported` / `received` distinction and improved how it is displayed instead (colour and badges). The same reasoning keeps ownership claiming out of scope, because it needs staff verification.
