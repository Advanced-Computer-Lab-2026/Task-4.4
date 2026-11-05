# UX Justifications

## 1. Put validation guidance beside the field that needs attention

**User goal:** Submit an accurate lost, found, or claimed report without having to guess what the form needs.

**Original problem:** The app checked the title length, required category and status, and duplicate title/location pair, but all failures showed the same generic message. A student could not tell which entry needed correction.

**Why it hurts usability:** The form makes the user diagnose an error the app already knows how to identify. That adds retries and can make a valid rule, such as the duplicate check, feel arbitrary.

**Alternatives considered:**

- Show a field-specific message beside the affected input and visually mark that input. Advantage: the correction is clear and the message stays in context. Disadvantage: needs a little more form layout and state handling.
- Keep one form-level alert with a more detailed explanation. Advantage: minimal layout change. Disadvantage: users still need to locate the relevant field themselves.

**Chosen solution:** Show the actionable message under the title, status, or category input that failed, mark the input invalid, and clear the message when that field is edited. Duplicate-title/location errors point back to the title and explain how to proceed.

**Why this is better:** The app uses the validation result to guide the next action while keeping all existing validation and ownership rules.

## 2. Make found-item recovery status prominent on each report

**User goal:** Decide whether a found item can actually be collected and where to go.

**Original problem:** Found reports had a small muted note saying an item was received at a collection point, or that it was not confirmed there. The distinction was easy to miss while scanning cards.

**Why it hurts usability:** A student might travel to a desk for an item that has only been reported, or fail to notice a real collection location. A found notice also should not imply that staff have custody of an item.

**Alternatives considered:**

- Put a prominent status panel on each found report, naming the collection point when received and stating that ownership is verified before release. For reports not received, state that collection is not available yet. Advantage: recovery information stays with the specific item. Disadvantage: adds a few lines to found cards.
- Put one general explanation above the board. Advantage: uses less space on cards. Disadvantage: does not tell the user the status or location of a particular item.

**Chosen solution:** Add a clear per-card message: **Available at [collection point]** with an ownership-verification reminder, or **Reported found · not at a collection point** with an explicit note that collection is not yet available. Claimed reports say the item has been returned. Each report card also displays its status as an icon-and-text badge—Lost, Found, or Claimed—with a matching colored top edge.

**Why this is better:** The message is tied to the item and accurately reflects handover metadata. The badge and card accent make report type clear while scanning. New found reports remain marked as reported only unless a collection point is recorded as having received them.

## 3. Give users a recovery action when no reports match

**User goal:** Find a relevant notice and recover quickly if the current search or filters return nothing.

**Original problem:** Each status column showed “Nothing here yet” when empty. That wording did not explain whether the category itself had no reports or the active search and filters had excluded all reports.

**Why it hurts usability:** Users can mistake a filtered view for an empty noticeboard and may not know how to get back to the full set of reports.

**Alternatives considered:**

- Show a board-level **No matching reports** message and a **Clear search and filters** action when the complete filtered result is empty. Advantage: explains the state and offers a direct recovery. Disadvantage: adds a message above the columns.
- Keep the per-column empty messages and add general help text. Advantage: smaller change. Disadvantage: still leaves the user to figure out how to recover.

**Chosen solution:** Add the board-level empty-results message and one-click clear action when no reports match. Preserve the per-column “Nothing here yet” messages when some reports match but a particular status column has none.

**Why this is better:** It distinguishes no search matches from an empty status column and makes the next step clear.

## Additional refinement: shortcuts for lost and found reports

**User goal:** Start the right kind of report with as few steps as possible.

**Usability problem:** A student had to choose a general report action, then select Lost or Found in the form. The status choice is central to the report and can be an unnecessary step when the student's intent is already clear.

**Alternatives considered:**

- Add separate **I lost something** and **I found something** buttons that preselect the corresponding status. Advantage: the action is direct and reduces form setup. Disadvantage: uses more header space.
- Keep one general report button and require a status selection in the form. Advantage: simpler header. Disadvantage: adds a step and can lead to a mismatched status.

**Chosen solution:** Provide both status-specific buttons in the header, with the existing general report entry point retained elsewhere in the interface. Each button opens a fresh form with the matching status selected.

**Why this is better:** It makes the first action match the student's intent and retains the ability to change the status in the form if needed.

## Additional refinement: make owner actions visible and confirm deletion

**User goal:** Update or remove a report they own, while avoiding accidental deletion and protecting other students' reports.

**Usability problem:** Editing was tucked into a card's overflow menu, and there was no delete action. The edit option was harder to discover, and owners had no way to remove an outdated report.

**Alternatives considered:**

- Show **Edit report** directly on reports owned by the signed-in user and place **Delete report** at the far left of the edit form's action row, with a warning shown before confirmation. Advantage: editing is easy to find and deletion requires a deliberate two-step action. Disadvantage: deleting requires opening the report first.
- Keep edit in the overflow menu and omit deletion. Advantage: keeps cards visually simpler. Disadvantage: hides an important action and leaves outdated reports in the noticeboard.

**Chosen solution:** Owned cards show a visible edit control. On the edit screen, **Delete report** sits at the far left of the action row, separated from Save and Go back. The first click opens a danger confirmation popup with **Confirm delete** and **Keep report** actions. Other students' cards do not show edit or delete controls, and the ownership check is retained in the action handlers.

**Why this is better:** Owners can manage their own reports quickly, while the confirmation step helps prevent accidental removal and ownership restrictions remain enforced.

## Additional refinement: add a My listings view

**User goal:** Find and manage all reports they have posted without searching through other students' notices.

**Usability problem:** Owned reports were mixed into the same status columns as all other reports, so users had to scan the full board to find their own entries.

**Alternatives considered:**

- Add a **My listings** top-navigation filter that clears other filters and shows only reports owned by the signed-in user. Advantage: one direct action reaches all of the user's reports. Disadvantage: adds another navigation item.
- Ask users to search for each item title or inspect owner controls card by card. Advantage: no new navigation item. Disadvantage: users must remember report titles or scan the board manually.

**Chosen solution:** Add **My listings** to the top navigation. It clears search, category, and status filters, then shows all reports owned by **You**. **Noticeboard** clears the owner filter and restores all reports.

**Why this is better:** Users can reach every report they own in one step, and there is a clear path back to the full board.
