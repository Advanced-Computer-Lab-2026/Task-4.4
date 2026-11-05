# UX changes — Campus Lost & Found

## Summary

The noticeboard looked friendly but failed users at the moments that matter: posting a report (vague errors), deciding whether a found item can actually be collected (custody shown as faint grey text), editing one's own report (hidden behind an unlabelled "···" menu), finding a match (a fake "Apply" button, exact-phrase search, no feedback on active filters) and knowing where they are in the form (same headings for create and edit, unsaved changes lost silently).

Five problems were fixed. All existing behaviour (validation rules and messages, storage, seed data, edit guard, custody wording, reset) is preserved. No new dependencies were added.

Files: `src/App.jsx`, `src/ReportForm.jsx` (new), `src/ReportCard.jsx` (new), `src/custody.js` (new), `src/filters.js` (new), `src/styles.css` (readable block appended at the end).

---

## Problems and fixes

### P1 — Form errors did not say what was wrong

- **User goal:** post a lost/found report quickly and correctly.
- **Why it hurt:** a failed submit only showed "Please review your entries." at the bottom of the form. The real reason (short title, missing status or category, duplicate) was never shown, the faulty field was not marked and focus stayed on the button. Users had to guess, and screen-reader users got no useful message.
- **Alternatives considered:**
  - *Show the single first message from `validate()` in the banner* — cheap, but users fix one error, resubmit, hit the next one.
  - *Disable the submit button until the form is valid* — prevents errors but never explains them, and disabled buttons are hard to discover with a keyboard.
  - *Inline errors on blur* — immediate, but shows errors while the user is still tabbing through untouched fields.
  - *Error summary + inline errors after the first submit, then live re-validation* (chosen).
- **Chosen fix:** `validateFields()` reuses the exact rules and messages of `validate()` but returns every problem at once. After the first failed submit an error summary ("Please fix the following:") lists each problem as a link-style button that focuses the field; each field gets an inline "⚠ Error: …" message, red border, `aria-invalid` and `aria-describedby`; focus moves to the first invalid field. Errors then update live as the user types. A duplicate is shown under the title with "Change the title or location to continue." under the location. Required fields are marked and explained, and the title has a hint ("At least 2 characters, e.g. Black backpack."). `validate()` is still the gate for saving.
- **Justification:** users see all problems at once, exactly where to fix them, without being nagged before they have tried.

### P2 — It was unclear whether a found item was actually with staff

- **User goal:** someone who lost an item wants to know if they can go and collect it, and where.
- **Why it hurt:** "Received at Campus Security Desk" and "Reported found - not confirmed at a collection point" looked the same — small grey text. Users could walk to a desk for an item that was never handed in. Nothing explained how recovery works or what to bring.
- **Alternatives considered:**
  - *Hide reported-only items* — cleaner board, but removes real information (someone has seen the item).
  - *A "Claim this item" button* — see the AI section below; rejected.
  - *Colour-coded custody badge with a next step, a filter, and a short recovery guide* (chosen).
- **Chosen fix:** `custody(item)` in `src/custody.js` returns `{kind, label, next}` using the original text and branch order. Cards show a badge: green "✓ Received at …" with "Bring your student ID and a description of the item", amber dashed "! Reported found - not confirmed at a collection point" with "Not yet handed to staff…", grey "✓ Collected by owner". Icons and text are used as well as colour. A "Handover status" filter ("Held at a collection point" / "Reported only – not with staff") and a sidebar "How recovery works" panel listing the three collection points were added. When reporting a Found item, the form asks the user to hand it in and explains how the notice will appear until staff confirm.
- **Justification:** the most important decision ("can I go and get it?") is now visible at a glance, and the new found report is never shown as held.

### P3 — Editing your own report was hidden

