# UI/UX Rescue Challenge: Submission

**Student:** _(your name)_

**Scenario:** A student who lost an item wants to find a matching notice. Another student needs to report an item they found. Found property is handed over and recovered at collection points after ownership is verified.

**Modified files:** `src/App.jsx`, `src/styles.css`

**How AI was used:** Claude Code used the site, found the problems, compared the options below, and implemented and tested the fixes. The alternatives were compared by the AI as it worked. I reviewed the results and can explain each decision.

---

## Three justifications

### 1. Finding a matching item
**User goal:** Someone who lost an item wants to know if it has been found, and where to get it.

**Problem:** Search only matched the exact phrase, so "blue bottle" returned nothing even though "Blue sports bottle" was listed. Lost and found reports of the same item were not connected, and people describe the same item differently ("Black backpack" and "Dark backpack").

**Fix:** Search now matches every word in any order, and also checks the category. Lost cards show a **Possible match** box with the found item, its location and its handover status.

**Screenshots:** `before-2-search-empty.png`, `after-1-board.png`

### 2. Honest error messages on the form
**User goal:** Someone reporting an item wants to publish it without guessing what went wrong.

**Problem:** Every failure showed only "Please review your entries." The specific messages, including the duplicate report rule, existed in the code but were never shown.

**Fix:** Each invalid field is highlighted with its own message, and the cursor moves to the first problem. What the user typed is kept. The validation rules are unchanged.

**Screenshots:** `before-4-form-error.png`, `after-4-form-errors.png`

### 3. Clear collection point information
**User goal:** An owner needs to know where to recover an item. A finder needs to know what to do with it.

**Problem:** Handover status was tiny grey text, so "staff hold it" and "someone said they found it" looked almost the same. Finders got no instructions at all.

**Fix:** Cards show a green **Held at [place], bring proof of ownership** or an amber **Not yet at a collection point**. Choosing "Found" on the form lists the collection points and explains that the notice stays unconfirmed until staff have the item.

**Screenshots:** `before-1-board.png`, `after-1-board.png`, `after-5-found-guidance.png`

### Additional improvement: misleading filters
"Missing items" labelled the other columns "Nothing here yet", which was false, and the Apply button did nothing useful because filters already update as you type. Now only the selected column shows, the menu marks the current view, and there is a results count and a helpful message when nothing matches.

**Screenshots:** `before-3-missing.png`, `after-3-missing.png`, `after-2-no-results.png`

### Supporting changes
- Text is larger with stronger contrast, and colour now shows status rather than being random.
- The hidden "···" menu is replaced by a "Your report" tag and a visible **Edit report** button. Other people's cards still say "Reported by another student".
- Leaving the form with unsaved typing now asks for confirmation first.
- Editing a report keeps its original date instead of changing it to "Today".
- The board uses one column on phones.

---

## Alternatives and trade-offs

| Problem | Option | Trade-off | Decision |
|---|---|---|---|
| Matching | Fuzzy search with synonyms | Finds "dark" when searching "black", but results become harder to predict | Rejected |
| Matching | Separate matching page | Room for detail, but adds a step and hides matches from the board | Rejected |
| Matching | Possible match box on the lost card | Visible straight away, but it is only a best guess, so it must say "possible" | **Chosen** |
| Filters | Make Apply work properly | Fewer updates, but adds a click for no benefit on a small list | Rejected |
| Filters | Keep all columns and correct the wording | Simple, but leaves empty columns on screen | Rejected |
| Filters | Show only the selected column | Uses the space for results, but the other columns are hidden until the filter is cleared | **Chosen** |
| Form errors | Disable Publish until the form is valid | Prevents bad submissions, but does not explain what is wrong | Rejected |
| Form errors | Error message beside each field, plus a summary | Slightly more on screen, but says exactly what to fix | **Chosen** |
| Handover | Finder selects a collection point | Gives more data, but implies staff have the item | Rejected |
| Handover | Written guidance, with status unchanged until staff confirm | Less data, but stays accurate | **Chosen** |

## AI suggestion rejected

**Suggestion:** Add a dropdown so finders can choose which collection point they used.

**Why rejected:** It looks helpful, but the notice would then appear to confirm that staff hold the item when only the finder has said so. The brief says a reported item is not automatically confirmed as held by staff.

**What replaced it:** The form tells finders where to hand the item in, and the card stays "Not yet at a collection point".

---

## Testing

Tested in Microsoft Edge with an automated browser script. All checks passed.

| Area | Result |
|---|---|
| Search | "blue bottle" and "backpack keychain" return 2 results each, "electronics" returns 5, and upper and lower case both work |
| Possible matches | The 4 lost items with a found counterpart show it, and "Small notebook" and "Canvas tote bag" show no match |
| Filters | "Missing items" shows only the Lost column, and "Noticeboard" shows all 13 reports again |
| Empty form | Shows 3 field errors, moves the cursor to the first, and does not save |
| Short title | Shows the 2-character message |
| Duplicate report | Rejected with the specific message, and the typed text is kept |
| New found report | Saves and shows "Not yet at a collection point" |
| Ownership | Edit appears only on your own reports |
| Editing | Changes save and appear on the card, and the original date is kept |
| Unsaved changes | All 4 ways of leaving the form warn, Cancel keeps the typing, and an untouched form leaves without a warning |
| Saved data | Reports survive a page reload, and Reset restores the examples |
| Phone width (390px) | No sideways scrolling |
| Accessibility (axe, WCAG A/AA) | No violations on the board or the form with errors |

**Known limits:**
- Possible matches are a best guess based on shared words in the same category.
- There is no staff screen, so new found reports stay unconfirmed.

---

## Demonstration steps

Click **Reset demo data** first.

1. **Main action:** Click **+ Post a report**, choose **Found**, and point out the guidance. Enter "Red umbrella", category "Accessories", location "Gate 1", and publish. Show the amber status on the new card.
2. **Unsuccessful action:** Click **+ Post a report** and publish the empty form. Then enter status "Found", title "Dark backpack", category "Accessories", location "Library - main stairwell", and publish to show the duplicate message.
3. **Improvement 1:** Search "blue bottle", then point out the Possible match box on "Black backpack".
4. **Improvement 2:** Show the field errors from step 2.
5. **Improvement 3:** Compare a green "Held at" card with an amber "Not yet at a collection point" card.
