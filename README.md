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

# UI/UX Lab Implementation & Justifications: Task 4.4

## 1. Executive Summary & Overview
This pull request resolves three core usability and functional bugs within the campus noticeboard application (`App.jsx`). The modifications focus on state management decoupling, interactive navigational accessibility, and proactive duplicate submission prevention.

---

## 2. Before & After Visual Verification

| Feature Scope | Before (Original Defect) | After (Implemented Fix) |
| :--- | :--- | :--- |
| **Filter Execution** | Selecting a category or typing immediately re-rendered the board, rendering the **Apply** button redundant. | Input fields update temporary `draftFilters` state. The board re-renders only when **Apply** is clicked. |
| **Header Navigation** | Navigation headers (*Noticeboard*, *Missing items*, *Recently found*) were static visual text labels. | Converted header labels into functional `<button>` elements that execute filtered navigation states directly. |
| **Duplicate Prevention** | Users could create duplicate entries without prior feedback before submitting. | Real-time `similarItems` matching renders an amber warning panel inside the form when a matching title exists. |

*Artifact Screenshots required for final submission package:*
1. **Main Action:** Post a valid item report and capture the published card on the board.
2. **Unsuccessful Action:** Attempt submitting a report with a 1-character title to trigger the red validation error state.
3. **After View:** Capture the main board view showing active header link states and working draft filter controls.

---

## 3. Detailed Justification of Design Changes

### Fix 1: Decoupling Draft Sidebar Inputs from Board State
* **Problem:** The original implementation bound sidebar input `onChange` handlers directly to the active query state. This resulted in continuous, expensive re-renders on every keystroke and select change, making the physical **Apply** button completely non-functional and confusing to users.
* **Solution:** Split filter state into `draftFilters` (UI control state) and `appliedFilters` (active array evaluation state). `useMemo` now evaluates filtered array results strictly against `appliedFilters`. The **Apply** button copies `draftFilters` into `appliedFilters`, restoring predictable batch-filtering UX.

### Fix 2: Converting Static Header Text to Interactive Navigation Controls
* **Problem:** Header labels (*Noticeboard*, *Missing items*, *Recently found*) looked like clickable tab navigation but were rendered as un-interactive `<span>` elements, violating user expectations and basic affordance principles.
* **Solution:** Replaced static spans with semantic `<button>` elements connected to a dedicated `handleNavFilter` handler. Clicking a header link atomically syncs both `draftFilters` and `appliedFilters` to the target status (`all`, `lost`, or `found`) while navigating the view back to `'board'`.

### Fix 3: Real-Time Pre-Submit Duplicate Match Suggestions
* **Problem:** Duplicate check logic previously ran only inside `validate()` upon form submission, throwing a harsh blocking error after the user had already filled out all fields.
* **Solution:** Implemented a real-time `similarItems` `useMemo` computation evaluating `form.title` and `form.location` against current noticeboard records. If a substring match is detected while typing, a contextual amber warning box appears directly above the status field, providing immediate visibility before form submission.

---

## 4. AI Design Suggestion Evaluation & Refinement

* **AI Suggestion Received:** Auto-disabling the "Publish notice" submit button whenever the real-time duplicate warning box detects potential matching items on the noticeboard.
* **Evaluation & Decision:** **Rejected and Refined.** 
  * *Reasoning:* Strict title matching can easily flag false positives (e.g., multiple students reporting distinct "Black backpack" instances lost in different campus buildings on different days). Hard-blocking submission based on keyword similarity degrades user agency and prevents valid reports.
  * *Refinement Implemented:* Kept the submit button fully operational and repurposed the match indicator into an informational warning banner (`⚠️ Matching notices already on board`). This alerts the user to double-check existing notices without blocking legitimate submissions.

---

## 5. Modified Files Manifest
* `src/App.jsx` — Complete implementation of draft filter state, header navigation handlers, and real-time duplicate warning evaluation.
* `src/main.jsx` — Application mounting point.
* `index.html` — HTML shell configured to load `/src/main.jsx`. <img width="1440" height="900" alt="Screenshot 1448-05-25 at 2 39 06 PM" src="https://github.com/user-attachments/assets/a6b2f507-398b-4710-9046-8e18a59b96b5" />

* <img width="1440" height="900" alt="Screenshot 1448-05-25 at 2 39 17 PM" src="https://github.com/user-attachments/assets/a7a3cb79-4e2b-4bf3-86bf-ba73ecc1f9ac" />


