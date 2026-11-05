# Campus Lost & Found — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

The terminal prints **one local URL**. Open that link in your normal external browser. The development server will **not** open a browser automatically. Press `Ctrl+C` to stop it.

## Functional brief

Users browse, search and filter item reports, create reports, and edit only their own reports. Reports have lost, found and claimed states. The same title at the same location may not be reported twice. Some found items have been handed to fictional campus collection points; others have only been reported. A reported item is not automatically confirmed as being held by staff.

### Fields from the prior lab

- `title` — Item title: at least two characters
- `status` — Status: lost, found or claimed
- `category` — Category: electronics, clothing, documents, accessories, other
- `location` — Location: optional
- `description` — Description: optional

The demo supports create/edit and stores your updates in browser `localStorage` for this browser. **Reset demo** restores the example records. You can assume the current signed-in user is `You`.

## User scenario for this session

Someone lost an item and wants to find a matching notice. Another student needs to report an item they found. The campus uses designated collection points for handing over and recovering found property, after ownership is verified.

Your redesign should support the scenario above without removing or weakening the existing features.

## UI/UX Rescue Challenge (25–30 minutes)

**Your mission:** use this interface as an end user, find **at least three distinct, meaningful UI/UX problems**, and fix all three with AI assistance.

- Explain the user's goal and why each issue hurts usability.
- Ask AI to suggest alternatives and compare trade-offs before you implement a solution.
- Choose your own changes; there is no prescribed visual redesign.
- Preserve all working behavior and relevant validation.
- Demonstrate the main action, one unsuccessful action, and your three improvements.

**Submit:** the modified React files, before/after screenshots, three brief justifications, and one example of an AI design suggestion you refined or rejected.

**Evaluation:** We assess usability reasoning, design consistency, preserved functionality, and testing. Using AI is allowed and expected. Cosmetic changes alone are not sufficient.

## Rescue challenge changes

### User goal

Someone who lost an item needs to quickly spot a plausible matching notice and know whether it can actually be recovered from a collection point. Someone reporting a found item needs to choose the right status without suggesting that staff already have the item.

### Three usability problems and fixes

1. **Filters looked like a submit action but were already live.** The old Apply button only displayed a count, so it added a redundant step and gave no ongoing feedback while typing. The board now shows a live matching-report count and offers Clear filters only when a filter is active.
2. **A search with no matches looked like three empty categories.** “Nothing here yet” did not explain that the search caused the empty board or how to recover. A zero-result search now has one clear explanation and a Clear filters action; empty columns in partial results explain whether that status has no matches.
3. **A found report could be confused with staff holding the item.** The receipt note was low-emphasis, and the form did not explain the difference between reporting and handover. Found notices now show prominent, distinct labels for items at a collection point and items reported but not yet received; the form explains Lost, Found, and Claimed and explicitly says a report is not proof of receipt. Validation also shows the specific existing rule that needs attention rather than a generic error.

### Alternatives considered

- **Filters:** Keep Apply and make it truly submit-based, or keep the existing live behavior and remove Apply. Submit-based filtering would make the button truthful but delay feedback; live count plus Clear filters matches the behavior already present and avoids the extra action.
- **No results:** Keep separate empty messages in each status column, or replace them with a single recovery prompt when nothing matches. Separate columns remain useful for partial results, but a global prompt is clearer when all results are empty.
- **Collection handover:** Add a user-operated handover/pickup workflow, or clarify receipt states using the existing demo data. A workflow would imply staff verification the demo cannot provide, so the change sticks to truthful labels and instructions.

**AI suggestion refined/rejected:** An initial idea was to add a “claim this item” or “mark as handed over” action. I rejected that because this browser-only demo cannot verify ownership or confirm staff receipt; a user-controlled action could falsely imply the item is reserved or safely held. I refined the idea into explicit receipt labels and a form explanation, without changing the underlying handover model.

### Demonstration and screenshots

- Before: [before.png](./before.png)
- After: [after.png](./after.png)
- Main action: search for a lost item and compare matching lost/found notices.
- Unsuccessful action: submit a duplicate title at the same location and verify the uniqueness validation explains the conflict.
- Other checks: search for a term with no matches, clear the filters, submit a found report, and confirm the new notice says it has only been reported.
