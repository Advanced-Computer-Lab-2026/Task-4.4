# Campus Lost & Found — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

The terminal prints **one local URL**. Open that link in your normal external browser. The development server will **not** open a browser automatically. Press `Ctrl+C` to stop it.

## Functional brief

Users browse, search and filter item reports, create reports, edit and delete only their own reports, and reset the demo records. Reports have lost, found and claimed states. The same title at the same location may not be reported twice. Some found items have been handed to fictional campus collection points; others have only been reported. A reported item is not automatically confirmed as being held by staff.

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