- **User goal:** update a report you posted (e.g. add a detail, change status).
- **Why it hurt:** every card had the same "···" menu. On other people's cards it opened only "Reported by another student" — a dead end. On your own cards the edit action was hidden one click deep, and nothing on the board showed which reports were yours.
- **Alternatives considered:**
  - *Keep the menu, hide it on others' cards* — still hides the main action behind an unlabelled icon.
  - *A separate "My reports" page* — clear, but adds navigation for a small number of items.
  - *Visible "Your report" tag + "Edit report" button on own cards, plus a "Show only my reports" filter* (chosen).
- **Chosen fix:** the menu and its state were removed. Own cards get a "Your report" tag, a subtle outline and an "Edit report" button (`aria-label="Edit your report: <title>"`). Other cards show the muted text "Posted by another student". The `edit()` ownership guard is unchanged.
- **Justification:** one visible, labelled action where it is possible; no fake actions where it is not.

### P4 — Search and filters gave poor feedback

- **User goal:** find a matching notice fast.
- **Why it hurt:** the "Apply" button did nothing except show a count (filters were already live), so it was misleading. Search needed the exact phrase ("blue earbuds" found nothing although "Earbuds in blue case" exists). There was no summary of active filters, the header links gave no sign which view was active, empty columns said "Nothing here yet" even when filters were the cause, and a newly posted report could be hidden by the current filter with no explanation.
- **Alternatives considered:**
  - *Keep Apply and make filters apply only on click* — slower and a pattern users don't expect for a small list.
  - *Fuzzy search library* — better matching, but adds a dependency.
  - *Live filters, word-based search, result summary with removable chips, honest empty states* (chosen).
- **Chosen fix:** Apply removed; "Clear filters" resets everything. Search matches every word in any order over title, location, description and category. "Showing N of M reports" (live region) plus chips like "Status: Lost ✕" that remove one filter, and "Clear all". Header links show the active view (`aria-current`). Empty columns say "No matching reports" when filtered, and a board-level panel offers "Clear filters" and "+ Post a report". After saving, if filters would hide the report they are cleared ("Filters were cleared so you can see it."), and the saved card is scrolled into view, highlighted briefly and focused.
- **Justification:** users always know what they are looking at and why, and never lose track of what they just posted.

### P5 — The form did not adapt to what the user was doing

- **User goal:** report or edit with confidence.
- **Why it hurt:** the breadcrumb said "Report an item" and the header "NEW NOTICE / FORM 01" even while editing. "Last known location" made no sense for a found item. Status meanings were not explained. "Go back" discarded typed text without warning.
- **Alternatives considered:**
  - *Auto-save drafts* — safest, but needs extra storage and state for a short form.
  - *Separate create and edit pages* — duplicate code for little gain.
  - *Context-aware labels + confirm on discard* (chosen).
- **Chosen fix:** edit mode shows "Edit report" / "EDIT NOTICE". The location label follows status ("Where did you lose it?" / "Where did you find it?" / "Location") with "Optional – helps with matching." A one-line status explanation was added. Leaving the form with unsaved changes (Go back, breadcrumb, header links) asks "Discard your unsaved changes?". Focus moves to the title when the form opens.
- **Justification:** fewer wrong entries and no accidental data loss, at very low cost.

### Accessibility and readability (supports all of the above)

Content text raised to at least 12px (column subtitles 11px), low-contrast greys darkened to about 4.5:1 or better, visible `:focus-visible` outline, labelled ✕ ("Dismiss message"), decorative icons hidden from screen readers, card rotation removed for `prefers-reduced-motion`, layout checked at 375px width.

---

## AI design suggestion refined or rejected

**Rejected:** the AI assistant suggested adding a "Claim this item" button on found cards that would move the item straight into the CLAIMED column.

**Why rejected:** on this campus, recovery happens in person at a collection point, after staff verify ownership. A one-click claim would let anyone mark someone else's item as claimed, would show items as recovered that are still sitting at a desk, and would be meaningless for items that were only *reported* found and never handed in. It would also break the rule that a report is not automatically confirmed as held by staff.

