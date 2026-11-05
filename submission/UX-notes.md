# Campus Lost & Found — UX changes

## Three usability problems and fixes

1. **The form hid the reason an entry was rejected.** It showed “Please review your entries” even when the app already knew the exact issue. The form now displays that existing reason, such as a title being too short or a duplicate title and location. The validation rules are unchanged.

2. **A search with no matches looked like three empty categories.** The board now shows one “No reports match these filters” message and a Clear filters button. The search/filter rules are unchanged; the button clears the same search, category, and status selections as the existing Clear control.

3. **Collection handover status was easy to miss.** Existing received, reported, and collected statuses now appear as text badges with distinct colors. The status text and underlying item data are unchanged, so the distinction does not depend on color alone.

## AI suggestion considered

An alternative was to automatically match lost and found reports and show similarity scores. That could surface useful candidates, but it would introduce matching rules and possible false matches. I rejected it to keep the website’s behavior unchanged. I chose clearer feedback around the search that already exists, and made the existing handover information easier to scan.

## Demo walkthrough

- **Successful main action:** Post a report with a new title, status, and category; confirm it appears in the matching board column.
- **Unsuccessful action:** Try reporting “Black backpack” at “Library - second floor” with a valid status and category; the form explains that the same title and location already exist.
- **Search recovery:** Search for a phrase that is not in any notice; use Clear filters to return to the full board.
- **Handover distinction:** Compare a green “Received at …” badge with the amber “Reported found - not confirmed at a collection point” badge.

## Screenshots

- [Before](Task-4.4-before.png)
- [After](Task-4.4-after.png)
