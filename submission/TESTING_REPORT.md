# Testing Report

All tests below were actually run. Environment: Windows 11, Node 26, Vite 5, headless Chrome driven over the DevTools protocol with real mouse and keyboard events. No packages were added.

## How to reproduce

```bash
npm test                      # 18 logic tests
npm run build                 # production build
npm run dev                   # then, in submission/evidence:
node e2e-check.mjs http://localhost:5173/ ../screenshots/after
node contrast-check.mjs
```

## Results

| Check | Result | Output file |
|---|---|---|
| Unit tests (`npm test`) | 18 passed, 0 failed | `evidence/unit-test-results.txt` |
| `npm run build` | succeeded | `evidence/build-results.txt` |
| Browser checks, dev server | 118 passed, 0 failed | `evidence/e2e-results-dev.txt` |
| Browser checks, production build | 118 passed, 0 failed | `evidence/e2e-results-build.txt` |
| Contrast (WCAG AA 4.5:1) | all 16 colour pairs pass | `evidence/contrast-results.txt` |
| Browser console | no errors or warnings | in e2e output |

There is no lint script in the project and I did not add one.

## Coverage

- **Browsing:** 13 example records load, newest first.
- **Search:** word-order tolerant, covers category and collection point, "similar reports" tier, empty state with actions.
- **Filtering:** each status, each of the five categories, "Your reports only", combined filters, Clear.
- **Successful actions:** lost report and found report (blank optional fields use the original fallbacks), same title at a different location allowed, edit of own report saved.
- **Unsuccessful actions:** empty submit (3 field errors), 1-character title, spaces-only title, duplicate title+location (case and spacing ignored), duplicate when editing. Nothing is saved in any of these.
- **Ownership:** Edit appears only on your reports (counted against stored data); other cards say "Reported by another student".
- **Custody wording:** every seeded found report checked. Only `received` records with a collection point say "Received at …"; others never name a desk.
- **Persistence:** new reports and edits survive a refresh. Corrupt localStorage falls back to the example records.
- **Reset demo:** asks first, "Keep my data" leaves reports, "Yes, reset" restores the exact seed records (deep-equal) and clears filters.
- **Responsive:** 320, 375, 390, 768, 1024, 1440 and 1920px. Board, compare dialog and form fit with no horizontal overflow. Touch controls are at least 40px at 390px. Smallest text is 13px.
- **Keyboard:** Tab order, Enter submits the form, Escape closes the dialog and focus returns to its button.

## Errors found and fixed during testing

| # | Problem found | How it was found | Fix |
|---|---|---|---|
| 1 | `npm test` failed 1 of 18: I expected 6 electronics results, there are 5 | first test run | My expected number was wrong; corrected to 5 |
| 2 | Search icon overlapped the placeholder text | screenshot review | CSS selector narrowed to `input[type=search]` |
| 3 | "Reported by another student" sat cramped in the action row | screenshot review | Moved into the card's detail list; the action row now holds only actions |
| 4 | Hero was cramped at desktop and too tall on phones | screenshot review | Rebalanced columns; tighter mobile hero, path cards and toolbar |
| 5 | Brand button was only 38px tall, below the 40px touch target | e2e check | `min-height:44px` |
| 6 | Form page had no `main#main`, so the skip link target was missing | accessibility tree review | Added `id="main"` to the form page |
| 7 | Status tabs too tight at very narrow widths | 320px layout check | Two-column tabs under 380px |
| 8 | "Cancel" after editing should return to the same scroll position | e2e failure (966 vs 1123) | The app was correct; my test measured before the driver centred the target. Test fixed and re-run |
| 9 | Enter key check failed | e2e failure | Test driver sent the wrong key event type; fixed in `cdp.mjs`. The app was correct |
| 10 | Test driver crashed on load | my edit put a raw carriage return in the file | Replaced with `String.fromCharCode(13)` |

Items 8 to 10 were faults in my test tooling, not in the app. They are listed so the log is complete.

## Not done

- Screen-reader testing (NVDA/VoiceOver) was not performed. Accessibility was checked through the accessibility tree, contrast math and keyboard operation only.
- Only Chrome was tested. Safari and Firefox were not.
- The Google Fonts import needs internet. Offline, the app falls back to system fonts.
- Dragging a lost report onto a found one, notifications, and real handover recording do not exist. They are outside the brief and were not simulated.

## Screenshots

`screenshots/before/` (14 images from the original) and `screenshots/after/` (23 images from the redesign), captured from the running app. Matching pairs: `01` board, `02/03` search, `04` filter, `05–07` form and errors, `08–09` after posting, `10` ownership, `11/12` mobile.
