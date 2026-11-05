# UI/UX Rescue Challenge

## User goal

Users should be able to find a lost item, claim a found item safely, and filter reports easily.

## Three problems and fixes

### 1. Users could not claim an item

**Problem:** Found reports had no way for the owner to claim an item.

**Fix:** Added a **Claim this item** button. After a successful claim, the item moves to the **CLAIMED** section.

### 2. Claims had no validation

**Problem:** Users could not provide proof that the item belonged to them.

**Fix:** Added a verification form. Empty or very short answers show an error. A valid answer completes the claim.

### 3. The Apply button did not work

**Problem:** Filters changed automatically, so the Apply button appeared unresponsive.

**Fix:** Filters now apply only after clicking **Apply**. The **Clear** button resets the filters.

### Additional UI issue found: Empty results do not help users recover

**Problem:** When a search or filter finds no reports, the interface only says “Nothing here yet.”

**Why it matters:** Users may think the system has no data instead of understanding that their current search or filters found no matches. They are not given a clear next step.

**Suggested improvement:** Explain that no reports match the current filters and provide a visible **Clear filters** action so users can quickly try again.

## AI suggestion

One suggestion was to remove the Apply button and keep automatic filtering. I rejected this because the original interface already included an Apply button. I made the button work as expected instead.

## Demonstration

- **Successful action:** Claimed a found item using a valid verification detail.
- **Unsuccessful action:** Submitted an empty or too-short verification detail and received a validation error.
- **Filter action:** Entered a search term, clicked Apply, and confirmed that matching reports appeared.

## Screenshots

Replace each placeholder below with the screenshot you took:

**Before: Cannot claim an item**

![alt text](<Screenshot 2026-11-05 140634.png>)`


**Before: Apply button unresponsive**

![alt text](<Screenshot 2026-11-05 140413.png>)`

**After: Claim action**

![alt text](<Screenshot 2026-11-05 141209.png>)

**After: Claim validation**

![alt text](<Screenshot 2026-11-05 141228.png>)

**After: Apply button works**

![alt text](<Screenshot 2026-11-05 141241.png>)
