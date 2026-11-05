# UI/UX Rescue: design notes

Screenshots are in [`screenshots/`](screenshots/). `before-*` shows the original app and `after-*` shows the redesign.

**User goals:** a student who lost an item wants to find a matching notice and know how to get the item back. A student who found an item wants to report it and hand it over correctly.

## Three improvements

### 1. Finding a matching notice

**Problem:** search only matched an exact phrase. "earbuds blue" and "blue bottle" returned nothing, although matching notices exist. The person most likely to give up here is the one the board exists to help. The filters also misled people:
- **Apply** did nothing, because filters were already live.
- **Noticeboard** left the Lost filter switched on, so it still showed 6 of 13 reports.
- Filtered views said "Nothing here yet", which reads as if nothing exists.

**Change:**
- Search now matches words in any order, and also covers category. A notice that matches only some of the words is labelled **Partial match**.
- Lost notices link to **possible matches** among found reports.
- The new-report form shows similar notices before someone posts.
- A live "Showing X of Y" count replaces Apply. Navigation shows the current view, and each empty state explains what to do next.

### 2. Knowing where an item is and what to do next

**Problem:** "Received at Campus Security Desk" and "Reported found - not confirmed" were the same small grey text. They mean very different things: one is worth a trip, the other may be a wasted one. Nothing explained that ownership is verified at a collection point. People also couldn't tell which reports were theirs, because Edit was hidden behind a "···" menu on every card.

**Change:**
- Handover status is now a labelled panel with its own colour, icon and next step, so it doesn't rely on colour alone.
- A short guide explains how to get an item back and where to hand one in.
- Your own cards show **Your report** and a visible **Edit** button. Other cards say who reported them.
- Text is at least 12px and meets WCAG AA contrast. Before, some text was 9px with contrast as low as 2.28:1.

### 3. Recovering from a failed submission

**Problem:** every validation failure showed "Please review your entries." The specific message existed in the code but was thrown away, so someone blocked by the duplicate rule had no way to find out why. The form also asked for a "Last known location" even for found items, and never told finders to hand the item in.

**Change:**
- Each field shows its own error, focus moves to the first invalid field, and errors clear as they are fixed.
- The duplicate error explains the rule and links to the existing report.
- Status now comes first, so location wording and guidance fit the situation. Finders are told where to hand the item in and to leave out one identifying detail so the owner can prove it's theirs.
- Leaving a form with unsaved changes asks for confirmation, and so does **Reset demo data**.

## Alternatives compared

| Decision | Options | Choice and reason |
|---|---|---|
| Search | Match all words / match any word / fuzzy-search library | **All words, plus clearly labelled partial matches.** See the example below. A library adds a dependency for a 13-item demo. |
| Lost-to-found matching | Rely on search / automatic "this is yours" / suggested "possible" matches | **Possible matches.** Automatic matching would contradict the rule that ownership is verified in person. |
| Validation timing | On submit / as you type from the start / on submit, then live | **On submit, then live.** People aren't warned while still typing, and errors clear as soon as they are fixed. |
| Edit access | Keep the menu / visible button | **Visible button.** There is only one action, so a menu hides it for no benefit. |

## An AI suggestion that was refined

**Suggested:** when the search has several words, show every notice containing *any* of them, so "black backpack" also finds "Dark backpack".

**Why it was refined:** "black" also appears in the Calculator, Scientific calculator and USB flash drive descriptions, so a search for a backpack would show them too. Matching *all* words has the opposite problem and misses "Dark backpack", which is the item this person is looking for.

**Final rule:** a notice appears if it contains all the words, or at least half of them with one in its title. Partial results are labelled and listed last. "backpack black" now returns the two backpacks and nothing else.

**Known limit:** there are no synonyms, so "headphones" won't find "earbuds".

## Testing

A scripted run in Microsoft Edge covered:
- search, filters and navigation
- creating and editing reports, including own-reports-only editing
- all validation rules, including duplicates regardless of case or extra spaces
- saving after reload, and reset
- text size and contrast
- no sideways scrolling at 1024, 768 and 390px wide

**Unsuccessful action to demonstrate:** post "Black backpack" at "Library - second floor". The duplicate error appears, your typed details are kept, and nothing is posted.
