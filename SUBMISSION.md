# Task 4.4 — UI/UX Rescue Challenge

Repository: https://github.com/Advanced-Computer-Lab-2026/Task-4.4

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by the terminal. `npm run build` produces the production build. This remains a standalone localStorage demo with fictional campus collection points.

## Three usability improvements and justifications

1. **Actionable validation.** A student wants to publish a valid notice. Before, every failure displayed only “Please review your entries”, even though validation knew the cause. Now required fields and duplicate reports receive specific inline explanations, invalid controls are marked accessibly, and focus moves to the first invalid control. Entered values remain available for correction. This reduces guessing and repeated failed submissions.
2. **Clear search and filtering.** A student wants to find a matching notice quickly. Before, filters changed immediately while an Apply button implied another step; an empty result looked like an empty board. Now the interface explicitly says results update as you type, announces a result count, removes the redundant Apply button, shows a selected status in one focused section, and offers an actionable no-results state. Clear filters restores the board. Search still covers title, location and description; category and all three status filters remain available.
3. **Trustworthy recovery guidance.** A student wants to know whether an item can be collected and where to go. Before, receipt metadata was small and provided no next step. Now cards distinguish “Received by campus staff” with the existing collection point from “Reported found only” with unconfirmed custody. Expandable guidance explains verification before collection, or asks the user to confirm receipt before travelling. No claim verification or staff receipt is fabricated. Existing receipt metadata survives editing.

The original visual identity is retained. Text is more legible, controls have visible keyboard focus, and owned notices expose a direct Edit action. “My reports only” makes those notices easier to locate. Other students' reports cannot be edited through the application.

## AI alternatives considered before implementation

See [DESIGN-NOTES.md](DESIGN-NOTES.md) for the pre-implementation comparison and trade-offs.

**Rejected and refined suggestion:** A one-click “Claim this item” button would suggest that ownership had been verified and that staff held the property. This demo has neither a verification workflow nor confirmed custody for every report. The suggestion was refined into contextual “How to recover this item” guidance instead. Lost, found and claimed states remain supported.

## Demonstration

1. **Find a match:** Choose Recently found and search `BACKPACK`. The one matching notice appears immediately. Expand “How to recover this item” to see Campus Security Desk and ownership verification guidance.
2. **Main action succeeds:** Post a report with title `Campus keys`, status Found, category Accessories, location `Engineering foyer`, and any short description. It appears on the board, is identified as your report, persists after reload, and is correctly marked as unconfirmed staff receipt.
3. **Unsuccessful action:** Try publishing title `BLACK BACKPACK`, location `library - second floor`, status Found, category Accessories. The case-insensitive duplicate check rejects it, explains the problem at the title field, and retains the entries. An empty form also explains all three required fields.
4. **Search recovery:** Search `unmatched purple telescope`. The no-results explanation offers Clear filters, which restores all reports.
5. **Edit:** Choose My reports only, edit Calculator, and save. Its original collection-point metadata remains intact. Other students have no edit action.

## Before / after evidence

| Evidence | Screenshot |
| --- | --- |
| Original board | [before-board.png](evidence/before-board.png) |
| Original generic validation failure | [before-validation.png](evidence/before-validation.png) |
| Improved board | [after-board.png](evidence/after-board.png) |
| Specific required-field errors | [after-validation.png](evidence/after-validation.png) |
| Successful report | [after-successful-report.png](evidence/after-successful-report.png) |
| Search match and recovery instructions | [after-search-and-recovery.png](evidence/after-search-and-recovery.png) |
| No-results recovery | [after-no-results.png](evidence/after-no-results.png) |
| Duplicate report rejected | [after-duplicate-rejected.png](evidence/after-duplicate-rejected.png) |
| Received versus reported found items | [after-receipt-states.png](evidence/after-receipt-states.png) |
| Mobile layout, 375 pixels wide | [after-mobile.png](evidence/after-mobile.png) |
| Compact mobile filters and active chips | [after-mobile-active-filters.png](evidence/after-mobile-active-filters.png) |
| Received-item editing guidance | [after-received-edit.png](evidence/after-received-edit.png) |
| Reset confirmation | [after-reset-confirmation.png](evidence/after-reset-confirmation.png) |
| Storage failure and retry | [after-storage-warning.png](evidence/after-storage-warning.png) |

## Validation results

The production build and `git diff --check` passed. Forty-six browser checks passed, including required-field feedback and focus, title length, creating a report, unconfirmed new custody, persistence, combined filters, case-insensitive search and duplicate detection, retained failed entries, author-only editing, status changes, preserved receipt metadata, optional blank fields, confirmed demo reset, mobile filters, keyboard operation, browser-storage failure/retry, and responsive board/form widths. No uncaught browser errors were observed. The machine-readable check list is in [test-results.json](evidence/test-results.json).

The browser checks were run with Playwright and Chrome at widths of 375, 768, 1024 and 1440 pixels. Normal-path test records were removed using the application's confirmed Reset demo data action after evidence capture. Storage failures were simulated in a separate isolated test browser, without changing the user's browser storage.

## Lecture follow-up

All 34 supplied lecture pages were reviewed, including their visual examples. [LECTURE-REVIEW.md](LECTURE-REVIEW.md) maps all six concepts to the project and records the alternatives compared before the follow-up implementation. Changes add shared design tokens, mobile filter disclosure and removable filter chips, a short reset confirmation, recoverable storage errors, grouped form fields, mobile guidance and a full-width primary form action. The received-item edit hint now reflects the existing collection record.

See [CHANGELOG.md](CHANGELOG.md) for the complete history from the starter and the visual comparisons in `evidence/comparison-*.png`. The lecture's travel and booking screens are examples; no travel features or simulated claim verification were added.

## Files changed

- `src/App.jsx`: validation, filters, result feedback, contextual recovery instructions and author-only edit discovery.
- `src/styles.css`: readable text, responsive layouts, receipt indicators and accessible field states.
- `package.json` and `package-lock.json`: compatible official WebAssembly build-tool variants, because this environment blocks native compiler executable downloads. React and the Vite workflow are preserved.
- `LECTURE-REVIEW.md` and `CHANGELOG.md`: lecture mapping, further design alternatives and the complete change history.

The submission includes source, scripts, dependency lock file, screenshots, these justifications, the AI design comparison and check results. Dependencies and Git internals are excluded. GitHub submissions use a personal fork and a pull request to the course repository.