**Refined into:** a custody badge that names the collection point and tells the user what to bring ("Bring your student ID and a description of the item"), a clear amber state for reported-only items, a "Held at a collection point" filter, and a short "How recovery works" guide. Users get the same "what do I do next?" answer without a fake action.

**Second example (rejected):** the AI assistant also suggested hiding reported-only items to reduce clutter. Rejected because it removes useful information — a reported sighting still tells the owner where the item was seen; the amber badge and filter give the same clarity without hiding anything.

---

## Preserved behaviour

- Storage key `acl-foundboard-v3`, seed data and fallback to seed are unchanged.
- `validate()` is unchanged and still decides whether a report can be saved; all four messages are identical.
- New reports: trimmed fields, owner "you", created "Today", 📌, `collectionPoint: ''`, `handoverStatus: 'reported'`, prepended to the list. Edits keep emoji, collection point and handover status. Messages "Your report has been posted." / "Report updated." are kept (extra sentences are appended only).
- `edit()` keeps the `owner !== 'you'` guard; only f1, f8, f11 (and new reports) are editable.
- Custody text and branch order are identical; users cannot set custody fields.
- Reset restores the seed, returns to the board, clears all filters and shows "Example reports restored."
- Search, category and status filters, LOST / FOUND / CLAIMED columns with counts, "Latest notices (N)", success message with dismiss, "Location not provided", "No additional description.", edit pre-fill, "Publish notice" / "Save report".

---

## Manual test checklist

1. Post "Grey umbrella", Found, Other, location "Gym" → appears at the top of FOUND, highlighted and focused, amber "Reported found - not confirmed at a collection point", message starts "Your report has been posted."
2. Reload → report is still there.
3. Submit an empty form → summary lists title, status and category messages; inline errors shown; focus on Title; `aria-invalid="true"`; nothing saved.
4. Type "A" → title error stays; type a second letter → error clears live.
5. Title "black BACKPACK ", location "library - second floor", Lost, Accessories → duplicate message under title, "Change the title or location to continue." under location; not saved.
6. Edit f1 without changes and save → "Report updated."
7. f2 green "Received at Campus Security Desk" with next step; f5 and f13 amber; f8 grey "Collected by owner"; lost cards have no badge.
8. Handover filter "Held at a collection point" → f2, f3, f7, f11; "Reported only" → f5, f13 (+ new found reports).
9. Recovery panel lists the three collection points; found hint appears only for status Found; no claim button anywhere.
10. Only f1, f8, f11 (and your new reports) show "Your report" / "Edit report"; no "···" menus; edit is pre-filled; "Show only my reports" works.
11. Search "blue earbuds" → f4, f5; "backpack" → f1, f2.
12. Filters apply live; no Apply button; "Showing X of 13 reports"; each chip removes one filter; "Clear filters" / "Clear all" reset everything.
13. Header links show the active view.
14. Search "zzzz" → "No reports match your search." panel and "No matching reports" in every column.
15. With "Missing items" active, post a Found report → filters cleared, card visible and highlighted, message says filters were cleared.
16. Edit mode shows "Edit report" / "EDIT NOTICE"; location label follows status; Go back with changes asks to confirm.
17. Reset demo data → 13 reports, all filters cleared.
18. Keyboard only: all controls reachable with visible focus; error summary buttons move focus to fields.
19. At 375px width: no horizontal scrolling, chips and header links wrap.
20. `npm run build` passes; no new dependencies.

---

## Screenshots

| View | Before | After |
| --- | --- | --- |
| Noticeboard | _TODO: add screenshot_ | _TODO: add screenshot_ |
| Form validation error | _TODO: add screenshot_ | _TODO: add screenshot_ |
| Held vs reported card | _TODO: add screenshot_ | _TODO: add screenshot_ |
| Own card with Edit | _TODO: add screenshot_ | _TODO: add screenshot_ |
| Empty search state | — | _TODO: add screenshot_ |
