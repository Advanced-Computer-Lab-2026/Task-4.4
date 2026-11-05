# UX Rescue Challenge Submission

## User goal

The main user goal is to quickly find a lost item or report an item that was found, then move through the recovery process with clear feedback. A person searching for an item should be able to narrow the noticeboard confidently, recognize whether a found report may be theirs, and start a claim without creating an incorrect duplicate report.

## Three UX problems and improvements

### 1. Filters changed results before clicking Apply

**Problem:** Editing the search, category, or status controls immediately changed the noticeboard, even though the interface included an **Apply** button.

**Why this hurts usability:** The interface suggests that users can prepare several filter choices and review them before applying. Immediate updates make the Apply button misleading and make it harder to compare or correct filter choices, especially when a result disappears while the user is still editing the controls.

**Improvement:** Filter controls now keep draft values separate from active values. Results update only after **Apply** is clicked. **Clear** resets both the controls and the displayed results.

### 2. Users could not claim another student's found report

**Problem:** The three-dot menu on another student's found report only displayed “Reported by another student.” There was no action for a person who believed the item was theirs.

**Why this hurts usability:** A likely owner has no clear next step. They may create a second report and choose a status manually, producing duplicate or misleading records instead of connecting their claim to the existing found item.

**Improvement:** Found reports created by another student now include **Claim this item** in the three-dot menu. The claim updates the existing report rather than creating a duplicate.

### 3. The form allowed unverified users to select Claimed

**Problem:** The report form included **Claimed** as a status that could be selected when creating or editing a report.

**Why this hurts usability:** Claiming is an ownership outcome, not a normal report type. Allowing users to select it directly bypasses the campus verification and collection process described in the brief, and it can make an item appear recovered without evidence.

**Improvement:** **Claimed** was removed from the normal report form. A user must use **Claim this item** on a found report, provide an identifying ownership detail, and confirm that campus staff can verify it before the report changes to Claimed.

### Additional refinement: status filters showed unrelated columns

**Problem:** Selecting one status, such as Lost, Found, or Claimed, filtered the cards but still left the other empty status columns visible.

**Why this hurts usability:** The user has already chosen the status they want to focus on, so the unrelated columns add visual noise and make the result feel incomplete. Empty columns can also make the user wonder whether the filter worked.

**Improvement:** When a specific status is applied, the board now shows only that status column. When **All statuses** is selected, all three columns remain visible.

## AI suggestions and trade-offs

### Rejected suggestion

AI suggested replacing the repeated “Nothing here yet” messages with a single empty state: “No reports match these filters,” alongside a **Clear filters** action.

I rejected this suggestion because the empty columns are not currently a meaningful usability problem for this demo. The three columns communicate the separate lost, found, and claimed states, and “Nothing here yet” is understandable within each column. The more serious problem was that the Apply button did not control filtering as its label suggested.

### Alternatives considered

**Claiming:** A simple claim button could immediately change the status, or a verification dialog could appear first. Immediate claiming is faster, but it does not support the stated ownership-verification requirement. I chose the verification dialog because it adds a clear checkpoint while keeping the demo workflow usable.

**Filtering:** The Apply button could be removed and live filtering could remain, or Apply could become a deliberate commit action. Removing Apply would be simpler, but it changes the existing interaction model. Separating draft and applied filters preserves the existing controls and makes their behavior match their labels.

## Demonstration

### Main action

1. Open the noticeboard and choose a search term, category, or status.
2. Click **Apply** and show that the board updates to the selected filters.
3. Open the three-dot menu on another student's found report.
4. Choose **Claim this item**.
5. Enter an identifying ownership detail and confirm the verification statement.
6. Submit the claim and show that the existing report moves to the Claimed column.
7. Apply a Lost, Found, or Claimed status filter and show that only the selected column remains visible.

### Unsuccessful action

Open the report form and try to select **Claimed**. It is not available because claimed status must be reached through the verification flow. In the claim dialog, submitting without an ownership detail or confirmation is also disabled.

## Modified files

- `src/App.jsx` — applied-filter behavior, status-column visibility, claim action, verification dialog, and protected Claimed status.
- `src/styles.css` — styling for the ownership-verification dialog.

## Screenshots
Included in the folder

- Before: filter controls and a found report's three-dot menu.
- After: filters waiting for Apply, the Claim this item action, and the ownership-verification dialog.
