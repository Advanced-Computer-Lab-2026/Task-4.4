# UI/UX Rescue Challenge: Campus Lost & Found

**Changed files:** `src/App.jsx`, `src/styles.css` (no new dependencies, same data model, same `localStorage` key)
**Screenshots:** `submission/screenshots/` (`before-*` = original, `after-*` = redesign)

## User goals (from the scenario)

1. **Someone who lost an item** wants to find a matching found notice and know how to get the item back.
2. **A student who found an item** wants to report it and know what to do with the item afterwards.
3. **Anyone who posted a report** wants to find it again and keep it up to date.

---

## Problem 1: Failed submissions give no usable feedback

**Before:** `validate()` worked out the exact problem (title too short, missing category, duplicate title at the same location), but `submit()` threw that away and only showed *"Please review your entries."* at the bottom of the form. The user can't tell which field is wrong. For a duplicate, every field looks valid, so they're stuck. (`before-4-duplicate-error.png`)

**Why it hurts:** this breaks Nielsen's heuristic *"help users recognise, diagnose and recover from errors"*. A duplicate usually means the report already exists, which is exactly what the user needs to know.

**After:** (`after-4-empty-submit.png`, `after-5-duplicate-error.png`)
- The validation rules are unchanged. Every error now appears **next to its own field** (`aria-invalid` and `aria-describedby`), and an error summary at the top links to each field.
- Focus moves to the first invalid field. After the first attempt, errors re-check live and disappear as soon as they're fixed.
- **Duplicate:** the title and location fields are both marked, and the form shows the existing report with a recovery action: *"Edit that report instead"* if it's yours, or *"View the existing report"* if it isn't.

## Problem 2: You can't tell which reports are yours, and Edit is hidden

**Before:** every card had the same "···" menu. On 10 of the 13 cards it only opened a dead end (*"Reported by another student"*). The only way to find your own reports was to open menus one by one. (`before-2-menu-dead-end.png`)

**Why it hurts:** editing is a core feature, but it was hidden (poor discoverability) and every other card offered a control that does nothing (false affordance).

**After:** (`after-1-board.png`)
- Your own cards get a **"Your report"** tag, a darker border and a visible **"✎ Edit report"** button. Other people's cards have no action control.
- There's a **"My reports"** view in the header and an "Only my reports" filter.
- The ownership rule is unchanged: `edit()` still refuses rows that aren't `owner === 'you'`.

## Problem 3: The recovery path through collection points is unclear

**Before:** a found card said *"Received at Campus Security Desk"* in small grey text with no next step. A "reported" item said *"not confirmed at a collection point"*, which looked almost the same. The form never told a finder to hand the item in. Nothing linked a lost report to found items that looked similar.

**Why it hurts:** the scenario's main task (recover the item via a collection point once ownership is verified) wasn't supported. People who lost something had to search and compare by hand, and finders didn't know the handover step existed.

**After:** (`after-2-possible-matches.png`, `after-6-found-form.png`, `after-7-posted.png`)
- **Colour-coded handover badges:**
  - 🟢 *Held at X:* "Bring your student ID and describe the item to collect it."
  - 🟠 *Not yet at a collection point:* "Staff haven't confirmed receiving it." This keeps the brief's rule that a reported item is not confirmed as held.
  - 🔵 *Back with its owner.*
- **"🔎 N possible matches in Found"** on lost cards. It uses simple matching on category and keywords (e.g. Black backpack → Dark backpack, Wireless earbuds → Earbuds in blue case), opens a focused comparison view, and has a "Back to all notices" button.
- **Report form:**
  - Status is now the first question, as three choices ("I lost something" / "I found something" / "Claimed"), and the location label adapts ("Where did you find it?").
  - Lost reports show *"these found items might be yours"* **before** you post.
  - Found reports explain the hand-in step and list the collection points. The success message repeats that next step.
- **Sidebar:** the slogan box is replaced with a 3-step "How getting items back works" guide.

## Smaller fixes along the way
- **Card colours now mean something.** The yellow/green/purple cards came from `nth-child` and carried no meaning. Each card now takes its colour from its status (red = lost, green = found, blue = claimed), matching the column headers.
- The **Apply** button did nothing: filters were already live, and it only printed a message. It's been replaced by a live "Showing X of 13 reports" count and a "Clear filters" button.
- **"Missing items" / "Recently found"** used to leave the other columns showing *"Nothing here yet"*, which wrongly suggested nothing had been found. A single-status view now uses the full width, and empty results offer "Clear filters".
- **"Noticeboard"** now really resets the view, and the header shows which view is active.
- Labels and focus states are clearer, status options are capitalised, and the form warns people not to publish personal details.

---

## AI design suggestion I refined or rejected

**AI suggestion (rejected):** *"Add a 'This is mine → Claim' button on found cards that marks the item as claimed."*
**Why I rejected it:** the brief says items are released only **after ownership is verified** at a collection point, and that a report isn't confirmation that staff hold the item. A one-click claim would let anyone mark someone else's item as claimed, and it would edit other users' reports, which breaks the "edit only your own reports" rule. **What I did instead:** a guidance-only badge ("Held at X: bring your student ID…") that sends the user to the verification step without changing data.

**AI suggestion (refined):** *"Show the validation error as a toast notification."*
**Refinement:** toasts disappear and aren't attached to the field, so they repeat the original problem. I used inline field errors plus a persistent, linked summary, and moved focus to the first invalid field.

---

## Testing
I ran an automated browser check (Playwright) against the production build. **All 32 checks pass**, including:
- 13 cards load; Edit shows only on the 3 own reports
- Badges: 4 held, 2 pending
- Possible-matches view, header views and active state, live count, Clear filters
- Empty submit: 3 inline errors with focus on the first one; errors clear live
- Duplicate is blocked and offers "Edit that report instead"
- Creating a found report, editing and saving
- Editing your own report doesn't trigger its own duplicate check
- Persistence after reload, and Reset demo data

## Demo script (for the live demonstration)
1. **Main action:** Post a report → *I found something* → "Grey umbrella", Other, "Building C" → see the hand-in guidance → Publish. The card appears as *Not yet at a collection point* with an Edit button.
2. **Unsuccessful action:** Post a report → *I lost something* → "Black backpack", Accessories, "Library - second floor" → Publish. The duplicate is flagged inline and offers *Edit that report instead*. Also try submitting an empty form.
3. **Improvements:** (1) the inline errors above; (2) the "Your report" tags, Edit buttons and *My reports*; (3) *1 possible match in Found* on Black backpack → *Held at Campus Security Desk*.
