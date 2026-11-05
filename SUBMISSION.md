# UI/UX Rescue Challenge — Campus Lost & Found

**Modified files:** `src/App.jsx`, `src/styles.css`
**Screenshots:** `screenshots/before-*.png` and `screenshots/after-*.png` (same steps, same numbering)

## User goals

- **Owner:** "I lost my backpack. Has anyone found it, and where do I go to get it back?"
- **Finder:** "I found earbuds. How do I report them, and what should I do with the item?"

## Improvements

### 1. Search and filters now help people find a match (Usability; slides 11, 20, 21)

**Problem:** The search matched the exact phrase only. Searching "blue earbuds" returned **0 results**, even though "Earbuds in blue case" is on the board. The **Apply** button didn't do anything; filters were already live, and the button only showed a message. Header links like "Recently found" quietly changed a filter without showing that a filter was on. When nothing matched, each column just said "Nothing here yet", with no next step.

**Why it hurts:** The person who lost something stops after one failed search and assumes nobody found it. Their item stays at the collection point.

**Fix:**
- Search now matches every word anywhere in the title, location, description or category.
- The Apply button is gone, replaced by the hint "Results update as you type".
- A result bar shows "Showing X of Y reports", a removable chip for each active filter, and **Clear all**.
- When nothing matches, an empty state suggests different search words and offers **Post a report** or **Clear filters**.

Screenshots: `2b-search-blue-earbuds`, `2c-search-no-results`

### 2. Found items say where they are and what to do next (Think like a user; slide 5)

**Problem:** Whether a collection point held the item was shown in 10px grey text, worded the same way for every case. The brief says a reported item is *not* confirmed as held by staff, but the card made no clear distinction. A user's own lost report gave no route to similar found items. The form looked the same whether you lost or found something, so finders weren't told to hand items in.

**Why it hurts:** "Where do I collect it?" is the last step of the journey, and it was the hardest part to read. Owners could go to a desk that doesn't have the item.

**Fix:**
- **Colour-coded status box on each found or claimed card:**
  - **Held at Campus Security Desk — bring proof of ownership** (green)
  - **Not yet at a collection point — staff have not confirmed** (amber)
  - **Returned to owner** (blue)
- **"See possible matches (N)":** a button on your own lost reports. It shows found reports in the same category; it never claims they are a confirmed match.
- **Form changes when Status = Found:**
  - It tells the finder to hand the item to one of the three collection points.
  - The location label becomes "Where you found it".
  - The description hint says to leave out details only the owner would know, so staff can use them to verify ownership.
- **Form change when Status = Lost:** it offers "Check found items first".

Screenshots: `3-edit-action`, `6a-found-form`, `8-possible-matches`

### 3. Specific errors and a way to recover (Real-world behaviour; slide 28)

**Problem:** `validate()` produced a precise message, but `submit()` threw it away and always showed **"Please review your entries."** That happened for an empty form and for a duplicate report. The user couldn't tell which field was wrong, or that the item already existed. The required `*` also appeared on its own line.

**Fix:**
- The validation rules are unchanged:
  - Title must be at least 2 characters.
  - Status and category are required.
  - The same title at the same location is rejected.
- Each invalid field now gets its own error underneath it: red border, `aria-invalid`, and `aria-describedby`.
- Focus moves to the first invalid field.
- A summary line says how many fields need fixing.
- For a duplicate, the error names the existing report's location and offers **Show the existing report**, which opens the board filtered to that report.

Screenshots: `4-duplicate-error`, `5-empty-submit`

### Supporting fix: edit actions you can see (slide 27)

- **Before:** "Edit" was hidden behind a `···` menu that also appeared on other people's cards, where it only said "Reported by another student".
- **After:** your own cards show a **Your report** label and a visible **Edit report** button. Other people's cards have no dead menu.
- Edit is still blocked in code for reports that aren't yours.

**Accessibility:** card text went from 9–10px to 11–12px, with darker text colours for better contrast.

## AI suggestion I refined or rejected

**AI suggestion:** "Automatically match lost and found reports and show a 'Match found: 87%' badge on the owner's report."

**My decision:** I refined it into a **See possible matches (N)** button that filters by category and status. It shows a neutral message: "may match … compare the details, then visit the collection point with proof of ownership."

**Why:** The brief says ownership is verified at collection points and a report isn't confirmation. A percentage would sound like the system had verified the match. It could send the wrong person to claim an item, or make an owner skip a real match the algorithm missed.

**Also rejected:** merging the three LOST / FOUND / CLAIMED columns into one list with tabs. The columns match the item's journey, and with the new filter chips they work well together.

## Testing

I ran a headless browser script (Chrome via puppeteer-core) against the same steps before and after the changes:

| Check | Before | After |
|---|---|---|
| Search "blue earbuds" shows "Earbuds in blue case" | ✗ | ✓ |
| Duplicate report error is specific | "Please review your entries." | Names the existing report + recovery link; focus on title |
| Empty submit | Generic message | Error under title, status and category |
| Post a found report (main action), visible on board | ✓ | ✓ (filters cleared so the new card is visible) |
| Edit own report and save | ✓ (via hidden menu) | ✓ (visible button) |
| Other people's reports can't be edited | ✓ | ✓ (no edit control) |
| "See possible matches" on Black backpack shows Dark backpack | n/a | ✓ |
| Mobile 390px layout | ✓ | ✓ |
| Runtime errors | none | none |

Saved data (localStorage), **Reset demo data**, the header shortcuts and all seed records work as before.
