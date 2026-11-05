# UI/UX Rescue Challenge — Submission notes

Modified files: `src/App.jsx`, `src/styles.css`.

## 1. Form errors now say what is wrong, and where

**User goal:** a student who found an item wants to post it quickly.

**Problem:** `validate()` already produced a specific message, but `submit()` discarded it and only showed "Please review your entries." The most likely failure, a duplicate title at the same location, was invisible. No field was highlighted.

**Fix:** every failing field shows its own message under the input, is marked `aria-invalid` with a red border, and focus moves to the first invalid field. A summary at the top counts the problems. For a duplicate, both title and location are flagged and a **View the existing report** link jumps to the clashing card. Errors clear as soon as you edit the field. The validation rules and messages are unchanged: title ≥ 2 characters, category and status required, no duplicate title + location (edits still exclude themselves).

Also fixed in passing: the required `*` used to drop onto its own line under each label; label text is now wrapped so it stays inline, and optional fields say "(optional)".

**Alternatives considered:** (A) just show the specific message in the existing box — cheap, but you still hunt for the field; (C) live validation while typing — noisy, and the duplicate error would fire mid-word. Chose inline errors on submit.

## 2. Lost and found reports point to each other, with a clear next step

**User goal:** "Someone lost an item and wants to find a matching notice." The campus returns items through collection points after ownership is verified.

**Problem:** matching reports use different words ("Black backpack" / "Dark backpack", "Scientific calculator" / "Calculator"). The search matched only the exact phrase typed, so "black backpack" missed the found one. Found cards gave no next step, and "Reported found - not confirmed" didn't tell anyone what to do.

**Fix:**
- Each lost card lists **Possibly found** reports, and each found card lists a **Possible owner report**: same category, opposite status, sharing at least two descriptive words. Clicking one clears filters and scrolls to and highlights that card. It's labelled "Similar description only — ownership is verified at the collection point" so it never claims a confirmed match.
- Found cards show a colour-coded next step: *Held at X — bring proof of ownership*, *Not yet confirmed at a collection point*, or, on your own found report, *Please take it to a collection point*. A reported item is still never shown as held by staff.
- The form adapts to the chosen status. Status is now the first field; the location label becomes "Where did you find it?" / "Where did you last have it?"; finders are told to hand the item in and to keep one identifying detail back for verification.
- Search matches every typed word in any order, and the category name is searchable too.

**Alternatives considered:** a full claim/ownership workflow — too large, and verification happens in person, so the UI should point there rather than imitate it.

## 3. Filters and navigation behave the way they look

**User goal:** browse the board without getting confused about what is shown.

**Problems and fixes:**

| Before | After |
|---|---|
| "Apply" button did nothing (filters already apply live) | Removed; a live "Showing N of M reports" count replaces it |
| "Noticeboard" kept the "Missing items" filter, so it still showed only lost items | Header links reset filters; the active one is underlined (`aria-pressed`) |
| Columns excluded by a filter said "Nothing here yet" | They say "Hidden by the status filter" or "No … match your search", each with a one-click way out |
| After posting with a filter on (e.g. "Missing items"), your new found report was hidden — it looked like posting failed | Saving clears filters and scrolls to your report, briefly highlighted |
| Success messages stayed until dismissed | They clear after 5 seconds; the dismiss button has an accessible label |
| Own reports looked like everyone else's; Edit was hidden in a "···" menu that never closed | A "Your report" tag and a visible **Edit report** button on your own cards only |

Only your own reports can be edited, as before (`edit()` still checks `owner === 'you'`).

## AI suggestion I rejected

The AI suggested replacing the three-column board with a single filterable list. I rejected it: the Lost / Found / Claimed columns match the domain and read well at a glance. The real problem was that filters made the columns lie ("Nothing here yet"), which fix 3 solves without throwing the layout away.

## Test checklist

1. **Main action:** post a found item → the found-item hint appears → publish → card appears with *Please take it to a collection point*.
2. **Unsuccessful action:** post "Black backpack" at "Library - second floor" → title and location flagged → **View the existing report** jumps to the card.
3. Submit an empty form → three field errors, focus on Status.
4. Lost "Black backpack" card → **Possibly found: Dark backpack, at Campus Security Desk** → click scrolls to it.
5. Click "Missing items", then "Noticeboard" → all reports are back.
6. Edit your own "Calculator" report → save → "Report updated." disappears after 5 s.
7. **Reset demo data** still restores the seed.
