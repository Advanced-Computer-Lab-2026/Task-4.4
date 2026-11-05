# Testing Checklist

Manual browser checks were completed at `http://localhost:5173/` on 2026-11-05. A production build also completed successfully with `npm run build`.

## Run the app

1. From the project folder, run `npm install` if dependencies are not installed.
2. Run `npm run dev`.
3. Open the local URL printed in the terminal.
4. Use **Reset demo data** before the checks below to start from the example records.

## Scenarios and expected results

| Scenario | Steps | Expected result | Result |
|---|---|---|---|
| Create and persist | Posted a Lost report titled **Persistence Check 443** at **Testing Desk**, then refreshed. | The report appeared in Lost, remained after refresh, and was removed by reset. | Passed |
| Short title validation | Submitted a one-character title after choosing Lost and Electronics. | Submission was blocked; the minimum-two-character message appeared beside the title. | Passed |
| Duplicate validation | Submitted **Black backpack** at **Library - second floor**. | Submission was blocked with the duplicate title/location explanation beside the title. | Passed |
| Edit ownership | Opened the owned **Calculator** report, changed its title to **Calculator edited**, and saved; then opened another student's **Dark backpack** menu. | The owned edit saved and appeared on the board. The other student's menu showed “Reported by another student” and no edit action. | Passed |
| Search and filters | Searched for `calculator`, selected Electronics and Found, then searched for `zzznomatch`. | Live search returned matching notices; combined filters narrowed the list to one found report; no matches showed the recovery message and clear button. | Passed |
| Clear no-results state | Selected **Clear search and filters** from the empty state. | Search and filters reset and the reports returned. | Passed |
| Found collection status | Inspected **Dark backpack**, **Earbuds in blue case**, and **USB flash drive**; also posted a new Found report. | The received backpack named Campus Security Desk and required proof of ownership. Existing reported-only items and the newly created report said collection was unavailable. | Passed |
| Status-specific report buttons | Selected **I lost something** and **I found something** in the header. | The form opened with Lost and Found selected respectively. | Passed |
| Edit and delete own reports | Opened an owned report with **Edit report**; checked that Delete, Go back, and Save share one row; clicked **Delete report**, canceled in the popup, then repeated and confirmed. | The three form actions stay aligned. Delete opens a danger popup; Keep report cancels and Confirm delete removes the report. Other students' cards have no edit or delete controls. | Pending browser check |
| Reset demo | Selected **Reset demo data** after creating test reports. | The board returned to 13 original example reports, removed test entries, and reset filters. | Passed |
| Top navigation | Applied a search, clicked **Missing items**, then clicked **Noticeboard**. | Missing items showed Lost reports; Noticeboard cleared search and filters and restored all 13 reports. | Passed |
| Card status labels | Inspected report cards across Lost, Found, and Claimed columns. | Each card showed the matching Lost, Found, or Claimed icon-and-text badge and colored top edge. | Passed |
| My listings | Clicked **My listings**, then **Noticeboard**. | My listings showed only the three reports owned by You; Noticeboard cleared the owner filter and restored all 13 reports. | Passed |

## Screenshots

Save screenshots in `submission/screenshots/`:

1. Improved main noticeboard with found collection information and Lost/Found/Claimed status badges visible.
2. Report creation form.
3. Short-title validation message visible beside the title field.
4. Found cards showing both an item available at a collection point and a reported-only item.

Original-interface screenshots were present in `screenshots/before/` before implementation. Keep those as the baseline; do not recreate them.

The browser test data was reset after testing. Screenshots are saved under `submission/screenshots/before/` and `submission/screenshots/after/`.
